import { BASE_URL } from "@/app/constant";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from "@/features/api/courseApi";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const MEDIA_API = `${BASE_URL}/api/v1/media`;

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  const params = useParams();
  const { courseId, lectureId } = params;

  const {data: lectureData} = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setUploadVideoInfo(lecture.videoInfo);
      setBtnDisable(false); // Enable save button since we have existing data
    }
  }, [lecture]);

  const [editLecture, { data, isLoading, error, isSuccess }] = useEditLectureMutation();
  const [removeLecture, {data: removeData, isLoading: removeLoading, isSuccess: removeSuccess}] = useRemoveLectureMutation();

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset progress for new upload
    setUploadProgress(0);
    setIsUploading(true);
    setBtnDisable(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setUploadVideoInfo({
          videoUrl: res.data.data.url,
          publicId: res.data.data.public_id,
        });
        setBtnDisable(false);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Video upload failed:", error);
      toast.error(error.response?.data?.message || "Video upload failed");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const editLectureHandler = async () => {
    if (!lectureTitle || !uploadVideoInfo) {
      toast.error("Please fill all required fields");
      return;
    }

    await editLecture({
      lectureTitle,
      videoInfo: uploadVideoInfo,
      isPreviewFree: isFree,
      courseId,
      lectureId,
    });
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (removeSuccess) {
      toast.success(removeData.message);
    }
  }, [removeSuccess]);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            disabled={removeLoading} 
            variant="destructive" 
            onClick={removeLectureHandler}
          >
            {removeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : "Remove Lecture"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={lectureTitle}
              onChange={(e) => {
                setLectureTitle(e.target.value);
                setBtnDisable(false);
              }}
              type="text"
              placeholder="Ex. Introduction to Javascript"
            />
          </div>
          
          <div>
            <Label>
              Video <span className="text-red-500">*</span>
            </Label>
            <Input
              type="file"
              accept="video/*"
              onChange={fileChangeHandler}
              placeholder="Ex. Introduction to Javascript"
              className="w-fit"
              disabled={isUploading}
            />
            {isUploading && (
              <div className="mt-2 space-y-1">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground">
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              checked={isFree} 
              onCheckedChange={(checked) => {
                setIsFree(checked);
                setBtnDisable(false);
              }} 
              id="preview-free" 
            />
            <Label htmlFor="preview-free">Is this video FREE</Label>
          </div>

          <div>
            <Button 
              disabled={btnDisable || isLoading} 
              onClick={editLectureHandler}
              className="mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : "Update Lecture"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;