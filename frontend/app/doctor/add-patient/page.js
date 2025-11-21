'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api'; 
import { useAuth } from '../../hooks/useAuth';
import AuthGuard from '../../components/AuthGuard';
import { UserPlus, Loader2, AlertTriangle, ArrowLeft, User, Mail, Calendar } from 'lucide-react';

// --- THIS IS THE FIX ---
// We've moved InputField *outside* the AddPatientPage component.
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
      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition sm:text-sm"
    />
  </div>
);
// -----------------------

export default function AddPatientPage() {
  const [formData, setFormData] = useState({ name: '', email: '', age: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth(); // Get the doctor's email for auth

  const handleChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      setError("Doctor authentication error. Please sign in again.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age, 10), // Ensure age is an integer
      };

      // --- Re-added the /api path fix ---
      const response = await api.post('/doctor/add-patient', payload);
      
      if (response.status === 201) {
        alert('Patient added successfully!');
        router.push('/doctor/patients'); // Redirect to patient list
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to add patient.';
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard requiredRole="doctor">
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <header className="mb-8">
            <Link href="/doctor/dashboard" className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition mb-2">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </Link>
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <UserPlus className="w-8 h-8 mr-3 text-indigo-600" />
                    Register New Patient
                </h1>
                <p className="mt-1 text-gray-500">Add a new patient to the system to manage their records and scans.</p>
            </div>
        </header>

        <main>
          <div className="w-full max-w-lg bg-white p-8 md:p-10 shadow-xl rounded-xl border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Now we pass 'handleChange' as a prop */}
              <InputField name="name" placeholder="Patient Full Name" Icon={User} value={formData.name} onChange={handleChange} />
              <InputField name="email" placeholder="Patient Email Address" type="email" Icon={Mail} value={formData.email} onChange={handleChange} />
              <InputField name="age" placeholder="Patient Age" type="number" Icon={Calendar} value={formData.age} onChange={handleChange} />

              {/* Error Message Display */}
              {error && (
                <div className="flex items-start p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  {/* --- Re-added the plain text error fix --- */}
                  <span className="font-medium">{error}</span>
                </div>
              )}
              
              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full flex items-center justify-center py-3 text-lg font-semibold rounded-lg transition duration-150 shadow-md ${
                    loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-700 text-white hover:bg-indigo-800 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Registering...
                  </>
                ) : (
                  'Add Patient Record'
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}