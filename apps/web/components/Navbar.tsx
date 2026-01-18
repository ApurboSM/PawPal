import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-indigo-600">PawPal</Link>
          </div>
          <div className="flex space-x-4 items-center">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className={`px-3 py-2 rounded-md text-sm font-medium ${location === '/login' ? 'text-indigo-700' : 'text-gray-700 hover:text-indigo-700'}`}>Login</Link>
                <Link href="/register" className={`px-3 py-2 rounded-md text-sm font-medium ${location === '/register' ? 'text-indigo-700' : 'text-gray-700 hover:text-indigo-700'}`}>Register</Link>
              </>
            ) : (
              <>
                <Link href="/profile" className={`px-3 py-2 rounded-md text-sm font-medium ${location === '/profile' ? 'text-indigo-700' : 'text-gray-700 hover:text-indigo-700'}`}>Profile</Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 