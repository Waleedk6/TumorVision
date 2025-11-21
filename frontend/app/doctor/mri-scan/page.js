// app/doctor/mri-scan/page.js
'use client'; // If using client-side logic
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // For Pages Router, use useRouter
import api from '../../../lib/api'; // Adjust path as needed
import { useAuth } from '../../hooks/useAuth'; // Adjust path as needed
import { Loader2, AlertCircle, Upload, FileImage, Brain, CheckCircle, XCircle, Eye, X } from 'lucide-react';

export default function MRIScanPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const patientId = searchParams.get('patientId'); // Get patientId from query string
    const { token } = useAuth(); // Get token from auth context

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);

    // Optional: Fetch patient details if needed
    useEffect(() => {
        if (!patientId) {
            setError("Patient ID is required.");
        }
    }, [patientId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                setError("Please select a valid image file (JPG, PNG).");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setResult(null); // Reset previous result
                setProcessedImage(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleScan = async () => {
        if (!imageFile || !patientId) {
            setError("Please select an image and ensure Patient ID is loaded.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setProcessedImage(null);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result; // This is the data URL, e.g., "image/jpeg;base64,..."

            try {
                const response = await api.post('/doctor/mri-scan', {
                    patient_id: patientId,
                    image_base64: base64String
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Include token
                    }
                });

                setResult(response.data);
                if (response.data.processed_image) {
                    // If the backend returns the processed image as a data URL
                    setProcessedImage(response.data.processed_image);
                    // Or if it returns a URL to the processed image on the server
                    // setProcessedImage(response.data.saved_url);
                }
                // Add to scan history (simplified)
                setScanHistory(prev => [...prev.slice(-4), { id: Date.now(), patientId, result: response.data.result, timestamp: new Date().toISOString() }]);
            } catch (err) {
                console.error("MRI Scan Error:", err);
                setError(err.response?.data?.error || "Failed to process MRI scan.");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsDataURL(imageFile);
    };

    if (!patientId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-200">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient ID Missing</h2>
                    <p className="text-gray-600 mb-6">Cannot perform scan without a valid patient ID.</p>
                    <button
                        onClick={() => router.back()}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <Brain className="w-8 h-8 mr-3 text-indigo-600" />
                            AI MRI Analysis
                        </h1>
                        <p className="text-gray-600 mt-1">Patient ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{patientId}</span></p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                    >
                        <X className="w-4 h-4 mr-1" /> Back to Patients
                    </button>
                </div>

                {error && (
                    <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg flex items-center border border-red-200">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload & Preview Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Upload className="w-5 h-5 mr-2 text-indigo-600" />
                            Upload MRI Image
                        </h2>
                        <div className="flex flex-col items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                                {imagePreview ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-contain rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FileImage className="w-12 h-12 text-gray-400 mb-3" />
                                        <p className="text-sm text-gray-500 mb-2">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-400">JPG, PNG (MAX. 10MB)</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                />
                            </label>
                            <button
                                onClick={handleScan}
                                disabled={loading || !imageFile}
                                className={`mt-4 w-full py-3 px-4 rounded-lg font-medium text-white transition duration-200 ${
                                    loading || !imageFile
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Analyzing...
                                    </div>
                                ) : (
                                    'Start AI Analysis'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Eye className="w-5 h-5 mr-2 text-indigo-600" />
                            Analysis Result
                        </h2>
                        {result ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                                    <h3 className="font-medium text-gray-900">Prediction</h3>
                                    <div className="flex items-center mt-2">
                                        {result.result.toLowerCase().includes('notumor') ? (
                                            <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-red-500 mr-2" />
                                        )}
                                        <span className={`text-lg font-semibold ${
                                            result.result.toLowerCase().includes('notumor') ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {result.result}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">Confidence: {(result.confidence * 100).toFixed(2)}%</p>
                                </div>
                                {processedImage && (
                                    <div className="mt-4">
                                        <h3 className="text-md font-medium text-gray-900 mb-2">Annotated Image:</h3>
                                        {/* If processedImage is a data URL */}
                                        {processedImage.startsWith('data:image') && (
                                            <img
                                                src={processedImage}
                                                alt="Processed"
                                                className="max-h-64 max-w-full object-contain border rounded-lg shadow-sm"
                                            />
                                        )}
                                        {/* If processedImage is a server URL */}
                                        {processedImage.startsWith('http') && (
                                            <img
                                                src={processedImage}
                                                alt="Processed"
                                                className="max-h-64 max-w-full object-contain border rounded-lg shadow-sm"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                                <Eye className="w-12 h-12 mb-3" />
                                <p className="text-center">Upload an MRI image and click "Start AI Analysis" to see the results here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scan History (Optional) */}
                {scanHistory.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Scans</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {scanHistory.map((scan) => (
                                        <tr key={scan.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{scan.patientId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scan.result}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(scan.timestamp).toLocaleTimeString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}