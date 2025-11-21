'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import AuthGuard from '../../../components/AuthGuard';
import { 
  Loader2, FileText, Calendar, User, Download, 
  AlertCircle, ArrowLeft, Brain, Stethoscope, Upload,
  Save, Image as ImageIcon, X, CheckCircle
} from 'lucide-react';

// Helper function to convert file to Base64
const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

// --- FIX 1: ADDED urlToBase64 HELPER ---
// Fetches an image from a URL and converts it to a Base64 string
const urlToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  } catch (err) {
    console.error('Error in urlToBase64:', err);
    throw err; // Re-throw the error to be caught by handleRunAIScan
  }
};

export default function PatientRecordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; 

  const { user: authUser, loading: authLoading } = useAuth();
  
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Doctor Action States ---
  const [reportText, setReportText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null); // This holds the preview for a *new* upload
  const [existingFileUrl, setExistingFileUrl] = useState(null); // This holds the URL of the *saved* file
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // --- FIX 3: ADDED existingFileIsImage TO DEPENDENCY ARRAY ---
  // (We define this variable earlier now)
  const existingFileIsImage = existingFileUrl && existingFileUrl.match(/\.(jpeg|jpg|png)$/i);

  const fetchRecord = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/doctor/record/${id}`);
      setRecord(response.data);
      setReportText(response.data.report || '');
      
      // Store the existing file URL
      if (response.data.file_path) {
        // Use the full URL to the backend's static folder
        setExistingFileUrl(`http://127.0.0.1:5000/static/uploads/${response.data.file_name}`);
      } else {
        setExistingFileUrl(null);
      }
      
      // Clear any new file previews, since we just re-fetched
      setFilePreview(null); 
      setSelectedFile(null);

    } catch (err) {
      console.error('Error fetching record:', err);
      setError(err.response?.data?.error || 'Failed to load record');
    } finally {
      setLoading(false);
    }
  }, [id]); // Dependency on 'id'

  useEffect(() => {
    if (authLoading) return;
    if (!authUser || authUser.type !== 'doctor') {
      router.push('/auth/signin');
      return;
    }
    fetchRecord();
  }, [id, authUser, authLoading, fetchRecord, router]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setActionSuccess(null);
      setActionError(null);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result); // Show preview for new image
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null); // Clear preview if it's not an image (e.g., PDF)
      }
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      setActionError('Please select a file to upload.');
      return;
    }
    setIsUploading(true);
    setActionError(null);
    setActionSuccess(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('patient_id', id);

    try {
      await api.post('/doctor/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setActionSuccess('File uploaded successfully!');
      setSelectedFile(null); // Clear selection
      fetchRecord(); // Refresh data (this will re-set file previews)
    } catch (err) {
      console.error('File upload error:', err);
      setActionError(err.response?.data?.error || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveReport = async () => {
    setIsSavingReport(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.post('/doctor/save-report', {
        patient_id: id,
        report: reportText,
      });
      setActionSuccess('Report saved successfully!');
      fetchRecord(); // Refresh data
    } catch (err) {
      console.error('Save report error:', err);
      setActionError(err.response?.data?.error || 'Failed to save report');
    } finally {
      setIsSavingReport(false);
    }
  };

  // --- FIX 2: UPDATED handleRunAIScan ---
  const handleRunAIScan = async () => {
    setIsScanning(true);
    setActionError(null);
    setActionSuccess(null);
    
    let base64Image;

    // We must wrap the logic in a try/catch, as urlToBase64 can fail
    try {
      if (selectedFile && filePreview) {
        // 1. Use the new file that's been selected (already base64)
        base64Image = filePreview;
      } else if (!selectedFile && existingFileUrl && existingFileIsImage) {
        // 2. Use the existing file - MUST FETCH AND CONVERT
        // This is the main fix.
        base64Image = await urlToBase64(existingFileUrl);
      } else {
        // 3. No valid image source
        setActionError('Please upload or select an image file first to run the scan.');
        setIsScanning(false);
        return;
      }

      // If we got here, base64Image is valid. Run the scan.
      await api.post('/doctor/mri-scan', {
        patient_id: id,
        image_base64: base64Image,
      });
      setActionSuccess('AI Scan complete! Record updated.');
      fetchRecord(); // Refresh data to show new scan results

    } catch (err) {
      console.error('AI scan error:', err);
      // Handle errors from both the conversion (urlToBase64) and the API call
      const errorMsg = err.response?.data?.error || err.message || 'AI Scan failed';
      setActionError(errorMsg);
    } finally {
      setIsScanning(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return null; // Should be covered by loading/error
  }

  // --- FIX 3 (moved definition earlier) ---
  // const existingFileIsImage = existingFileUrl && existingFileUrl.match(/\.(jpeg|jpg|png)$/i);

  return (
    <AuthGuard requiredRole="doctor">
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/doctor/patients')}
                className="mr-4 p-2 hover:bg-white rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Patient Record</h1>
                <p className="text-gray-600">Viewing record #{record.id}</p>
              </div>
            </div>
          </div>

          {/* Action Alerts */}
          {actionError && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{actionError}</span>
              <button onClick={() => setActionError(null)} className="ml-auto text-red-700"><X size={18} /></button>
            </div>
          )}
          {actionSuccess && (
            <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg flex items-center">
              {/* Changed icon to CheckCircle for success */}
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>{actionSuccess}</span>
              <button onClick={() => setActionSuccess(null)} className="ml-auto text-green-700"><X size={18} /></button>
            </div>
          )}

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Actions */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Upload Scan */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-indigo-600" />
                  Upload Scan
                </h3>
                
                {/* Show preview for NEWLY selected file */}
                {filePreview && (
                  <div className="mb-4 relative">
                    <img 
                      src={filePreview} 
                      alt="Selected preview" 
                      className="w-full h-48 object-contain rounded-lg bg-gray-100 p-2" 
                    />
                  </div>
                )}
                
                {/* Show EXISTING file if no new file is selected */}
                {existingFileUrl && !selectedFile && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current File:</p>
                    {existingFileIsImage ? (
                       <img 
                        src={existingFileUrl} 
                        alt="Existing scan" 
                        className="w-full h-48 object-contain rounded-lg bg-gray-100 p-2 mb-2" 
                      />
                    ) : null}
                    <button
                      onClick={() => window.open(existingFileUrl, '_blank')}
                      className="flex items-center text-sm text-indigo-600 hover:underline"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {record.file_name || 'Download File'}
                    </button>
                  </div>
                )}
                
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, application/pdf" // Specify accepted file types
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />

                <button
                  onClick={handleUploadFile}
                  disabled={!selectedFile || isUploading}
                  className="w-full mt-4 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:bg-gray-300 flex items-center justify-center"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload File'}
                </button>
              </div>

              {/* Run AI Scan */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-600" />
                  AI Analysis
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Run AI scan on the uploaded image to detect tumors.
                </p>
                <button
                  onClick={handleRunAIScan}
                  // Disable if scanning OR if there's no new image AND no existing image
                  disabled={isScanning || (!filePreview && !existingFileIsImage)}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:bg-gray-300 flex items-center justify-center"
                >
                  {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Run AI Scan'}
                </button>
              </div>
            </div>

            {/* Right Column: Details & Report */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Patient Details */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{record.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{record.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium text-gray-900">{record.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(record.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scan Results */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan Results</h3>
                {record.scan_result && (
                  <div className="p-4 bg-blue-50 rounded-lg mb-4">
                    <p className="text-sm font-medium text-blue-800 mb-1">AI Diagnosis:</p>
                    <p className="text-lg font-semibold text-blue-900">{record.scan_result}</p>
                  </div>
                )}
                {record.processed_image && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Processed Image</h4>
                    <img
                      // --- FIX 4: Use processed_image URL directly ---
                      // The backend already returns a full URL or base64 data URL
                      src={record.processed_image}
                      alt="Processed scan"
                      className="w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                {!record.scan_result && !record.processed_image && (
                  <p className="text-gray-500">No AI scan has been run yet.</p>
                )}
              </div>

              {/* Doctor's Report */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
                  Doctor's Report
                </h3>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  rows="8"
                  placeholder="Write your detailed report here..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleSaveReport}
                  disabled={isSavingReport}
                  className="w-full mt-4 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:bg-gray-300 flex items-center justify-center"
                >
                  {isSavingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  Save Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}