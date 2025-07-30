import { Menu, School, Home, BookOpen, GraduationCap, HelpCircle, User, LogOut } from "lucide-react";
import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkMode from "@/DarkMode";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();
  
  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Logged out successfully");
      navigate("/login");
    }
  }, [isSuccess]);

  return (
    <div className="h-16 dark:bg-[#020817] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-50 shadow-sm">
      {/* Desktop Navigation */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full px-4">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <School size={30} className="text-blue-600 dark:text-blue-400" />
            <h1 className="font-extrabold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              E-Learning
            </h1>
          </Link>

          {/* Main Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/course/search" className="flex items-center gap-1 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <BookOpen size={16} /> Courses
            </Link>
            <Link to="/how-it-works" className="flex items-center gap-1 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <HelpCircle size={16} /> How It Works
            </Link>
              <Link to="/blog" className="flex items-center gap-1 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <HelpCircle size={16} /> Blog
            </Link>
               <Link to="/community" className="flex items-center gap-1 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <HelpCircle size={16} /> Community
            </Link>
            <Link to="/ai-assistant" className="flex items-center gap-1 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <HelpCircle size={16} /> AI-Assistant
            </Link>
            
            {user?.role === 'instructor' && (
              <Link to="/admin/dashboard" className="flex items-center gap-1 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <GraduationCap size={16} /> Instructor Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <DarkMode />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoUrl} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/my-learning" className="w-full flex items-center gap-2">
                      <BookOpen size={14} /> My Learning
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full flex items-center gap-2">
                      <User size={14} /> Profile
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logoutHandler}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut size={14} className="mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/register")}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <Link to="/" className="flex items-center gap-2">
          <School size={24} className="text-blue-600 dark:text-blue-400" />
          <h1 className="font-extrabold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            E-Learning
          </h1>
        </Link>
        <MobileNavbar user={user} logoutHandler={logoutHandler} />
      </div>
    </div>
  );
};

const MobileNavbar = ({ user, logoutHandler }) => {
  const navigate = useNavigate();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>
            <Link to="/" className="flex items-center gap-2">
              <School size={24} className="text-blue-600 dark:text-blue-400" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                E-Learning
              </span>
            </Link>
          </SheetTitle>
          <DarkMode />
        </SheetHeader>

        <div className="flex-1 py-6">
          <nav className="grid gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Home size={16} /> Home
            </Link>
            <Link 
              to="/course/search" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <BookOpen size={16} /> Courses
            </Link>
            <Link 
              to="/how-it-works" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <HelpCircle size={16} /> How It Works
            </Link>
             <Link 
              to="/blog" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <HelpCircle size={16} /> Blog
            </Link>
            
            {user && (
              <>
                <Link 
                  to="/my-learning" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <BookOpen size={16} /> My Learning
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <User size={16} /> Profile
                </Link>
              </>
            )}
            
            {user?.role === 'instructor' && (
              <Link 
                to="/admin/dashboard" 
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <GraduationCap size={16} /> Instructor Dashboard
              </Link>
            )}
          </nav>
        </div>

        <SheetFooter>
          {user ? (
            <Button 
              variant="destructive" 
              onClick={logoutHandler}
              className="w-full gap-2"
            >
              <LogOut size={16} /> Logout
            </Button>
          ) : (
            <div className="grid gap-2 w-full">
              <Button onClick={() => navigate("/login")} className="w-full">
                Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/register")} 
                className="w-full"
              >
                Sign Up
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default Navbar;