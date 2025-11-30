import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Course from "./Course";
import { useGetRecommendedCourseQuery } from "@/features/api/courseApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RocketIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useInView } from "react-intersection-observer";

const RecommendedCourse = () => {
  const { data, isLoading, isError, error, refetch } = useGetRecommendedCourseQuery();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section ref={ref} className="bg-gradient-to-b from-gray-50 to-white dark:from-[#0f0f0f] dark:to-[#141414] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-yellow-500 fill-yellow-300 animate-pulse" />
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-500">
              Recommended For You
            </h2>
            <Sparkles className="h-8 w-8 text-yellow-500 fill-yellow-300 animate-pulse delay-100" />
          </div>
          <p className="mt-2 max-w-2xl text-lg text-gray-600 dark:text-gray-300 mx-auto">
            Courses tailored to your learning preferences and history
          </p>
        </motion.div>

        <AnimatePresence>
          {isError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto"
            >
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Error loading recommendations</AlertTitle>
                <AlertDescription>
                  {error?.data?.message || 'Failed to fetch recommended courses'}
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={refetch}
                      className="hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Try Again
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          ) : isLoading ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <CourseSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : data?.recommendedCourses?.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {data.recommendedCourses.map((course) => (
                <motion.div 
                  key={course._id} 
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <Course 
                    course={course} 
                    showRecommendationBadge
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <Alert className="border-amber-500/30 bg-amber-50 dark:bg-amber-900/10">
                <RocketIcon className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-900 dark:text-amber-200">
                  No recommendations yet
                </AlertTitle>
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  Complete some courses or update your preferences to get personalized recommendations
                  <div className="mt-4 space-x-3">
                    <Button 
                      variant="outline" 
                      className="border-amber-500 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      onClick={() => window.location.reload()}
                    >
                      Refresh
                    </Button>
                    <Button 
                      variant="default" 
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                      asChild
                    >
                      <Link to="/courses">
                        Browse Courses
                      </Link>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const CourseSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700 h-full"
    >
      <Skeleton className="w-full aspect-video rounded-t-xl" />
      <div className="p-5 space-y-4">
        <Skeleton className="h-6 w-full" />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </motion.div>
  );
};

export default RecommendedCourse;