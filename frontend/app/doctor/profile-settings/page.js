// app/doctor/profile-settings/page.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, User, Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function ProfileSettingsPage() {
    const router = useRouter();
    const { user: authUser, loading: authLoading } = useAuth();

    const [doctorData, setDoctorData] = useState({
        name: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        hospital: '',
        university: '',
        profile_image: null,
        about: '',
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        console.log('Auth state:', { 
            authUser, 
            authLoading,
            token: authUser?.token ? 'exists' : 'missing' 
        });
        
        // Wait for auth to finish loading
        if (authLoading) {
            console.log('Auth still loading...');
            return;
        }

        // Check if user is authenticated
        if (!authUser || !authUser.token) {
            console.log('No authenticated user, redirecting to signin');
            return;
        }

        // Check if user is an approved doctor
        if (authUser.type !== 'doctor') {
            console.log('User is not a doctor, redirecting...');
            router.push('/signin');
            return;
        }

        if (!authUser.approved) {
            console.log('Doctor not approved, redirecting to dashboard...');
            router.push('/doctor/dashboard');
            return;
        }

        // User is authenticated and authorized - fetch profile
        console.log('User is authorized, fetching profile...');
        fetchDoctorProfile();
    }, [authUser, authLoading]);

    const fetchDoctorProfile = async () => {
        console.log('fetchDoctorProfile called');
        
        if (!authUser?.token) {
            console.error('No token available');
            setError("Authentication token not found. Please sign in again.");
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            console.log('Making request to /doctor/profile');
            
            const response = await api.get('/doctor/profile');
            
            console.log('Profile data received:', response.data);
            
            const profile = response.data;
            setDoctorData({
                name: profile.name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                country: profile.country || '',
                city: profile.city || '',
                hospital: profile.hospital || '',
                university: profile.university || '',
                profile_image: profile.profile_image || null,
                about: profile.about || '',
            });
            
            if (profile.profile_image) {
                setImagePreview(`http://127.0.0.1:5000/static/uploads/${profile.profile_image}`);
            }
            
            setError(null);
        } catch (err) {
            console.error("Error fetching profile:", err);
            console.error("Error response:", err.response);
            
            if (err.response?.status === 401) {
                setError("Session expired. Please sign in again.");
            } else if (err.response?.status === 403) {
                setError("Your account is not approved yet or access is denied.");
            } else {
                setError(err.response?.data?.error || err.message || "Failed to load profile data.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDoctorData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
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
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    const handleImageClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        
        // Add all updatable fields
        if (imageFile) {
            formData.append('profile_image', imageFile);
        }
        formData.append('about', doctorData.about || '');
        formData.append('name', doctorData.name || '');
        formData.append('phone', doctorData.phone || '');
        formData.append('country', doctorData.country || '');
        formData.append('city', doctorData.city || '');
        formData.append('hospital', doctorData.hospital || '');
        formData.append('university', doctorData.university || '');

        try {
            console.log('Submitting profile update...');
            const response = await api.post('/doctor/update-profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            console.log('Update response:', response.data);
            setSuccess(response.data.message || "Profile updated successfully!");
            setIsEditing(false);
            setImageFile(null);
            
            // Refresh profile data after update
            setTimeout(() => {
                fetchDoctorProfile();
            }, 500);
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err.response?.data?.error || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while auth is loading
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100 p-4">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-600" />
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show loading while fetching profile
    if (loading && !doctorData.email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100 p-4">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-600" />
                    <p className="mt-2 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Show message if not authenticated
    if (!authUser || !authUser.token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100 p-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                    <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600 mb-6">Please sign in to access your profile.</p>
                    <button
                        onClick={() => router.push('/auth/signin')}
                        className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200"
                    >
                        Go to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                    >
                        <span className="mr-1">← Back</span>
                    </button>
                </div>

                {error && (
                    <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg flex items-center border border-red-200">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <div className="flex-1">
                            <span>{error}</span>
                        </div>
                        {error.includes("sign in") && (
                            <button
                                onClick={() => router.push('/auth/signin')}
                                className="ml-4 text-sm underline hover:no-underline"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                )}

                {success && (
                    <div className="p-4 mb-6 text-green-700 bg-green-100 rounded-lg flex items-center border border-green-200">
                        <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Profile Image Section */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`relative w-32 h-32 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden ${
                                        isEditing ? 'cursor-pointer' : 'cursor-default'
                                    } group`}
                                    onClick={handleImageClick}
                                >
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Profile Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-12 h-12 text-gray-400" />
                                    )}
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png"
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    {isEditing ? 'Click to change profile picture' : 'Profile picture'}
                                </p>
                            </div>

                            {/* Basic Info Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={doctorData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-500'
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={doctorData.email}
                                        disabled
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-100 border-transparent text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={doctorData.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-500'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={doctorData.country}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-500'
                                    }`}
                                />
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={doctorData.city}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-500'
                                    }`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                                <input
                                    type="text"
                                    id="hospital"
                                    name="hospital"
                                    value={doctorData.hospital}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-500'
                                    }`}
                                />
                            </div>
                            <div>
                                <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">University</label>
                                <input
                                    type="text"
                                    id="university"
                                    name="university"
                                    value={doctorData.university}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-500'
                                    }`}
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">About</label>
                            <textarea
                                id="about"
                                name="about"
                                rows="4"
                                value={doctorData.about}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                placeholder="Tell us about yourself..."
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-500'
                                }`}
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setImageFile(null);
                                            setSuccess(null);
                                            fetchDoctorProfile();
                                        }}
                                        className="py-2 px-6 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`py-2 px-6 font-medium rounded-lg transition duration-200 ${
                                            loading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md'
                                        }`}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                Saving...
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </div>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}