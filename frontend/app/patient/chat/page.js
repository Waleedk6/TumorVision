'use client';
// --- 1. IMPORT THE HOOKS AND API ---
import { useState, useEffect } from 'react';
import AuthGuard from '../../components/AuthGuard';
import Link from 'next/link';
import { User, MessageSquare, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import api from '../../../lib/api'; // Assuming this is the correct path

export default function PatientChatInbox() {
  // --- 2. SET UP STATE FOR DOCTORS, LOADING, AND ERRORS ---
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- 3. USE EFFECT TO FETCH DATA ON LOAD ---
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.get('/admin/users'); // Use the full path
        const allDoctors = response.data.doctors || [];
        const approvedDoctors = allDoctors.filter(doctor => 
          doctor.approved === true
        );
        
        setDoctors(approvedDoctors);
        
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setError('Could not load doctors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []); // Empty array means this runs once when the component mounts

  // --- 4. RENDER DIFFERENT UI FOR LOADING/ERROR STATES ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="ml-3 text-gray-700">Loading Doctors...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-red-600">
          <AlertCircle className="w-10 h-10 mb-2" />
          <p className="font-semibold">{error}</p>
        </div>
      );
    }

    if (doctors.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
          <User className="w-10 h-10 mb-2" />
          <p className="font-semibold">No doctors are available for chat right now.</p>
        </div>
      );
    }

    // --- 5. RENDER THE LIST AS CARDS (UPDATED) ---
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {doctors.map((doctor) => (
          <div 
            key={doctor.email} 
            className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            {/* --- Card Body --- */}
            {/* Added flex-1 and flex-col to make footer stick to bottom */}
            <div className="p-5 flex-1 flex flex-col">
              {/* Card Header */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  {doctor.profile_image ? (
                    <>
                      <img
                        className="w-16 h-16 rounded-full object-cover"
                        src={`http://127.0.0.1:5000/static/uploads/${doctor.profile_image}`}
                        alt={`${doctor.name}'s profile`}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div
                        className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full"
                        style={{ display: 'none' }}
                      >
                        <User className="w-8 h-8 text-green-700" />
                      </div>
                    </>
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full">
                      <User className="w-8 h-8 text-green-700" />
                    </div>
                  )}
                </div>
                
                <div className="ml-4 truncate">
                  <p className="text-lg font-semibold text-gray-800 truncate">{doctor.name}</p>
                  <p className="text-sm text-gray-600 truncate">{doctor.hospital || 'Doctor'}</p>
                </div>
              </div>

              {/* --- NEW: ABOUT SECTION --- */}
              {doctor.about && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {doctor.about}
                  </p>
                </div>
              )}
            </div>
    
            {/* --- Card Footer/Action --- */}
            {/* Added mt-auto to push to bottom */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
              <Link
                href={`/patient/chat/${encodeURIComponent(doctor.email)}`}
                className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Chat Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AuthGuard requiredRole="patient">
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <header className="mb-8">
          <Link href="/patient/dashboard" className="flex items-center text-sm text-green-600 hover:text-green-800 transition mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Start a Chat</h1>
          <p className="text-lg text-gray-600">Select a doctor to view your chat history or send a new message.</p>
        </header>

        <div className="rounded-xl">
          {renderContent()}
        </div>
      </div>
    </AuthGuard>
  );
}