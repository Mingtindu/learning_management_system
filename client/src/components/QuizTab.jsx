// components/QuizTab.jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuizGenerator from "./QuizGenerator";

const QuizTab = ({ courseId, lectures }) => {
  return (
    <Tabs defaultValue="generate" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="generate">Generate Quiz</TabsTrigger>
        <TabsTrigger value="lectures">By Lecture</TabsTrigger>
      </TabsList>
      
      <TabsContent value="generate">
        <QuizGenerator courseId={courseId} />
      </TabsContent>
      
      <TabsContent value="lectures" className="space-y-4">
        {lectures.map(lecture => (
          <div key={lecture._id} className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">{lecture.lectureTitle}</h3>

            <QuizGenerator 
              lectureId={lecture?._id} 
              compact 
            />
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default QuizTab;