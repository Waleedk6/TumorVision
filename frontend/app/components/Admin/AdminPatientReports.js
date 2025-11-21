'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { FileHeart, Loader2, AlertTriangle, FileWarning, FileCheck2 } from 'lucide-react';

export default function AdminPatientReports() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth(); // Get admin user

    const fetchData = useCallback(async () => {
        if (!user?.email) {
            setLoading(false);
            setError("Admin user not loaded. Cannot fetch data.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/api/admin/patient-records', {
                params: {
                    admin_email: user.email
                }
            });
            setRecords(response.data.records || []);
        } catch (err) {
            console.error("Error fetching patient records:", err);
            const msg = err.response?.data?.error || "Failed to load patient records.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getScanResultClass = (result) => {
        if (!result) return 'text-gray-500';
        if (result.includes('notumor')) return 'text-green-600 font-medium';
        if (result.includes('glioma') || result.includes('meningioma') || result.includes('pituitary')) return 'text-red-600 font-medium';
        return 'text-gray-700';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10 text-blue-600">
                <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading patient records...
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-700 bg-red-100 rounded-lg flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> {error}</div>;
    }

    if (records.length === 0) {
        return (
            <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-4">
                    <FileHeart className="w-6 h-6 mr-3 text-gray-600" /> 
                    All Patient Records
                </h3>
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-medium text-gray-700">No patient records found in the system.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-4">
                <FileHeart className="w-6 h-6 mr-3 text-gray-600" /> 
                All Patient Records ({records.length})
            </h3>
            <div className="overflow-x-auto bg-white rounded-xl shadow-md">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                            <th className="px-5 py-3">Patient Name / Email</th>
                            <th className="px-5 py-3">Age</th>
                            <th className="px-5 py-3">Scan Result</th>
                            <th className="px-5 py-3 hidden md:table-cell">Report</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {records.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50/50">
                                <td className="px-5 py-4 text-sm">
                                    <p className="font-medium text-gray-900">{record.name || 'N/A'}</p>
                                    <p className="text-gray-500 text-xs">{record.email || 'No Email'}</p>
                                </td>
                                <td className="px-5 py-4 text-sm text-gray-700">{record.age || 'N/A'}</td>
                                <td className={`px-5 py-4 text-sm ${getScanResultClass(record.scan_result)}`}>
                                    {record.scan_result || 'No Scan'}
                                </td>
                                <td className="px-5 py-4 text-sm text-gray-700 hidden md:table-cell">
                                    {record.report ? (
                                        <span title={record.report} className="flex items-center text-blue-600">
                                            <FileCheck2 className="w-4 h-4 mr-1 flex-shrink-0" /> {record.report.substring(0, 50)}...
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-gray-400">
                                            <FileWarning className="w-4 h-4 mr-1 flex-shrink-0" /> No Report
                                        </span>
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