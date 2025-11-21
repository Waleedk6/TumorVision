'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Users, User, Stethoscope, Loader2, MapPin, AlertTriangle, Trash2 } from 'lucide-react'; // <-- Added Trash2

export default function UserManagementTable() {
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth(); 

    const fetchData = useCallback(async () => {
        if (!user?.email) { 
            setLoading(false);
            setError("Admin user not loaded. Cannot fetch data.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/users', {
                params: {
                    admin_email: user.email
                }
            }); 
            
            // We'll filter for approved doctors here, but keep unapproved ones for the other list
            const combined = [
                ...response.data.patients.map(p => ({...p, location: p.country || 'N/A'})),
                ...response.data.doctors.filter(d => d.approved).map(d => ({...d, location: `${d.city}, ${d.country}` || 'N/A'}))
            ];
            setAllUsers(combined);
        } catch (err) {
            console.error("Error fetching users:", err);
            const msg = err.response?.data?.error || "Failed to load user management table.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- NEW: Function to handle removing a doctor ---
    const handleRemoveDoctor = async (email) => {
        // Show a confirmation dialog before deleting
        if (window.confirm(`Are you sure you want to remove Dr. ${email}? This action cannot be undone.`)) {
            try {
                // Call the existing 'reject-doctor' endpoint from app.py
                await api.post('/admin/reject-doctor', { email });
                
                // If successful, update the UI by filtering out the removed user
                // This is faster than re-fetching the entire list
                setAllUsers(currentUsers => 
                    currentUsers.filter(u => u.email !== email)
                );

            } catch (err) {
                console.error("Error removing doctor:", err);
                setError(err.response?.data?.error || "Failed to remove doctor.");
            }
        }
    };
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10 text-blue-600">
                <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading all users...
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-700 bg-red-100 rounded-lg flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> {error}</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-4">
                <Users className="w-6 h-6 mr-3 text-blue-600" /> 
                Registered Users ({allUsers.length})
            </h3>
            <div className="overflow-x-auto bg-white rounded-xl shadow-md">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                            <th className="px-5 py-3">User</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3">Role</th>
                            <th className="px-5 py-3 hidden sm:table-cell">Location</th>
                            <th className="px-5 py-3">Actions</th> {/* <-- NEW: Actions column */}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {allUsers.map((u) => ( // Renamed to 'u' for clarity
                            <tr key={u.email} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-5 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{u.email}</td>
                                <td className="px-5 py-4 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                        u.type === 'doctor' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {u.type === 'doctor' ? <Stethoscope className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                                        {u.type.charAt(0).toUpperCase() + u.type.slice(1)}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-sm text-gray-500 hidden sm:table-cell">
                                    <MapPin className="w-4 h-4 inline mr-1" /> {u.location || 'N/A'}
                                </td>
                                {/* --- NEW: Actions Cell --- */}
                                <td className="px-5 py-4 text-sm">
                                    {u.type === 'doctor' ? (
                                        <button
                                            onClick={() => handleRemoveDoctor(u.email)}
                                            className="flex items-center text-red-600 hover:text-red-900"
                                            title="Remove Doctor"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Remove
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 text-xs">N/A</span> // No action for patients yet
                                    )}
                                </td>
                                {/* ------------------------ */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}