import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js"; // Import your User model
import { Lecture } from "../models/lecture.model.js"; // Import your Lecture model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a db object to hold all your models
const db = {
  User,
  Course,
  Lecture,
  // Add other models as needed
};

// Function to get schema information from your models
const getModelSchemas = async () => {
  const models = {
    User: db.User.schema.obj,
    Course: db.Course.schema.obj,
    Lecture: db.Lecture.schema.obj,
    // Add all relevant models
  };
  return JSON.stringify(models, null, 2);
};

const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Helper function to extract first line or heading from HTML description
const getShortDescription = (html) => {
  if (!html) return "No description available";

  // Try to get content from first <h1>, <h2>, or <p> tag
  const headingMatch = html.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
  if (headingMatch) return stripHtml(headingMatch[1]);

  const paragraphMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (paragraphMatch) return stripHtml(paragraphMatch[1]);

  // Fallback to first 100 chars of stripped HTML
  return stripHtml(html).substring(0, 100) + "...";
};

// Improved function to fetch available courses from database
const fetchAvailableCourses = async () => {
  try {
    const courses = await db.Course.find({})
      .select("title description instructor duration -_id")
      .lean(); // Convert to plain JS objects

    return courses.map((course) => ({
      title: course.title || "Untitled Course",
      duration: course.duration || "Duration not specified",
      instructor: course.instructor || "Instructor not specified",
      description: getShortDescription(course.description),
      fullDescription: stripHtml(course.description || ""),
    }));
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

// Helper function to fetch lectures for a specific course
const fetchCourseLectures = async (courseTitle) => {
  try {
    const lectures = await db.Lecture.find({ course: courseTitle }).select(
      "title description duration order -_id"
    );
    return lectures;
  } catch (error) {
    console.error("Error fetching lectures:", error);
    return [];
  }
};

export const generateGeminiResponse = async (promptText, context = {}) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  // Check if user is asking about available courses

  if (
    promptText.toLowerCase().includes("which course") ||
    promptText.toLowerCase().includes("available course") ||
    promptText.toLowerCase().includes("list course")
  ) {
    const courses = await fetchAvailableCourses();
    if (courses.length > 0) {
      let response = "Here are the available courses:\n\n";
      courses.forEach((course) => {
        response += `- ${course.title} (Duration: ${course.duration})\n`;
        response += `  Instructor: ${course.instructor}\n`;
        response += `  Description: ${course.description}\n\n`;
      });
      return response;
    } else {
      return "Currently, there are no courses available. Please check back later.";
    }
  }

  // Check if user is asking about lectures in a course
  if (
    promptText.toLowerCase().includes("lecture") &&
    (promptText.toLowerCase().includes("course") ||
      promptText.toLowerCase().includes("in"))
  ) {
    // Extract course title from prompt (this is a simple approach - might need enhancement)
    const courseMatch = promptText.match(/in (.+?) course|for (.+?) course/i);
    const courseTitle = courseMatch ? courseMatch[1] || courseMatch[2] : null;

    if (courseTitle) {
      const lectures = await fetchCourseLectures(courseTitle);
      if (lectures.length > 0) {
        let response = `Lectures for ${courseTitle} course:\n\n`;
        lectures
          .sort((a, b) => a.order - b.order)
          .forEach((lecture) => {
            response += `- Lecture ${lecture.order}: ${lecture.title}\n`;
            response += `  Duration: ${lecture.duration}\n`;
            response += `  Description: ${lecture.description}\n\n`;
          });
        return response;
      } else {
        return `No lectures found for the ${courseTitle} course.`;
      }
    }
  }

  // For other queries, use Gemini with schema and context
  const schemaInfo = await getModelSchemas();

  // Construct enhanced prompt with context
  const enhancedPrompt = `
  You are an AI assistant for an LMS platform. Below is the database schema and any additional context.

  Database Schema:
  ${schemaInfo}

  User Context:
  ${
    context.user
      ? JSON.stringify(context.user, null, 2)
      : "No user context provided"
  }

  Current Query:                                                                                                                                                                                                                                                            
  ${promptText}

  Instructions:
  1. Provide accurate responses based on the database schema
  2. If asking about courses or content, consider the relationships between models
  3. For user-specific queries, use the provided context
  4. Be concise but thorough in explanations
  5. If you need more information to answer properly, say so

  Response:
  `;

  try {
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error processing your request. Please try again later.";
  }
};
