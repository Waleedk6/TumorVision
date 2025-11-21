// app/patient/share/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { 
  Loader2, Share2, Copy, Check, AlertCircle, 
  ArrowLeft, FileText, Calendar, Clock 
} from 'lucide-react';

export default function PatientSharePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser, loading: authLoading } = useAuth();
  
  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!authUser || authUser.type !== 'patient') {
      router.push('/auth/signin');
      return;
    }
    
    // Get recordId from URL if provided
    const recordId = searchParams.get('recordId');
    if (recordId) {
      setSelectedRecordId(parseInt(recordId));
    }
    
    fetchRecords();
  }, [authUser, authLoading, searchParams]);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/patient/records');
      setRecords(response.data.records || []);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(err.response?.data?.error || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!selectedRecordId) {
      setError('Please select a record to share');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await api.post(`/patient/share/${selectedRecordId}`);
      setShareLink(response.data.share_link);
      setSuccess(`Share link generated! Link expires in ${response.data.expires_in}.`);
    } catch (err) {
      console.error('Error generating share link:', err);
      setError(err.response?.data?.error || 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy link');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-green-600" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push('/patient/dashboard')}
            className="mr-4 p-2 hover:bg-white rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Share Medical Record</h1>
        </div>

        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg flex items-center border border-red-200">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 mb-6 text-green-700 bg-green-100 rounded-lg flex items-center border border-green-200">
            <Check className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Select a Record to Share</h2>
            <p className="text-sm text-gray-600 mt-1">
              Generate a secure link that you can share with other doctors
            </p>
          </div>

          <div className="p-6">
            {/* Record Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Record
              </label>
              
              {loading && !records.length ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No records available to share</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((record) => (
                    <label
                      key={record.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedRecordId === record.id
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="record"
                        value={record.id}
                        checked={selectedRecordId === record.id}
                        onChange={(e) => {
                          setSelectedRecordId(parseInt(e.target.value));
                          setShareLink('');
                          setSuccess(null);
                        }}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{record.name}</p>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(record.created_at).toLocaleDateString()}
                              <span className="mx-2">•</span>
                              Record #{record.id}
                            </div>
                          </div>
                          {record.scan_result && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              Has Scan
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateLink}
              disabled={!selectedRecordId || loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center ${
                !selectedRecordId || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-md'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5 mr-2" />
                  Generate Share Link
                </>
              )}
            </button>

            {/* Share Link Display */}
            {shareLink && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Secure Share Link</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Link expires in 7 days
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Security Note:</strong> Only share this link with trusted healthcare professionals. 
                    Anyone with this link will be able to view your medical record.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How it Works</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>Select the medical record you want to share</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>Click "Generate Share Link" to create a secure, temporary link</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>Copy and share the link with your healthcare provider</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>The link will expire automatically after 7 days for your security</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}