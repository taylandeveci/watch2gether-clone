import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';

/**
 * NotFoundPage Component
 * 404 error page
 */
export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-8">
          404
        </div>
        
        <div className="mb-8">
          <Search className="w-24 h-24 text-gray-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/')}
          className="w-full sm:w-auto"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
