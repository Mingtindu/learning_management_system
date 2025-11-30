import { Lecture } from "../models/lecture.model.js";
import { Course } from "../models/course.model.js";
import { generateGeminiResponse } from "../utils/geminiClient.js";

// Helper function to extract JSON from Gemini's response
const extractJsonFromResponse = (response) => {
  // Try to find JSON in the response (Gemini sometimes wraps JSON in markdown)
  const jsonMatch = response.match(
    /```json\n([\s\S]*?)\n```|```\n([\s\S]*?)\n```|({[\s\S]*})/
  );
  if (jsonMatch) {
    return jsonMatch[1] || jsonMatch[2] || jsonMatch[3];
  }
  return response;
};

export const generateQuizFromLecture = async (req, res) => {
  const { courseId, lectureId, numQuestions = 5 } = req.body;

  try {
    let content = "";
    let title = "";
    let source = "";

    if (lectureId) {
      const lecture = await Lecture.findById(lectureId).select("lectureTitle");
      if (!lecture) throw new Error(404, "Lecture not found");
      title = lecture.lectureTitle;
      source = "lecture";
      content = `Lecture: ${lecture.lectureTitle}`;
    } else {
      const course = await Course.findById(courseId)
        .select("courseTitle subTitle description lectures")
        .populate("lectures", "lectureTitle");

      if (!course) throw new Error(404, "Course not found");

      title = course.courseTitle;
      source = "course";
      content = [
        `Course: ${course.courseTitle}`,
        `Subtitle: ${course.subTitle || "No subtitle"}`,
        `Description: ${course.description || "No description"}`,
        "Lectures:",
        ...course.lectures.map((lecture) => `- ${lecture.lectureTitle}`),
      ].join("\n");
    }

    const prompt = `Generate ${numQuestions} quiz questions in valid JSON format based on:
    
    Title: ${title}
    Content:
    ${content}

    Requirements:
    - Return ONLY valid JSON array format
    - Each question object must have:
      * question (string)
      * options (array of 4 strings)
      * answer (string matching one option exactly)
      * difficulty ("Easy", "Medium", or "Hard")
      * taxonomyLevel (Bloom's taxonomy)
    - Example format:
    [
      {
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "answer": "...",
        "difficulty": "Medium",
        "taxonomyLevel": "Understand"
      }
    ]`;

    const aiResponse = await generateGeminiResponse(prompt);
    const cleanResponse = extractJsonFromResponse(aiResponse);

    try {
      const quizData = JSON.parse(cleanResponse);

      if (!Array.isArray(quizData)) {
        throw new Error("AI response was not an array");
      }

      // Validate each question
      const validatedQuiz = quizData.map((item, index) => {
        if (!item.question || !item.options || !item.answer) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }

        return {
          question: item.question.toString(),
          options: item.options.map((opt) => opt.toString()),
          answer: item.answer.toString(),
          difficulty: ["Easy", "Medium", "Hard"].includes(item.difficulty)
            ? item.difficulty
            : "Medium",
          taxonomyLevel: item.taxonomyLevel || "Understand",
        };
      });

      res.json({
        success: true,
        data: {
          questions: validatedQuiz,
          source,
          title,
          totalQuestions: validatedQuiz.length,
        },
      });
    } catch (parseError) {
      console.error("Raw AI Response:", aiResponse);
      console.error("Parsing Error:", parseError);
      throw new Error(
        400,
        `Failed to parse quiz data. Please try again. Error: ${parseError.message}`
      );
    }
  } catch (error) {
    console.error("Quiz Generation Error:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(500, error.message || "Quiz generation failed");
  }
};
