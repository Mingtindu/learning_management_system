import { School, Mail, Phone, MapPin, Clock, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <School size={32} className="text-blue-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                E-Learning
              </span>
            </div>
            <p className="text-gray-400">
              Empowering learners worldwide with quality education and innovative learning solutions.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/course/search" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>support@elearning.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>123 Education St, Learning City, 10101</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>Mon-Fri: 9AM - 5PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12 mb-8"></div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} E-Learning Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="text-gray-500 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-gray-500 hover:text-white text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;