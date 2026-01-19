'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  onLogout?: () => void;
  showConfirmation?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  className = "bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500",
  children = 'Logout',
  onLogout,
  showConfirmation = true
}) => {
  const { logout, isLoading } = useAuth();
  const [showDialog, setShowDialog] = useState(false);

  const handleLogout = async () => {
    if (showConfirmation) {
      setShowDialog(true);
    } else {
      await performLogout();
    }
  };

  const performLogout = async () => {
    try {
      await logout();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setShowDialog(false);
    }
  };

  const handleConfirm = async () => {
    await performLogout();
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  return (
    <>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging out...
          </span>
        ) : (
          children
        )}
      </button>

      {/* Confirmation Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to log out? You'll need to sign in again to access your account.</p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;