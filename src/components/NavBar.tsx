import React, { useState } from 'react';
import { PlusCircle, BarChart2, Bookmark, User, Menu, X, ChevronLeft, Moon, Sun } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { useViewMode } from '../hooks/useViewMode';
import ViewModeToggle from './ViewModeToggle';

const NavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { viewMode, toggleViewMode } = useViewMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const showBackButton = () => {
    // Show back button on all pages except home
    return location.pathname !== '/';
  };

  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <nav className="fixed w-full bg-white dark:bg-gray-900 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex-shrink-0 flex items-center">
            {showBackButton() && (
              <button
                onClick={handleGoBack}
                className="mr-3 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <Link to="/" className="text-blue-600 dark:text-blue-400 font-bold text-xl flex items-center">
              <BarChart2 className="mr-2 h-5 w-5" />
              <span>Poller</span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {/* Dark Mode Toggle */}
            {/* View Mode Toggle */}
            <ViewModeToggle viewMode={viewMode} onToggle={toggleViewMode} />
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {user ? (<>
              <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium hidden sm:block ${
                isActive('/') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              >
              Home
              </Link>
              <Link 
              to="/create" 
              className={`px-3 py-2 rounded-md text-sm font-medium hidden sm:block ${
                isActive('/create') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              >
              Create Poll
              </Link>
              <Link 
              to="/bookmarks" 
              className={`px-3 py-2 rounded-md text-sm font-medium hidden sm:block ${
                isActive('/bookmarks') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              >
              Bookmarks
              </Link>
              <Link 
              to="/profile" 
              className={`p-2 rounded-md hidden sm:block ${
                isActive('/profile') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              >
              <User className="h-5 w-5" />
              </Link>
            </>) : (
              <Link
                to="/auth"
                className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 hidden sm:block"
              >
                Sign In
              </Link>
            )}
          </div>
          
          <div className="flex sm:hidden items-center space-x-2">
            {/* Mobile Dark Mode Toggle */}
            {/* Mobile View Mode Toggle */}
            <ViewModeToggle viewMode={viewMode} onToggle={toggleViewMode} />
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {!user && (
              <Link
                to="/auth"
                className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Sign In
              </Link>
            )}
            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none hidden"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`sm:hidden hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900">
          {user ? (
            <>
              <Link 
                to="/" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') 
                    ? 'text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5" />
                  Home
                </div>
              </Link>
              <Link 
                to="/create" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/create') 
                    ? 'text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Poll
                </div>
              </Link>
              <Link 
                to="/bookmarks" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/bookmarks') 
                    ? 'text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Bookmark className="mr-2 h-5 w-5" />
                  Bookmarks
                </div>
              </Link>
              <Link 
                to="/profile" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/profile') 
                    ? 'text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile
                </div>
              </Link>
            </>
          ) : (
            <Link
              to="/auth"
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;