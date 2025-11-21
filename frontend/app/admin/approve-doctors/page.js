import AuthGuard from '../../components/AuthGuard';
import PendingDoctorList from '../../components/Admin/PendingDoctorList';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ApproveDoctorsPage() {
    return (
        <AuthGuard requiredRole="admin">
            <div className="min-h-screen bg-gray-50 p-6 md:p-12">
                <header className="mb-8">
                    <Link href="/admin/dashboard" className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </Link>
                    <div className="border-b pb-4">
                        <h1 className="text-3xl font-bold text-gray-900">Doctor Approval Queue</h1>
                        <p className="mt-1 text-gray-500">Review doctor submissions and grant access to the platform.</p>
                    </div>
                </header>
                <main>
                    <PendingDoctorList />
                </main>
            </div>
        </AuthGuard>
    );
}