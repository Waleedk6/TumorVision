'use client';
import AuthGuard from '../../components/AuthGuard';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import {
  Stethoscope,
  UserPlus,
  FileText,
  LogOut,
  Settings,
  ShieldCheck,
  TrendingUp,
  Brain,
  UserCheck,
  MessageSquare // <-- 1. IMPORTED NEW ICON
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user, signOut } = useAuth();
  const doctorName = user?.name || 'Doctor';

  // Reusable Card Component
  const ActionCard = ({ title, description, Icon, href, color = 'indigo' }) => {
    const bgClass = `bg-${color}-50`;
    const borderClass = `border-${color}-200`;
    const iconColorClass = `text-${color}-500`;
    const hoverBgClass = `hover:bg-${color}-100`;

    return (
      <Link
        href={href}
        key={href} // Added key prop for list items
        className={`group block p-8 bg-white border ${borderClass} rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-[1.03] ${bgClass} ${hoverBgClass}`}
      >
        <Icon className={`w-9 h-9 ${iconColorClass} mb-4 group-hover:text-${color}-700 transition`} />
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </Link>
    );
  };

  return (
    <AuthGuard requiredRole="doctor">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 md:p-12">
        {/* Header & Sign Out */}
        <header className="flex justify-between items-center mb-12 pb-4 bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <Stethoscope className="w-10 h-10 text-indigo-600 mr-4" />
            <h1 className="text-3xl font-extrabold text-gray-900">
              Dr. {doctorName}'s Dashboard
            </h1>
          </div>
          <button
            onClick={signOut}
            className="flex items-center text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full transition shadow-md hover:shadow-lg"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </button>
        </header>

        {/* <-- 3. UPDATED GRID FOR 4 CARDS --> */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ActionCard
            title="Manage Patient Records"
            description="View, edit, and search all patient health records and histories."
            Icon={FileText}
            href="/doctor/patients"
            color="blue"
          />
          
          {/* <-- 2. ADDED NEW CHAT CARD --> */}
          <ActionCard
            title="Patient Chat"
            description="View chat history and send secure messages to your patients."
            Icon={MessageSquare}
            href="/doctor/patients" // Links to the same patient list
            color="indigo"
          />
          
          <ActionCard
            title="Register New Patient"
            description="Quickly register a new patient account."
            Icon={UserPlus}
            href="/doctor/add-patient"
            color="blue"
          />

          <ActionCard
            title="Update Profile Settings"
            description="Manage your professional profile and information."
            Icon={Settings}
            href="/doctor/profile-settings"
            color="indigo"
          />
        </main>

        {/* Status and Analytics Section */}
        <section className="mt-16 bg-white p-8 border border-indigo-100 rounded-xl shadow-xl">
          <h3 className="text-2xl font-bold text-indigo-800 mb-5 flex items-center">
            <ShieldCheck className="w-6 h-6 mr-3 text-indigo-600" /> System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 bg-green-50 rounded-lg flex items-center justify-between">
              <div className="text-lg text-gray-700 font-medium">AI Model</div>
              <div className="flex items-center text-green-600 font-bold">
                <TrendingUp className="w-5 h-5 mr-1" /> Online
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg flex items-center justify-between">
              <div className="text-lg text-gray-700 font-medium">Database</div>
              <div className="flex items-center text-blue-600 font-bold">
                <ShieldCheck className="w-5 h-5 mr-1" /> Secure
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg flex items-center justify-between">
              <div className="text-lg text-gray-700 font-medium">Pending Approvals</div>
              <div className="text-lg text-yellow-600 font-bold">0</div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg flex items-center justify-between">
              <div className="text-lg text-gray-700 font-medium">Account Status</div>
              <div className="flex items-center text-indigo-600 font-bold">
                <UserCheck className="w-5 h-5 mr-1" /> Verified
              </div>
            </div>
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}