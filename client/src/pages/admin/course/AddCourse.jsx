import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AddCourse = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("");

  const [createCourse, { data, isLoading, error, isSuccess }] =
    useCreateCourseMutation();

  const navigate = useNavigate();

  const getSelectedCategory = (value) => {
    setCategory(value);
  };

  const createCourseHandler = async () => {
    await createCourse({ courseTitle, category });
  };

  // for displaying toast
  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course created.");
      navigate("/admin/course");
    }
  }, [isSuccess, error]);

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Lets add course, add some basic course details for your new course
        </h1>
        <p className="text-sm">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus,
          laborum!
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="Your Course Name"
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select onValueChange={getSelectedCategory}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>

                <SelectItem value="HTML">HTML</SelectItem>
                <SelectItem value="CSS">CSS</SelectItem>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
                <SelectItem value="TypeScript">TypeScript</SelectItem>
                <SelectItem value="Frontend Development">
                  Frontend Development
                </SelectItem>
                <SelectItem value="Backend Development">
                  Backend Development
                </SelectItem>
                <SelectItem value="Fullstack Development">
                  Fullstack Development
                </SelectItem>
                <SelectItem value="MERN Stack Development">
                  MERN Stack Development
                </SelectItem>
                <SelectItem value="Next JS">Next JS</SelectItem>
                <SelectItem value="React JS">React JS</SelectItem>
                <SelectItem value="Vue JS">Vue JS</SelectItem>
                <SelectItem value="Node JS">Node JS</SelectItem>
                <SelectItem value="Express JS">Express JS</SelectItem>
                <SelectItem value="MongoDB">MongoDB</SelectItem>
                <SelectItem value="SQL">SQL</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Machine Learning">
                  Machine Learning
                </SelectItem>
                <SelectItem value="Artificial Intelligence">
                  Artificial Intelligence
                </SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
                <SelectItem value="Docker">Docker</SelectItem>
                <SelectItem value="Git & GitHub">Git & GitHub</SelectItem>
                <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                <SelectItem value="Figma">Figma</SelectItem>
                <SelectItem value="Adobe XD">Adobe XD</SelectItem>
                <SelectItem value="Photoshop">Photoshop</SelectItem>
                <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                <SelectItem value="AWS">AWS</SelectItem>
                <SelectItem value="Firebase">Firebase</SelectItem>
                <SelectItem value="Java">Java</SelectItem>
                <SelectItem value="C++">C++</SelectItem>
                <SelectItem value="C#">C#</SelectItem>
                <SelectItem value="Android Development">
                  Android Development
                </SelectItem>
                <SelectItem value="iOS Development">iOS Development</SelectItem>
                <SelectItem value="Mobile App Development">
                  Mobile App Development
                </SelectItem>
                <SelectItem value="Software Testing">
                  Software Testing
                </SelectItem>
                <SelectItem value="System Design">System Design</SelectItem>
                <SelectItem value="Operating Systems">
                  Operating Systems
                </SelectItem>
                <SelectItem value="DSA (Data Structures & Algorithms)">
                  DSA (Data Structures & Algorithms)
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/course")}>
            Back
          </Button>
          <Button disabled={isLoading} onClick={createCourseHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
