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

export const generateGeminiResponse = async (promptText, context = {}) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  // Get database schema information
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
