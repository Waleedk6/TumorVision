'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '../../components/AuthGuard';
import api from '../../../lib/api'; // Make sure this path is correct
import Link from 'next/link';
import { 
    ArrowLeft, 
    UserPlus, 
    FileText, 
    MessageSquare, // <-- Added for Chat
    User, 
    Loader2, 
    AlertCircle 
} from 'lucide-react';

export default function ManagePatientsPage() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true);
                const response = await api.get('/doctor/patient-records');
                const records = response.data.records || [];

                // Create a unique list of patients by email
                const patientMap = new Map();
                records.forEach(record => {
                    if (!patientMap.has(record.email)) {
                        patientMap.set(record.email, {
                            email: record.email,
                            name: record.name,
                            // We can add the first record ID for "view"
                            record_id: record.id 
                        });
                    }
                });

                setPatients(Array.from(patientMap.values()));
                setError('');
            } catch (err) {
                console.error('Error fetching patient records:', err);
                setError('Failed to load patient list.');
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    return (
        <AuthGuard requiredRole="doctor">
            <div className="min-h-screen bg-gray-50 p-6 md:p-12">
                <header className="mb-8">
                    <Link href="/doctor/dashboard" className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-center border-b pb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <FileText className="w-8 h-8 mr-3 text-indigo-600" />
                                Patient Management & Chat
                            </h1>
                            <p className="mt-1 text-gray-500">View patient records or start a secure chat.</p>
                        </div>
                        <div className="flex gap-3">
                            {/* This button is good here */}
                            <Link
                                href="/doctor/add-patient"
                                className="flex items-center text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition shadow-md"
                            >
                                <UserPlus className="w-4 h-4 mr-2" /> Add New Patient
                            </Link>
                        </div>
                    </div>
                </header>
                <main>
                    {/* Replaced <PatientList /> with the logic directly */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        {loading && (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                <p className="ml-3 text-gray-700">Loading Patients...</p>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="flex flex-col items-center justify-center h-40 text-red-600">
                                <AlertCircle className="w-10 h-10 mb-2" />
                                <p className="font-semibold">{error}</p>
                            </div>
                        )}

                        {!loading && !error && patients.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                <User className="w-10 h-10 mb-2" />
                                <p className="font-semibold">No Patient Records Found</p>
                            </div>
                        )}

                        {/* This is the patient list */}
                        {!loading && !error && patients.length > 0 && (
                            <ul className="divide-y divide-gray-200">
                                {patients.map(patient => (
                                    <li key={patient.email} className="flex items-center justify-between p-4">
                                        {/* Patient Info */}
                                        <div className="flex items-center">
                                            <div className="p-3 bg-indigo-100 rounded-full mr-4">
                                                <User className="w-5 h-5 text-indigo-700" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold text-gray-800">{patient.name}</p>
                                                <p className="text-sm text-gray-600">{patient.email}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {/* CHAT BUTTON */}
                                            <Link
                                                href={`/doctor/chat/${encodeURIComponent(patient.email)}`}
                                                className="flex items-center text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition shadow-md"
                                                title="Chat with Patient"
                                            >
                                                <MessageSquare className="w-4 h-4 mr-0 md:mr-2" />
                                                <span className="hidden md:block">Chat</span>
                                            </Link>
                                            
                                            {/* VIEW RECORDS BUTTON */}
                                            <Link
                                                href={`/doctor/patient/${patient.record_id}`}
                                                className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
                                                title="View Patient Record"
                                            >
                                                <FileText className="w-4 h-4 mr-0 md:mr-2" />
                                                <span className="hidden md:block">View</span>
                                            </Link>
                                            
                                            {/* We can add Share/Upload buttons here later */}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}