// app/auth/verify/page.js
'use client';
import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Mail, Loader2, ArrowRight } from 'lucide-react'; // Assuming you have lucide-react icons installed

// 💡 Efficiency Note: Using useCallback for handler functions

export default function Verify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Handlers ---
  
  const handleVerify = useCallback(async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
        setError("Code must be 6 digits.");
        return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/verify', { email, code });
      
      if (response.status === 200) {
        setMessage('✅ Account verified! Redirecting...');
        setTimeout(() => router.push('/auth/signin'), 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Invalid code. Please try again.';
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [email, code, router]);

  const handleResend = useCallback(async () => {
    setLoading(true);
    setError('');
    setMessage('Sending new code...');

    try {
      const response = await api.post('/resend-code', { email });
      setMessage(response.data.message || '📧 New code sent!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to resend code.';
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [email]);

  // --- Initial Check ---
  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white shadow-xl rounded-lg text-center max-w-sm">
          <p className="text-red-500 font-semibold mb-4">Error: Missing email parameter.</p>
          <button 
            onClick={() => router.push('/auth/signup/select-role')}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Sign Up <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    );
  }

  // --- Main Component Render (Attractive UI/UX) ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-10 bg-white shadow-2xl rounded-xl w-full max-w-md border-t-4 border-blue-600 animate-fadeIn">
        
        <div className="text-center mb-6">
          <Mail className="w-10 h-10 mx-auto text-blue-600" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            Verify Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter the 6-digit code sent to: <br />
            <span className="font-medium text-indigo-600 truncate">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <label htmlFor="code" className="sr-only">Verification Code</label>
          <input
            id="code"
            name="code"
            type="text"
            maxLength="6"
            required
            placeholder="— — — — — —"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 text-center text-xl tracking-widest border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 transition"
          />

          {/* Verification Button */}
          <button 
            type="submit" 
            disabled={loading || code.length < 6} 
            className={`w-full flex items-center justify-center py-3 text-lg font-semibold rounded-lg transition duration-150 ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...
              </>
            ) : (
              'Verify Account'
            )}
          </button>
        </form>

        {/* Resend Code Button (Secondary Action) */}
        <button 
            onClick={handleResend} 
            disabled={loading} 
            className="w-full mt-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Resend Code
        </button>

        {/* Status Messages */}
        <div className="mt-4 h-6 text-center">
            {message && <p className="text-green-600 font-medium">{message}</p>}
            {error && <p className="text-red-600 font-medium">{error}</p>}
        </div>

      </div>
    </div>
  );
}