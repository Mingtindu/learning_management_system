import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const searchHandler = (e) => {
    e.preventDefault();
    if(searchQuery.trim() !== ""){
      navigate(`/course/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const exploreCourses = () => {
    navigate("/course/search");
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-gray-900 dark:to-gray-800 py-28 px-4 text-center overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-white mix-blend-overlay"></div>
        <div className="absolute bottom-10 right-20 w-60 h-60 rounded-full bg-indigo-400 mix-blend-overlay"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-white text-5xl font-bold mb-6 leading-tight">
          Transform Your Future <br className="hidden sm:block" />With Expert-Led Courses
        </h1>
        
        <p className="text-blue-100 dark:text-blue-200 text-xl mb-10 max-w-2xl mx-auto">
          Join thousands of learners worldwide and gain in-demand skills with our comprehensive learning platform.
        </p>

        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row justify-center items-center gap-4 mb-10">
          <form onSubmit={searchHandler} className="flex-1 max-w-2xl">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-blue-300 dark:border-gray-700">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to learn today?"
                className="flex-grow border-none focus-visible:ring-0 px-6 py-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-lg"
              />
              <Button 
                type="submit" 
                className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white px-8 py-4 rounded-lg transition-all duration-300"
              >
                Search
              </Button>
            </div>
          </form>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            onClick={exploreCourses}
            className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 shadow-md"
          >
            Browse All Courses
          </Button>
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white/10 dark:hover:bg-gray-700 font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300"
          >
            Popular Topics
          </Button>
        </div>

        <div className="mt-12 flex justify-center space-x-6 text-blue-100 dark:text-blue-200">
          <div className="text-center">
            <div className="text-3xl font-bold">10,000+</div>
            <div className="text-sm">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">500+</div>
            <div className="text-sm">Expert Instructors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">1M+</div>
            <div className="text-sm">Students Enrolled</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;