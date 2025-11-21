'use client';
import AuthGuard from '../../components/AuthGuard'; // <-- FIXED: Using alias
import { useAuth } from '../../hooks/useAuth'; // <-- FIXED: Using alias
import Link from 'next/link';
import { UserCog, LogOut } from 'lucide-react';

// --- NEW IMPORTS ---
// We import the components that will be displayed on this page
import PendingDoctorList from '../../components/Admin/PendingDoctorList';
import UserManagementTable from '../../components/Admin/UserManagementTable';
// -------------------

// --- FIXED ---
// const PENDING_DOCTOR_COUNT = 5; // Removed this hardcoded constant

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const adminName = user?.name || 'Administrator';

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        
        {/* Header & Sign Out */}
        <header className="flex justify-between items-center mb-12 pb-6 border-b border-gray-300">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center tracking-tight">
            <UserCog className="w-10 h-10 mr-4 text-blue-700" /> 
            Welcome, {adminName}
          </h1>
          <button
            onClick={signOut}
            className="flex items-center text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full transition shadow-md"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </button>
        </header>

        {/* --- Main Content Area: Dynamic Components --- */}
        <main className="space-y-12">
            
            {/* 1. Pending Doctors Section (This component now dynamically shows the count) */}
            <section id="pending-doctors">
                <PendingDoctorList />
            </section>

            {/* 2. User Management Section */}
            <section id="manage-users">
                <UserManagementTable />
            </section>
          
        </main>
        
        {/* Footer Section */}
        <section className="mt-16 p-6 bg-white border border-gray-200 rounded-xl shadow-inner">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Administrative Summary</h3>
          <p className="text-sm text-gray-600">All key user management functions are handled above. This panel provides immediate access to doctor approval and system auditing.</p>
        </section>

      </div>
    </AuthGuard>
  );
}