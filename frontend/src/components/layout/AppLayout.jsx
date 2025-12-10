import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * AppLayout Component
 * Main application layout wrapper
 */
export const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-slate-100">
      {children || <Outlet />}
    </div>
  );
};

export default AppLayout;
