import { Link, useNavigate } from 'react-router-dom';
import { HiBriefcase } from 'react-icons/hi';
import { FaArrowLeft, FaHome } from 'react-icons/fa';
import DottedBackground from '../components/DottedBackground';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <DottedBackground>
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#E8F0FB] flex items-center justify-center">
                <HiBriefcase className="text-5xl text-[#6794D1]" />
              </div>
              <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#2B373F] text-white text-xs font-bold flex items-center justify-center">
                404
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-extrabold text-[#2B373F] mb-3 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-[#516876] text-base mb-2">Looks like this page took a day off.</p>
          <p className="text-[#516876] text-sm mb-10">
            The URL you visited doesn't exist or has been moved.
          </p>

          {/* Divider */}
          <div className="w-16 h-1 bg-[#6794D1] rounded-full mx-auto mb-10" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#6794D1] text-[#6794D1] font-medium text-sm hover:bg-[#E8F0FB] transition-colors"
            >
              <FaArrowLeft className="text-xs" />
              Go Back
            </button>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6794D1] text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <FaHome className="text-xs" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </DottedBackground>
  );
};

export default NotFound;
