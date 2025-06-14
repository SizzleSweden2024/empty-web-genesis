import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Bookmark, User } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
    },
    {
      path: '/create',
      icon: PlusCircle,
      label: 'Create',
    },
    {
      path: '/bookmarks',
      icon: Bookmark,
      label: 'Saved',
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
    },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 sm:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-2 min-w-0 flex-1 ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon 
                size={20} 
                className={`mb-1 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} 
              />
              <span className={`text-xs font-medium truncate ${
                active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;