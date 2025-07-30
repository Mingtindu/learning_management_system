import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Pencil, BookOpen, User, Mail, KeyRound } from "lucide-react";
import React, { useEffect, useState } from "react";
import Course from "./Course";
import { useLoadUserQuery, useUpdateUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const { data, isLoading, isError, error, refetch } = useLoadUserQuery();
  const [updateUser, { isLoading: updateUserIsLoading, isSuccess }] = useUpdateUserMutation();

  const user = data?.user;

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
    if (user?.photoUrl) {
      setPreviewImage(user.photoUrl);
    }
  }, [user]);

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const updateUserHandler = async () => {
    try {
      const formData = new FormData();
      if (name) formData.append("name", name);
      if (profilePhoto) formData.append("profilePhoto", profilePhoto);
      
      await updateUser(formData).unwrap();
      toast.success("Profile updated successfully");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  if (isLoading) return <ProfileSkeleton />;
  if (isError) return <ProfileError error={error} />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Section */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={previewImage || "https://github.com/shadcn.png"} alt={user.name} />
                <AvatarFallback>
                  {user.name?.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-bold text-center">{user.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
              
              <Badge className="mt-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                {user.role.toUpperCase()}
              </Badge>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{user.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <KeyRound className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{user.role.toUpperCase()}</span>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mt-6 gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your profile information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={previewImage} />
                        <AvatarFallback>AV</AvatarFallback>
                      </Avatar>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={onChangeHandler}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={updateUserHandler}
                    disabled={updateUserIsLoading || (!name && !profilePhoto)}
                  >
                    {updateUserIsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Courses Section */}
        <div className="w-full md:w-2/3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Your Courses
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/courses")}
              >
                Browse Courses
              </Button>
            </div>

            {user.enrolledCourses?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.enrolledCourses.map((course) => (
                  <Course 
                    course={course} 
                    key={course._id} 
                    showProgress 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No courses enrolled yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Explore our courses to start your learning journey
                </p>
                <Button onClick={() => navigate("/courses")}>
                  Browse Courses
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Loading State
const ProfileSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col items-center">
            <Skeleton className="h-32 w-32 rounded-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-20 mt-2" />
          </div>
          <div className="mt-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full mt-6" />
        </div>
      </div>
      <div className="w-full md:w-2/3">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Error State
const ProfileError = ({ error }) => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
      <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
        Failed to load profile
      </h2>
      <p className="text-red-600 dark:text-red-400 mb-4">
        {error?.data?.message || "An error occurred while loading your profile"}
      </p>
      <Button 
        variant="outline" 
        onClick={() => window.location.reload()}
        className="text-red-700 dark:text-red-300"
      >
        Try Again
      </Button>
    </div>
  </div>
);

export default Profile;