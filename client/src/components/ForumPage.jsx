import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Plus, Clock, User, ChevronDown, Reply, Check, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';
import { BASE_URL } from '@/app/constant';

const ForumPage = () => {
  // State management
  const [discussions, setDiscussions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Most Recent');
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // New post states
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCourse, setNewPostCourse] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('');
  const [newPostTags, setNewPostTags] = useState('');

  // API Headers with auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  console.log("courses", courses);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, tagsRes, coursesRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/v1/forum/categories`),
          axios.get(`${BASE_URL}/api/v1/forum/tags`),
          axios.get(`${BASE_URL}/api/v1/course/published-courses`)
        ]);
        console.log("coursesRes", coursesRes);

        setCategories(['All', ...categoriesRes.data]);
        setAllTags(tagsRes.data);
        setCourses([
          'All',
          ...coursesRes.data.courses.map(course => course.courseTitle)
        ]);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        // Set default values if API calls fail
        setCategories(['All', 'Programming', 'Web Design', 'Career', 'General']);
        setAllTags([]);
        setCourses(['All']);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch discussions with filters
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: currentPage,
          limit: 10,
        });

        if (searchQuery) params.append('search', searchQuery);
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        if (selectedCourse !== 'All') params.append('course', selectedCourse);
        if (selectedTags.length > 0) selectedTags.forEach(tag => params.append('tags', tag));
        
        // Map sort options to API values
        const sortMap = {
          'Most Recent': 'recent',
          'Most Replies': 'replies',
          'Unanswered': 'recent'
        };
        params.append('sort', sortMap[selectedSort]);
        
        if (selectedSort === 'Unanswered') {
          params.append('unanswered', 'true');
        }

        const response = await axios.get(`${BASE_URL}/api/v1/forum/discussions?${params}`);
        
        setDiscussions(response.data.discussions);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch discussions');
        console.error('Error fetching discussions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [searchQuery, selectedCategory, selectedCourse, selectedSort, selectedTags, currentPage]);

  // Handle new post submission
  const handleNewPostSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setCreating(true);
      setError(null);

      // Find course ID from course title
      const courseRes = await axios.get(`${BASE_URL}/api/v1/course/published-courses`);
      const selectedCourseObj = courseRes.data.courses.find(course => course.courseTitle === newPostCourse);
      
      if (!selectedCourseObj) {
        setError('Please select a valid course');
        return;
      }

      const postData = {
        title: newPostTitle,
        content: newPostContent,
        course: selectedCourseObj._id,
        category: newPostCategory,
        tags: newPostTags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await axios.post(
        `${BASE_URL}/api/v1/forum/discussions`,
        postData,
        { headers: getAuthHeaders() }
      );

      // Add new discussion to the beginning of the list
      setDiscussions(prev => [response.data, ...prev]);
      
      // Reset form and close dialog
      setNewPostOpen(false);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCourse('');
      setNewPostCategory('');
      setNewPostTags('');
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create discussion');
      console.error('Error creating discussion:', err);
    } finally {
      setCreating(false);
    }
  };

  // Toggle tag selection
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCourse('All');
    setSelectedSort('Most Recent');
    setSelectedTags([]);
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Community Forum</h1>
            <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Start New Discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Discussion</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleNewPostSubmit} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="What's your question?"
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="course">Course</Label>
                      <Select value={newPostCourse} onValueChange={setNewPostCourse} required>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.filter(course => course !== 'All').map(course => (
                            <SelectItem key={course} value={course}>
                              {course}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newPostCategory} onValueChange={setNewPostCategory} required>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter(cat => cat !== 'All').map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={newPostTags}
                      onChange={(e) => setNewPostTags(e.target.value)}
                      placeholder="react, javascript, frontend"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Details</Label>
                    <Textarea
                      id="content"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Provide more details about your question..."
                      className="mt-1 min-h-[200px]"
                      required
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => setNewPostOpen(false)}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating}>
                      {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Post Discussion
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search discussions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="course">Course</Label>
              <Select value={selectedCourse} onValueChange={(value) => {
                setSelectedCourse(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort">Sort By</Label>
              <Select value={selectedSort} onValueChange={(value) => {
                setSelectedSort(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Most Recent">Most Recent</SelectItem>
                  <SelectItem value="Most Replies">Most Replies</SelectItem>
                  <SelectItem value="Unanswered">Unanswered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && !loading && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading discussions...</span>
          </div>
        )}

        {/* Discussions List */}
        {!loading && (
          <div className="space-y-4">
            <AnimatePresence>
              {discussions.length > 0 ? (
                discussions.map(discussion => (
                  <motion.div
                    key={discussion._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <Link to={`/forum/${discussion._id}/${discussion.slug}`} className="block">
                      <div className="p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {discussion.isPinned && (
                                <Badge variant="secondary">Pinned</Badge>
                              )}
                              {discussion.isAnswered && (
                                <Badge variant="success" className="gap-1">
                                  <Check className="h-3 w-3" />
                                  Answered
                                </Badge>
                              )}
                              {discussion.hasInstructorReply && (
                                <Badge variant="secondary">Instructor Reply</Badge>
                              )}
                              <Badge variant="outline">{discussion.category}</Badge>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                              {discussion.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {discussion.tags.map(tag => (
                                <Badge 
                                  key={tag} 
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <img 
                                src={discussion.author?.photoUrl || `https://ui-avatars.com/api/?name=${discussion.author?.name}`} 
                                alt={discussion.author?.name}
                                className="h-6 w-6 rounded-full mr-2"
                              />
                              {discussion.author?.name} •{' '}
                              {discussion.course?.courseTitle}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <MessageSquare className="h-4 w-4" />
                              <span>{discussion.repliesCount} replies</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span>{formatDate(discussion.lastActivity)}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {discussion.views} views
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
                >
                  <MessageSquare className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    No discussions found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button onClick={clearFilters}>
                    Clear filters
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === pagination.pages || 
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, arr) => {
                    const prevPage = arr[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;
                    
                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && <span className="px-2">...</span>}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => handlePageChange(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPage;