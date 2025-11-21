'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; 
import { User, Mail, Lock, HeartPulse, Loader2, AlertTriangle } from 'lucide-react'; 

// --- THIS IS THE FIX ---
// We've moved InputField *outside* the PatientSignup component.
// It now needs the 'onChange' function passed in as a prop.
const InputField = ({ name, type = 'text', placeholder, Icon, value, onChange }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-gray-400" />
    </div>
    <input
      id={name}
      name={name}
      type={type}
      required
      placeholder={placeholder}
      value={value}
      onChange={onChange} // Use the passed-in onChange prop
      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm"
    />
  </div>
);
// -----------------------

export default function PatientSignup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // --- FIX 2: Added the full /api path ---
      const response = await api.post('/patient/signup', formData);
      
      if (response.status === 201) {
        // Redirect to verify page with email in query string
        router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`); 
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Signup failed. Please try again.';
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Updated background gradient to blue/teal
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-teal-100 p-4">
      <div className="w-full max-w-md bg-white p-8 md:p-10 shadow-2xl rounded-xl border-t-4 border-blue-600 transform transition duration-500 hover:shadow-3xl">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* Updated icon color to blue */}
          <HeartPulse className="w-10 h-10 mx-auto text-blue-600 mb-3" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Patient Account Sign Up
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Access your secure medical records and AI analysis reports.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Input Fields - Now passing onChange */}
          <InputField name="name" placeholder="Full Name" Icon={User} value={formData.name} onChange={handleChange} />
          <InputField name="email" placeholder="Email Address" type="email" Icon={Mail} value={formData.email} onChange={handleChange} />
          <InputField name="password" placeholder="Password" type="password" Icon={Lock} value={formData.password} onChange={handleChange} />

          {/* Error Message Display */}
          {error && (
            <div className="flex items-start p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              {/* --- FIX 3: Render error as plain text --- */}
              <span className="font-medium">{error}</span>
            </div>
          )}
          
          {/* Sign Up Button - Updated colors and hover effects */}
          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full flex items-center justify-center py-3 text-lg font-semibold rounded-lg transition duration-150 shadow-md ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Registering...
              </>
            ) : (
              'Create My Account'
            )}
          </button>
        </form>

        {/* Footer Link - Updated link color to blue */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already a patient?{' '}
          <Link href="/auth/signin" className="font-semibold text-blue-600 hover:text-blue-700 transition">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}