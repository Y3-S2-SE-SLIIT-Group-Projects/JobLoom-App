import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase, FaDollarSign } from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageUrls';

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!job || !job._id) return;
    navigate(`/jobs/${job._id}`);
  };

  const getEmployerAndCompany = () => {
    const result = { companyName: 'Unknown employer', logo: null };
    if (!job) return result;

    const maybe = obj => (obj && typeof obj === 'object' ? obj : null);

    const employerObj =
      maybe(job.employer) || maybe(job.employerId) || maybe(job.employerInfo) || null;
    const companyObj = maybe(job.company) || (employerObj && maybe(employerObj.company)) || null;

    if (employerObj) {
      result.companyName = employerObj.companyName || employerObj.company || result.companyName;

      // common logo fields
      result.logo =
        employerObj.profileImage ||
        employerObj.logo ||
        employerObj.companyLogo ||
        employerObj.avatar ||
        result.logo;
    }

    if (companyObj) {
      result.companyName =
        companyObj.name || companyObj.companyName || companyObj.title || result.companyName;
      result.logo =
        result.logo || companyObj.logo || companyObj.companyLogo || companyObj.image || result.logo;
    }

    // fallback when job.company is a string
    if (typeof job.company === 'string') result.companyName = job.company;

    // also allow top-level companyName on job
    if (job.companyName && typeof job.companyName === 'string')
      result.companyName = job.companyName;

    return result;
  };

  const formatLocation = () => {
    if (!job) return 'Anywhere';
    const loc = job.location || job.address || job.place || job.district;
    if (!loc) return 'Anywhere';
    if (typeof loc === 'string') return loc;
    if (typeof loc === 'object') {
      return loc.fullAddress || loc.district || loc.village || loc.province || 'Anywhere';
    }
    return 'Anywhere';
  };

  const formatSalary = () => {
    if (!job) return 'Not specified';
    const s = job.salary || job.salaryRange || job.pay;
    if (!s) return 'Not specified';
    if (typeof s === 'number' || typeof s === 'string') return `${job.currency || 'LKR'} ${s}`;
    if (typeof s === 'object') {
      if (s.min && s.max) return `${job.currency || 'LKR'} ${s.min} - ${s.max}`;
      if (s.amount) return `${job.currency || 'LKR'} ${s.amount}`;
    }
    return 'Not specified';
  };

  const { companyName, logo } = getEmployerAndCompany();
  const companyInitial = companyName ? companyName.slice(0, 1).toUpperCase() : 'J';
  const created = job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : '';

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-md flex items-center justify-center text-xl font-bold text-gray-600 overflow-hidden border border-gray-100">
          {logo ? (
            <img
              src={getImageUrl(logo)}
              alt={companyName}
              className="w-full h-full object-cover"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span>{companyInitial}</span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#1F2A37]">{job?.title}</h3>
          <div className="text-sm text-gray-500 mt-1">{companyName}</div>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt />
              <span>{formatLocation()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaDollarSign />
              <span>{formatSalary()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBriefcase />
              <span>{job?.type || 'Full-Time'}</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-400">{created}</div>
      </div>
    </div>
  );
};

export default JobCard;
