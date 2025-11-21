// hooks/useAuth.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const type = localStorage.getItem('userType');
    const approved = localStorage.getItem('isApproved') === 'true';
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');

    if (token && type && email && name) {
      setUser({ token, type, approved, email, name });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const signIn = (token, type, approved, email, name) => {
    const userData = { token, type, approved: Boolean(approved), email, name };

    // IMMEDIATELY update localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userType', type);
    localStorage.setItem('isApproved', String(approved));
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);

    // Update state
    setUser(userData);
  };

  const signOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('isApproved');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setUser(null);
    router.push('/auth/signin');
  };

  return { user, loading, signIn, signOut };
};