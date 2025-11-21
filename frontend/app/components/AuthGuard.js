// components/AuthGuard.js
'use client';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Clock, LogOut } from 'lucide-react';

export default function AuthGuard({ children, requiredRole }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/signin');
      } else if (requiredRole && user.type !== requiredRole) {
        router.push('/');
      }
    }
  }, [user, loading, router, requiredRole]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600">
        Loading access...
      </div>
    );
  }

  if (user.type === 'doctor' && !user.approved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50 p-6">
        <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-lg border-t-8 border-yellow-500">
          <Clock className="w-12 h-12 mx-auto text-yellow-600 mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Access Pending</h2>
          <p className="text-gray-700 mb-6">
            Thank you for registering. Your Doctor account, <strong>{user.name}</strong>, is currently
            <strong> under review</strong> by our system administrator.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Once approved, you will be notified via email and can access this dashboard.
          </p>
          <button
            onClick={signOut}
            className="flex items-center mx-auto text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition shadow-md"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return children;
}