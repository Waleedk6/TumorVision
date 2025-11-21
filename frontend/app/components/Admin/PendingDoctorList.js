'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api'; // <-- FIXED PATH
import { useAuth } from '../../hooks/useAuth'; // <-- FIXED PATH
import { Check, X, Clock, Loader2, AlertTriangle } from 'lucide-react';

export default function PendingDoctorList() {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get the currently logged-in admin user

  const fetchData = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      setError("Admin user not loaded. Cannot fetch data.");
      return; 
    }

    setLoading(true);
    setError(null);
    try {
      // Pass admin_email as a URL parameter for the GET request
      const response = await api.get('/admin/users', {
        params: {
          admin_email: user.email 
        }
      }); 
      
      const allDoctors = response.data.doctors || [];
      const pending = allDoctors.filter(d => d.type === 'doctor' && !d.approved);
      setPendingDoctors(pending);
    } catch (err) {
      console.error("Error fetching users:", err);
      const msg = err.response?.data?.error || "Failed to load doctor list.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user]); // Add user as a dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (email, actionType) => {
    if (!user?.email) {
      alert("Error: Admin user is not authenticated.");
      return;
    }

    const endpoint = actionType === 'approve' ? '/admin/approve-doctor' : '/admin/reject-doctor';
    
    // Send admin_email in the payload for the POST request
    const payload = { 
      email: email, // The email of the doctor to action
      admin_email: user.email // The admin's email for auth
    };

    // Set loading state for the specific row
    setPendingDoctors(prev => 
      prev.map(doc => doc.email === email ? { ...doc, isLoading: true } : doc)
    );

    try {
      await api.post(endpoint, payload);
      alert(`Doctor ${email} ${actionType}d successfully.`);
      fetchData(); // Refresh the list
    } catch (err) {
      const msg = err.response?.data?.error || `Failed to ${actionType} doctor.`;
      alert(`Error: ${msg}`);
      setPendingDoctors(prev => 
        prev.map(doc => doc.email === email ? { ...doc, isLoading: false } : doc)
      );
    }
  };

  if (loading && pendingDoctors.length === 0) {
    return (
        <div className="flex justify-center items-center py-10 text-blue-600">
            <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading pending list...
        </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-700 bg-red-100 rounded-lg flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> {error}</div>;
  }

  if (pendingDoctors.length === 0) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
        <Check className="w-8 h-8 mx-auto text-green-600" />
        <p className="mt-2 text-lg font-medium text-green-700">No doctors pending approval!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-4">
        <Clock className="w-6 h-6 mr-3 text-yellow-600" /> 
        {pendingDoctors.length} Account(s) Pending Review
      </h3>
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              <th className="px-5 py-3">Doctor Info</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3 hidden md:table-cell">Credentials</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pendingDoctors.map((doctor) => (
              <tr key={doctor.email} className={`hover:bg-yellow-50/50 ${doctor.isLoading ? 'opacity-50' : ''}`}>
                <td className="px-5 py-4 text-sm">
                    <p className="font-medium text-gray-900">{doctor.name || 'N/A'}</p>
                    <p className="text-gray-500 text-xs">{doctor.hospital || 'No Hospital'}</p>
                </td>
                <td className="px-5 py-4 text-sm">
                    <p className="text-gray-700">{doctor.email}</p>
                    <p className="text-gray-500 text-xs">{doctor.phone || 'No Phone'}</p>
                </td>
                <td className="px-5 py-4 text-sm text-gray-700 hidden md:table-cell">
                    {doctor.university || 'No University'}
                </td>
                <td className="px-5 py-4 text-sm text-right space-x-2">
                  {doctor.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500 inline-flex" />
                  ) : (
                    <>
                      <button
                        onClick={() => handleAction(doctor.email, 'approve')}
                        title="Approve Doctor"
                        className="p-2 text-white bg-green-600 rounded-full hover:bg-green-700 transition"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleAction(doctor.email, 'reject')}
                        title="Reject Doctor"
                        className="p-2 text-white bg-red-600 rounded-full hover:bg-red-700 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}