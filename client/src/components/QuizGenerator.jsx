// components/QuizGenerator.jsx
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import QuizPreview from "./QuizPreview";
import { BASE_URL } from "@/app/constant";

const QuizGenerator = ({ courseId, lectureId, compact = false }) => {
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizData, setQuizData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setQuizData(null);

    try {
      const response = await axios.post(`${BASE_URL}/api/ai/generate-quiz`, {
        courseId,
        lectureId,
        numQuestions,
      });

      // Check if response has the expected structure
      if (response.data?.success && response.data?.data?.questions) {
        // Create a copy of the quiz data without answers for preview
        const previewData = {
          ...response.data.data,
          questions: response.data.data.questions.map(question => ({
            ...question,
            // Remove the correctAnswer field or set it to null for preview
            correctAnswer: undefined
          }))
        };
        setQuizData(previewData);
      } else {
        throw new Error("Invalid quiz data format");
      }
    } catch (err) {
      console.error("Quiz generation error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to generate quiz"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${compact ? "" : "p-2"}`}>
      {!compact && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>AI-powered quiz generation</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <select
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          className="p-2 border rounded-md text-sm"
        >
          {[3, 5, 10].map((num) => (
            <option key={num} value={num}>
              {num} questions
            </option>
          ))}
        </select>

        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          size={compact ? "sm" : "default"}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Quiz"
          )}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm p-2 rounded bg-red-50 dark:bg-red-900/20">
          {error}
        </div>
      )}

      {isLoading && !quizData && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p>Generating your quiz questions...</p>
        </div>
      )}

      {quizData?.questions ? (
        <div className={`mt-4 ${compact ? "text-sm" : ""}`}>
          <QuizPreview
            questions={quizData.questions}
            lectureTitle={quizData.title || "Generated Quiz"}
            compact={compact}
            showAnswers={false} // Ensure answers are hidden by default
          />
        </div>
      ) : (
        !isLoading &&
        !error && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <p>Click "Generate Quiz" to create questions</p>
          </div>
        )
      )}
    </div>
  );
};

export default QuizGenerator;