import React from 'react';
import { Video } from 'lucide-react';

/**
 * Header Component
 * Top navigation bar
 */
export const Header = ({ children }) => {
  return (
    <header className="bg-surface border-b-2 border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Watch2gether</h1>
              <p className="text-xs text-gray-400">Watch together, stay connected</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">{children}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
