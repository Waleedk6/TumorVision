'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { 
    Loader2, AlertTriangle, User, Search, FileScan, 
    Mail, Upload, Eye, X, CheckCircle 
} from 'lucide-react';
import Link from 'next/link';

// ✅ Extracted Row Component
function PatientRow({ record, getScanResultClass, handleShareRecord, handleUploadFile, isUploadingId, isSharingId }) {
    const fileInputRef = useRef(null);

    return (
        <tr key={record.id} className={`hover:bg-indigo-50/50 ${isUploadingId === record.id || isSharingId === record.id ? 'opacity-50' : ''}`}>
            <td className="px-5 py-4 text-sm">
                <p className="font-medium text-gray-900">{record.name}</p>
                <p className="text-gray-500 text-xs">{record.email}</p>
            </td>
            <td className="px-5 py-4 text-sm text-gray-700 hidden md:table-cell">{record.age}</td>
            <td className="px-5 py-4 text-sm">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getScanResultClass(record.scan_result)}`}>
                    {record.scan_result || 'Scan Required'}
                </span>
            </td>
            <td className="px-5 py-4 text-sm flex space-x-2">
                <Link
                    href={`/doctor/patient/${record.id}`}
                    className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 transition"
                    title="View Details"
                >
                    <Eye className="w-4 h-4 mr-1" /> View
                </Link>
                <Link
                    href={`/doctor/mri-scan?patientId=${record.id}`}
                    className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
                    title="AI MRI Scan"
                >
                    <FileScan className="w-4 h-4 mr-1" /> Scan
                </Link>
                <button
                    onClick={() => handleShareRecord(record.id)}
                    className="flex items-center text-xs font-medium text-purple-600 hover:text-purple-800 transition disabled:opacity-50"
                    title="Share Record via Email"
                    disabled={isSharingId === record.id}
                >
                    {isSharingId === record.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Mail className="w-4 h-4 mr-1" />}
                    Share
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center text-xs font-medium text-teal-600 hover:text-teal-800 transition disabled:opacity-50"
                    title="Upload Patient File"
                    disabled={isUploadingId === record.id}
                >
                    {isUploadingId === record.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                    Upload
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleUploadFile(record.id, e.target)}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                />
            </td>
        </tr>
    );
}

// ✅ Main Component
export default function PatientList() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { user, loading: authLoading } = useAuth();
    const token = user?.token;

    // --- Action State ---
    const [actionError, setActionError] = useState(null);
    const [actionSuccess, setActionSuccess] = useState(null);
    const [isUploadingId, setIsUploadingId] = useState(null);
    const [isSharingId, setIsSharingId] = useState(null);

    const fetchData = useCallback(async () => {
        if (authLoading) return;
        if (!token) {
            setLoading(false);
            setError("Authentication token not found. Please sign in.");
            return;
        }
        if (user?.type !== 'doctor' || user?.approved !== true) {
            setLoading(false);
            setError("Access denied. Doctor account required and must be approved.");
            return;
        }

        try {
            const response = await api.get('/doctor/patient-records');
            setRecords(response.data.records || []);
        } catch (err) {
            console.error("Error fetching patient records:", err);
            setError("Failed to load patient records.");
        } finally {
            setLoading(false);
        }
    }, [token, user, authLoading]);

    useEffect(() => {
        if (!authLoading) fetchData();
    }, [fetchData, authLoading]);

    const filteredRecords = records.filter(record =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getScanResultClass = (result) => {
        if (!result) return 'text-gray-500 bg-gray-100';
        const res = result.toLowerCase();
        if (res.includes('negative') || res.includes('notumor')) return 'text-blue-800 bg-blue-100';
        if (res.includes('positive') || res.includes('glioma') || res.includes('meningioma') || res.includes('pituitary'))
            return 'text-red-800 bg-red-100';
        return 'text-gray-700 bg-gray-100';
    };

    const handleShareRecord = async (patientId) => {
        setIsSharingId(patientId);
        setActionError(null);
        setActionSuccess(null);
        try {
            await api.post('/doctor/share-patient-record', { patient_id: patientId });
            setActionSuccess("Record shared successfully!");
        } catch (err) {
            console.error("Share error:", err);
            setActionError(err.response?.data?.error || "Failed to share record.");
        } finally {
            setIsSharingId(null);
        }
    };

    const handleUploadFile = async (patientId, fileInput) => {
        const file = fileInput.files[0];
        if (!file) return;

        setIsUploadingId(patientId);
        setActionError(null);
        setActionSuccess(null);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('patient_id', patientId);

        try {
            await api.post('/doctor/upload-file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setActionSuccess(`File '${file.name}' uploaded successfully!`);
            fetchData(); // Refresh the list
        } catch (err) {
            console.error("Upload error:", err);
            setActionError(err.response?.data?.error || "Failed to upload file.");
        } finally {
            setIsUploadingId(null);
            // Clear the file input
            fileInput.value = null;
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center py-10 text-indigo-600">
                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                Loading patient records...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-700 bg-red-100 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* --- Action Alerts --- */}
            {actionError && (
                <div className="p-4 text-red-700 bg-red-100 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <span>{actionError}</span>
                    </div>
                    <button onClick={() => setActionError(null)} className="ml-auto text-red-700"><X size={18} /></button>
                </div>
            )}
            {actionSuccess && (
                <div className="p-4 text-green-700 bg-green-100 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span>{actionSuccess}</span>
                    </div>
                    <button onClick={() => setActionSuccess(null)} className="ml-auto text-green-700"><X size={18} /></button>
                </div>
            )}

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by patient name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition sm:text-sm"
                />
            </div>

            {filteredRecords.length === 0 ? (
                <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <User className="w-10 h-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-lg font-medium text-gray-700">No patient records found.</p>
                    <p className="text-sm text-gray-500">Try adjusting your search or add a new patient.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-md">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                <th className="px-5 py-3">Patient</th>
                                <th className="px-5 py-3 hidden md:table-cell">Age</th>
                                <th className="px-5 py-3">Scan Status</th>
                                <th className="px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRecords.map((record) => (
                                <PatientRow
                                    key={record.id}
                                    record={record}
                                    getScanResultClass={getScanResultClass}
                                    handleShareRecord={handleShareRecord}
                                    handleUploadFile={handleUploadFile}
                                    isUploadingId={isUploadingId}
                                    isSharingId={isSharingId}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}