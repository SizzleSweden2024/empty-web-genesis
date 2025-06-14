import React from 'react';
import { User, RefreshCw, Shield, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import DemographicForm from '../components/DemographicForm';
import { UserDemographics } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleDemographicUpdate = (demographics: UserDemographics) => {
    // The update is handled in the DemographicForm component
    console.log('Demographics updated:', demographics);
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        {/* Go Back Button */}
        <button
          onClick={handleGoBack}
          className="mb-4 flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex items-center mb-6">
          <User className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500 mr-3" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        </div>
        
        {user ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Account Information</h2>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                <p className="text-base sm:text-lg text-gray-900 dark:text-white">{user.email}</p>
              </div>
              
              <div className="flex items-start mb-4">
                <Shield className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your identity is kept secure. Your email is never shared with others.
                </p>
              </div>
              
              <button
                onClick={handleSignOut}
                className="mt-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow transition-colors duration-200 text-sm sm:text-base"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2" />
                Sign Out
              </button>
            </div>
            
            <DemographicForm onComplete={handleDemographicUpdate} />
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base">
              Please sign in to view and manage your profile
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors duration-200 text-sm sm:text-base"
            >
              Sign In
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;