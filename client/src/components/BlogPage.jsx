import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, User, BookOpen, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data - replace with your actual data fetching logic
const articles = [
  {
    id: 1,
    slug: 'effective-online-learning',
    title: '10 Strategies for Effective Online Learning',
    description: 'Discover proven techniques to maximize your learning outcomes in digital environments.',
    author: 'Dr. Sarah Johnson',
    date: '2023-10-15',
    category: 'Learning Tips',
    tags: ['online learning', 'study techniques', 'productivity'],
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 2,
    slug: 'time-management',
    title: 'Mastering Time Management for Busy Learners',
    description: 'Learn how to balance your studies with other commitments using these time management hacks.',
    author: 'Michael Chen',
    date: '2023-09-28',
    category: 'Productivity',
    tags: ['time management', 'organization', 'study skills'],
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    slug: 'programming-fundamentals',
    title: 'Programming Fundamentals Every Beginner Should Know',
    description: 'Essential concepts that will give you a strong foundation in software development.',
    author: 'Alex Rodriguez',
    date: '2023-09-15',
    category: 'Programming',
    tags: ['coding', 'beginners', 'computer science'],
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    slug: 'ai-in-education',
    title: 'The Impact of AI on Modern Education',
    description: 'How artificial intelligence is transforming learning experiences and outcomes.',
    author: 'Priya Patel',
    date: '2023-08-22',
    category: 'Technology',
    tags: ['AI', 'education technology', 'future of learning'],
    thumbnail: 'https://images.unsplash.com/photo-1677442135136-760c813a743f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 5,
    slug: 'mental-health-learning',
    title: 'Maintaining Mental Health While Learning',
    description: 'Strategies to keep your mind healthy during intensive study periods.',
    author: 'Dr. James Wilson',
    date: '2023-08-10',
    category: 'Wellness',
    tags: ['mental health', 'self-care', 'study balance'],
    thumbnail: 'https://images.unsplash.com/photo-1491841553635-69485ce4874b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 6,
    slug: 'career-transition',
    title: 'How to Successfully Transition Careers Through Online Learning',
    description: 'Step-by-step guide to pivoting to a new career using online education resources.',
    author: 'Maria Garcia',
    date: '2023-07-29',
    category: 'Career',
    tags: ['career change', 'professional development', 'skills'],
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  }
];

const categories = ['All', 'Learning Tips', 'Productivity', 'Programming', 'Technology', 'Wellness', 'Career'];
const tags = ['online learning', 'study techniques', 'productivity', 'time management', 'coding', 'AI', 'mental health', 'career change'];

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState([]);

  // Filter articles based on search, category and tags
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => article.tags.includes(tag));
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  const featuredArticle = articles.find(article => article.featured);

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-gray-800 dark:to-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Learning Insights & Resources</h1>
          <p className="text-xl text-blue-100 dark:text-gray-300 max-w-3xl mx-auto">
            Discover articles, guides and tips to enhance your learning journey
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="mb-12">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search articles..."
              className="pl-10 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
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
        </div>

        {/* Featured Article */}
        {featuredArticle && !searchQuery && selectedCategory === 'All' && selectedTags.length === 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Featured Article</h2>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <Link to={`/blog/${featuredArticle.slug}`}>
                <div className="md:flex">
                  <div className="md:flex-shrink-0 md:w-1/3">
                    <img 
                      className="h-64 w-full object-cover md:h-full" 
                      src={featuredArticle.thumbnail} 
                      alt={featuredArticle.title}
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{featuredArticle.category}</Badge>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                      {featuredArticle.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {featuredArticle.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <User className="h-4 w-4 mr-1" />
                          {featuredArticle.author}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(featuredArticle.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <Button variant="ghost">
                        Read More <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        )}

        {/* Articles Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
            {filteredArticles.length > 0 ? 'Latest Articles' : 'No articles found'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map(article => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <Link to={`/blog/${article.slug}`}>
                  <img 
                    className="h-48 w-full object-cover" 
                    src={article.thumbnail} 
                    alt={article.title}
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{article.category}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <User className="h-4 w-4 mr-1" />
                        {article.author}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(article.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;