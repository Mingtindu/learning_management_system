import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const QuizPreview = ({ questions, lectureTitle, compact = false }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showCompactQuiz, setShowCompactQuiz] = useState(false);

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSaveQuiz = async () => {
    try {
      // Uncomment when you have saveQuiz implemented
      // await saveQuiz({
      //   lectureTitle,
      //   questions,
      //   userAnswers: selectedAnswers,
      // }).unwrap();
      toast.success("Quiz saved successfully");
    } catch (error) {
      toast.error(error.message || "Failed to save quiz");
    }
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <Button 
            variant="ghost" 
            onClick={() => setShowCompactQuiz(!showCompactQuiz)}
            className="justify-between w-full"
          >
            <span>View Generated Quiz ({questions.length} questions)</span>
            <span>{showCompactQuiz ? '▲' : '▼'}</span>
          </Button>
        </CardHeader>
        {showCompactQuiz && (
          <CardContent>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={idx} className="pb-3 border-b last:border-0">
                  <h4 className="font-medium">{q.question}</h4>
                  <div className="mt-2 space-y-1">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`text-xs p-2 rounded ${
                          submitted && q.answer === opt
                            ? "bg-green-50 dark:bg-green-900/20"
                            : submitted && selectedAnswers[idx] === opt && q.answer !== opt
                            ? "bg-red-50 dark:bg-red-900/20"
                            : "bg-muted"
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  {submitted && q.explanation && (
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {!submitted && (
              <Button 
                className="w-full mt-4" 
                onClick={() => setSubmitted(true)}
              >
                Check Answers
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Quiz: {lectureTitle}</h3>
          <div className="flex gap-2">
            <Badge variant="outline">
              Question {currentQuestion + 1}/{questions.length}
            </Badge>
            <Badge variant="secondary">
              {questions[currentQuestion]?.difficulty || "Medium"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">
              {questions[currentQuestion]?.question}
            </h4>
            <div className="space-y-2">
              {questions[currentQuestion]?.options?.map((option, idx) => {
                const isCorrect = questions[currentQuestion].answer === option;
                const isSelected = selectedAnswers[currentQuestion] === option;
                const showFeedback = submitted && (isCorrect || isSelected);

                return (
                  <div
                    key={idx}
                    onClick={() =>
                      !submitted && handleAnswerSelect(currentQuestion, option)
                    }
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      !submitted
                        ? "hover:bg-gray-50 dark:hover:bg-gray-700"
                        : isCorrect
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200"
                        : isSelected && !isCorrect
                        ? "bg-red-50 dark:bg-red-900/20 border-red-200"
                        : ""
                    } ${
                      !submitted && isSelected
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {showFeedback &&
                        (isCorrect ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : isSelected ? (
                          <X className="h-4 w-4 text-red-500" />
                        ) : null)}
                      {option}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {submitted && questions[currentQuestion]?.explanation && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Explanation:</span>{" "}
                {questions[currentQuestion].explanation}
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion((prev) => prev - 1)}
            >
              Previous
            </Button>

            {currentQuestion < questions.length - 1 ? (
              <Button onClick={() => setCurrentQuestion((prev) => prev + 1)}>
                Next
              </Button>
            ) : (
              <Button
                onClick={() =>
                  submitted ? handleSaveQuiz() : setSubmitted(true)
                }
                variant={submitted ? "default" : "primary"}
              >
                {submitted ? "Save Quiz" : "Submit Answers"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizPreview;