// app/auth/signin/page.js
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, Mail, Lock, Loader2, AlertTriangle } from 'lucide-react';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/signin', formData);
      const { token, type, approved, email, name } = response.data;

      console.log('Signin response:', response.data);

      // 1. Save user data via hook (updates localStorage + state)
      signIn(token, type, approved, email, name);

      // 2. Wait one tick for React to commit state + localStorage
      await new Promise(resolve => setTimeout(resolve, 0));

      // 3. NOW redirect safely
      if (type === 'admin') {
        router.push('/admin/dashboard');
      } else if (type === 'doctor') {
        if (approved) {
          router.push('/doctor/dashboard');
        } else {
          setError('Your doctor account is **pending admin approval**. Please wait for confirmation.');
        }
      } else if (type === 'patient') {
        router.push('/patient/dashboard');
      }

    } catch (err) {
      const apiError = err.response?.data?.error;
      if (apiError === 'Invalid') {
        setError('Login failed. Invalid email or password.');
      } else {
        setError(apiError || 'An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <div className="w-full max-w-lg bg-white p-8 md:p-12 shadow-2xl rounded-xl border-t-4 border-blue-600">
        <div className="text-center mb-8">
          <LogIn className="w-10 h-10 mx-auto text-blue-600 mb-3" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Sign In to MedScan AI
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Access your secure patient records and AI tools.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="font-medium" dangerouslySetInnerHTML={{ __html: error }} />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center py-3 text-lg font-semibold rounded-lg transition duration-150 shadow-md ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          New to MedScan AI?{' '}
          <Link href="/auth/signup/select-role" className="font-semibold text-blue-600 hover:text-blue-700 transition">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}