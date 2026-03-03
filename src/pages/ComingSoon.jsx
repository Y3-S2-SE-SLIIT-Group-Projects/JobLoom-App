import { Link } from 'react-router-dom';
import { FaHome, FaBell } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import DottedBackground from '../components/DottedBackground';

const ComingSoon = ({ label = 'This page' }) => (
  <DottedBackground>
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#E8F0FB] flex items-center justify-center">
              <HiSparkles className="text-5xl text-[#6794D1]" />
            </div>
            <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center">
              <FaBell className="text-xs" />
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-[#2B373F] mb-3 tracking-tight">{label}</h1>
        <p className="text-[#516876] text-base mb-2">We're working hard to bring this to you.</p>
        <p className="text-[#516876] text-sm mb-10">
          This feature is under construction and will be available soon.
        </p>

        {/* Divider */}
        <div className="w-16 h-1 bg-[#6794D1] rounded-full mx-auto mb-10" />

        {/* Action */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6794D1] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <FaHome className="text-xs" />
          Back to Home
        </Link>
      </div>
    </div>
  </DottedBackground>
);

export default ComingSoon;
