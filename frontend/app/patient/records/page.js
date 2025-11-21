// app/patient/records/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import AuthGuard from '../../components/AuthGuard';
import { 
  Loader2, FileText, Calendar, User, Download, 
  Eye, AlertCircle, ArrowLeft, Share2, Image as ImageIcon 
} from 'lucide-react';

export default function PatientRecordsPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!authUser || authUser.type !== 'patient') {
      router.push('/auth/signin');
      return;
    }
    
    fetchRecords();
  }, [authUser, authLoading]);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching patient records...');
      const response = await api.get('/patient/records');
      console.log('Records received:', response.data);
      setRecords(response.data.records || []);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(err.response?.data?.error || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
  };

  const handleCloseDetails = () => {
    setSelectedRecord(null);
  };

  const handleDownloadFile = (filePath, fileName) => {
    if (!filePath) return;
    const fileUrl = `http://127.0.0.1:5000/${filePath}`;
    window.open(fileUrl, '_blank');
  };

  const handleShare = (recordId) => {
    router.push(`/patient/share?recordId=${recordId}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-green-600" />
          <p className="mt-2 text-gray-600">Loading your records...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard requiredRole="patient">
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/patient/dashboard')}
                className="mr-4 p-2 hover:bg-white rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">My Medical Records</h1>
            </div>
          </div>

          {error && (
            <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg flex items-center border border-red-200">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Records Grid */}
          {records.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Records Yet</h3>
              <p className="text-gray-500">Your medical records will appear here once your doctor adds them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.name}</h3>
                        <p className="text-sm text-gray-500">Record #{record.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(record.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>Age: {record.age}</span>
                    </div>
                  </div>

                  {record.scan_result && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-800 mb-1">Scan Result:</p>
                      <p className="text-sm text-blue-900">{record.scan_result}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleShare(record.id)}
                      className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Record Details Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Record Details</h2>
                    <button
                      onClick={handleCloseDetails}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Patient Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">{selectedRecord.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{selectedRecord.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="font-medium text-gray-900">{selectedRecord.age}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedRecord.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scan Result */}
                  {selectedRecord.scan_result && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Scan Result</h3>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-900">{selectedRecord.scan_result}</p>
                      </div>
                    </div>
                  )}

                  {/* Processed Image */}
                  {selectedRecord.processed_image && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Processed Scan Image</h3>
                      <div className="border border-gray-200 rounded-lg p-2">
                        <img
                          src={selectedRecord.processed_image}
                          alt="Processed scan"
                          className="w-full h-auto rounded"
                        />
                      </div>
                    </div>
                  )}

                  {/* Report */}
                  {selectedRecord.report && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Doctor's Report</h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedRecord.report}</p>
                      </div>
                    </div>
                  )}

                  {/* Attached File */}
                  {selectedRecord.file_path && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Attached File</h3>
                      <button
                        onClick={() => handleDownloadFile(selectedRecord.file_path, selectedRecord.file_name)}
                        className="flex items-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download {selectedRecord.file_name || 'File'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}