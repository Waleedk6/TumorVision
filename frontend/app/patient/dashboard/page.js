'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../../lib/api';
import AuthGuard from '../../components/AuthGuard';
import Link from 'next/link';
import { 
  FileText, Share2, LogOut, ShieldCheck, 
  Activity, Calendar, TrendingUp, Loader2,
  MessageSquare // <-- 1. IMPORT THE NEW ICON
} from 'lucide-react';

export default function PatientDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalRecords: 0,
    recentRecords: 0,
    hasScans: 0
  });
  const [loading, setLoading] = useState(false);
  const patientName = user?.name || 'User';

  useEffect(() => {
    if (!authLoading && user?.token) {
      fetchStats();
    }
  }, [user, authLoading]);

  const fetchStats = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const response = await api.get('/patient/records');
      const records = response.data.records || [];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

      setStats({
        totalRecords: records.length,
        recentRecords: records.filter(r => new Date(r.created_at) > thirtyDaysAgo).length,
        hasScans: records.filter(r => r.scan_result).length
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, Icon, color = 'green' }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : value}
          </p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ActionCard = ({ title, description, Icon, href }) => (
    <Link 
      href={href}
      className="block p-6 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl hover:border-green-400 transition duration-300 transform hover:scale-[1.02]"
    >
      <Icon className="w-8 h-8 text-green-600 mb-3" />
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </Link>
  );

  return (
    <AuthGuard requiredRole="patient">
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-6 md:p-10">
        <header className="flex justify-between items-center mb-10 pb-4 border-b border-green-200">
          <h1 className="text-3xl font-bold text-green-900 flex items-center">
            <ShieldCheck className="w-8 h-8 mr-3 text-green-600" /> 
            Hello, {patientName}
          </h1>
          <button
            onClick={signOut}
            className="flex items-center text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition shadow-md"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Records" value={stats.totalRecords} Icon={FileText} color="green" />
          <StatCard title="Recent (30d)" value={stats.recentRecords} Icon={Calendar} color="blue" />
          <StatCard title="Scanned" value={stats.hasScans} Icon={Activity} color="purple" />
        </div>

        {/* // <-- 2. CHANGED TO 3 COLUMNS --> */}
        <main className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10"> 
          <ActionCard 
            title="My Medical Records"
            description="View all uploaded files, scan results, and doctor reports."
            Icon={FileText}
            href="/patient/records"
          />
          <ActionCard 
            title="Share My Record"
            description="Generate a secure link to share your records with other doctors."
            Icon={Share2}
            href="/patient/share"
          />
          {/* // <-- 3. ADDED NEW CHAT CARD --> */}
          <ActionCard 
            title="Chat with Doctor"
            description="Send a secure message or question to your doctor."
            Icon={MessageSquare}
            href="/patient/chat"
          />
        </main>

        <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" /> Quick Access
          </h3>
          {/* // <-- 4. CHANGED TO 3 COLUMNS & ADDED CHAT --> */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/patient/records" className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition">
              <FileText className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">View All Records</p>
                <p className="text-xs text-gray-600">Access your complete medical history</p>
              </div>
            </Link>
            <Link href="/patient/share" className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
              <Share2 className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Share Records</p>
                <p className="text-xs text-gray-600">Generate secure share links</p>
              </div>
            </Link>
            <Link href="/patient/chat" className="flex items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">
              <MessageSquare className="w-5 h-5 text-indigo-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Open Chat</p>
                <p className="text-xs text-gray-600">Contact your doctor directly</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="p-6 bg-teal-100 border border-teal-300 rounded-xl shadow-inner">
          <h3 className="text-xl font-semibold text-teal-800 mb-2">Security Notice</h3>
          <p className="text-gray-700">
            Your data is secured using industry-standard encryption. Share links expire after 7 days.
          </p>
        </section>
      </div>
    </AuthGuard>
  );
}