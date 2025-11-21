// app/auth/signup/doctor/page.js
'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; 
import { User, Mail, Lock, Phone, MapPin, Building2, GraduationCap, Stethoscope, Loader2, AlertTriangle } from 'lucide-react';

// --- FIXED INPUT FIELD DEFINITION (Now a standalone component) ---
const InputField = ({ name, type = 'text', placeholder, Icon, required = true, value, onChange }) => (
    <div>
      <label htmlFor={name} className="sr-only">{placeholder}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          // --- FIXED: Use props for value and onChange ---
          value={value}
          onChange={onChange}
          // ----------------------------------------------
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm"
        />
      </div>
    </div>
  );
// -----------------------------------------------------------------


export default function DoctorSignup() {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', 
    phone: '', country: '', city: '', 
    hospital: '', university: '', specialty: '' // Added specialty to state for consistency
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // FIX: The handleChange implementation is correct for updating state
  const handleChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // NOTE: Remove specialty from formData if the backend doesn't accept it
      const { specialty, ...dataToSend } = formData;
      const response = await api.post('/doctor/signup', dataToSend); 
      
      if (response.status === 201) {
        router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}&role=doctor`);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Signup failed. Please ensure all fields are complete.';
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-blue-50 p-6">
      <div className="w-full max-w-2xl bg-white p-10 shadow-2xl rounded-xl border-t-8 border-indigo-600 transform transition duration-500 hover:shadow-3xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Stethoscope className="w-12 h-12 mx-auto text-indigo-600 mb-3" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Doctor Registration
          </h2>
          <p className="mt-2 text-md text-gray-500">
            Secure your access. All accounts require **admin approval** after verification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. Account Credentials */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="text-xl font-semibold text-indigo-700 flex items-center mb-4">
                <User className="w-5 h-5 mr-2" /> Personal & Login
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* --- FIXED USAGE: Pass value and onChange explicitly --- */}
              <InputField name="name" placeholder="Full Name" Icon={User} value={formData.name} onChange={handleChange} />
              <InputField name="phone" placeholder="Phone Number" type="tel" Icon={Phone} value={formData.phone} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField name="email" placeholder="Email Address" type="email" Icon={Mail} value={formData.email} onChange={handleChange} />
              <InputField name="password" placeholder="Password" type="password" Icon={Lock} value={formData.password} onChange={handleChange} />
            </div>
          </div>
          
          {/* 2. Professional Credentials */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-indigo-700 flex items-center mb-4">
                <GraduationCap className="w-5 h-5 mr-2" /> Professional Details
            </h3>
            
            <InputField name="university" placeholder="University/Medical School" Icon={GraduationCap} value={formData.university} onChange={handleChange} />
            <InputField name="hospital" placeholder="Affiliated Hospital/Clinic" Icon={Building2} value={formData.hospital} onChange={handleChange} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField name="country" placeholder="Country" Icon={MapPin} value={formData.country} onChange={handleChange} />
              <InputField name="city" placeholder="City" Icon={MapPin} value={formData.city} onChange={handleChange} />
              
              {/* Specialty (required=false since backend doesn't use it directly) */}
              <InputField name="specialty" placeholder="Medical Specialty" Icon={Stethoscope} required={false} value={formData.specialty} onChange={handleChange} />
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="flex items-start p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="font-medium" dangerouslySetInnerHTML={{ __html: error }} />
            </div>
          )}

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center py-3 text-lg font-semibold rounded-lg transition duration-150 shadow-lg ${
              loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting for Review...
              </>
            ) : (
              'Submit for Approval'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already registered?{' '}
          <Link href="/auth/signin" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}