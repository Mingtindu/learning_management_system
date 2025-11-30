import { BASE_URL } from '@/app/constant';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const quizApi = createApi({
  reducerPath: 'quizApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${BASE_URL}/api/ai/` }),
  endpoints: (builder) => ({
    generateQuiz: builder.mutation({
      query: (body) => ({
        url: '/generate-quiz',
        method: 'POST',
        body,
      }),
    }),
    saveQuiz: builder.mutation({
      query: (body) => ({
        url: '/quizzes/save',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { 
  useGenerateQuizMutation, 
  useSaveQuizMutation 
} = quizApi;