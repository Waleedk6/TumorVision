// app/auth/signup/select-role/page.js
'use client';
import Link from 'next/link';
import { HeartPulse, User, Stethoscope } from 'lucide-react'; // Added icons

// Component must be a default export
export default function SelectRole() {
  
  // Reusable Role Card Component
  const RoleCard = ({ href, Icon, title, description }) => (
    <Link href={href} legacyBehavior>
      {/* Updated card styles: Changed border, icon, and hover border colors to blue shades */}
      <a className="block w-full md:w-72 p-8 bg-white border border-gray-200 rounded-xl shadow-lg transform transition duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-600 cursor-pointer text-left">
        {/* Updated icon color to blue */}
        <Icon className="w-10 h-10 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </a>
    </Link>
  );

  return (
    // Updated background gradient to use blue/teal shades instead of green
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-teal-100 p-4">
      <div className="w-full max-w-4xl text-center">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          {/* Updated icon color to blue */}
          <HeartPulse className="w-12 h-12 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-extrabold text-gray-900">
            Join Our Health Network
          </h1>
          <p className="mt-3 text-lg text-gray-500 max-w-lg mx-auto">
            Please select the account type that best describes you to get started.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <RoleCard
            href="/auth/signup/patient"
            Icon={User}
            title="Patient"
            description="Sign up to view your medical records, share data securely, and access AI-powered insights."
          />
          <RoleCard
            href="/auth/signup/doctor"
            Icon={Stethoscope}
            title="Doctor / Clinician"
            description="Sign up to manage patient records, analyze medical images, and collaborate with peers."
          />
        </div>

        {/* Footer Link */}
        <p className="mt-10 text-center text-sm text-gray-600">
          Already have an account?{' '}
          {/* Updated link color to blue */}
          <Link href="/auth/signin" className="font-semibold text-blue-600 hover:text-blue-700 transition">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}