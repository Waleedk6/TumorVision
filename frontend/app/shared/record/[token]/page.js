// app/shared/record/[token]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../lib/api'; // Check if this path is correct
import { 
  Loader2, FileText, Calendar, User, Download, 
  AlertCircle, ShieldX, Clock, Brain, Stethoscope 
} from 'lucide-react';

// This component will render the public, shared record
export default function SharedRecordPage() {
  const params = useParams();
  const token = params.token; // Get token from URL

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('No share link provided.');
      setLoading(false);
      return;
    }

    const fetchSharedRecord = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the new public API route
        const response = await api.get(`/public/record/${token}`);
        setRecord(response.data);
      } catch (err) {
        console.error('Error fetching shared record:', err);
        const errorMsg = err.response?.data?.error || 'Failed to load record.';
        
        if (errorMsg.includes('expired')) {
          setError('This share link has expired.');
        } else if (errorMsg.includes('invalid')) {
          setError('This share link is invalid or has been tampered with.');
        } else {
          setError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSharedRecord();
  }, [token]);

  const handleDownloadFile = (filePath, fileName) => {
    if (!filePath) return;
    // Assumes backend serves files from 127.0.0.1:5000
    const fileUrl = `http://127.0.0.1:5000/${filePath}`;
    window.open(fileUrl, '_blank');
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-700">Loading secure record...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    const Icon = error.includes('expired') ? Clock : ShieldX;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-lg border-t-8 border-red-500">
          <Icon className="w-12 h-12 mx-auto text-red-600 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-700 mb-6">
            {error}
          </p>
          <p className="text-sm text-gray-500">
            Please contact the patient and request a new share link.
          </p>
        </div>
      </div>
    );
  }

  // Success State
  if (!record) {
    return null; // Should be covered by loading/error
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-4 bg-white rounded-t-xl shadow-lg border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Shared Medical Record</h1>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Read-Only
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            This is a secure, read-only view of a patient record.
          </p>
        </div>

        {/* Record Details */}
        <div className="bg-white rounded-b-xl shadow-lg p-6 md:p-8 space-y-8">
          
          {/* Patient Info */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{record.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium text-gray-900">{record.age}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Record Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(record.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Patient Email (Masked)</p>
              <p className="font-medium text-gray-900">
                {record.email.substring(0, 2)}***@{record.email.split('@')[1]}
              </p>
            </div>
          </div>

          {/* Scan Result */}
          {record.scan_result && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-600" />
                AI Scan Analysis
              </h3>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-1">Diagnosis Result:</p>
                <p className="text-lg font-semibold text-blue-900">{record.scan_result}</p>
              </div>
            </div>
          )}

          {/* Processed Image */}
          {record.processed_image && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Processed Scan Image</h3>
              <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                <img
                  src={record.processed_image}
                  alt="Processed scan"
                  className="w-full h-auto rounded"
                />
              </div>
            </div>
          )}

          {/* Doctor's Report */}
          {record.report && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center">
                <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
                Doctor's Report
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap">{record.report}</p>
              </div>
            </div>
          )}

          {/* Attached File */}
          {record.file_path && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Attached File
              </h3>
              <button
                onClick={() => handleDownloadFile(record.file_path, record.file_name)}
                className="flex items-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow"
              >
                <Download className="w-4 h-4 mr-2" />
                Download {record.file_name || 'File'}
              </button>
            </div>
          )}

          {/* Fallback for empty record */}
          {!record.scan_result && !record.report && !record.processed_image && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No analysis or report has been added to this record yet.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}