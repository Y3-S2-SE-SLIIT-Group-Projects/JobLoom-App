import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaBriefcase, FaDollarSign } from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageUrls';
import { C, T } from './jobloomTokens';

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
      className={`${C.bgSurface} rounded-xl shadow-sm border ${C.border} p-4 sm:p-5 mb-4 cursor-pointer hover:shadow-md transition-shadow`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 ${C.bgNeutral100} rounded-md flex items-center justify-center ${T.xl} ${T.bold} ${C.muted} overflow-hidden border ${C.border} mx-auto sm:mx-0`}
        >
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
        <div className="flex-1 min-w-0">
          <h3 className={`${T.lg} ${T.heading} ${T.bold} ${C.text} ${T.leadingTight} break-words`}>
            {job?.title}
          </h3>
          <div className={`${T.sm} ${C.subtle} mt-1 ${T.body} break-words`}>{companyName}</div>
          <div
            className={`flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 ${T.sm} ${C.subtle} mt-3 ${T.body}`}
          >
            <div className="flex items-start gap-2 min-w-0">
              <FaMapMarkerAlt />
              <span className="break-words">{formatLocation()}</span>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <FaDollarSign />
              <span className="break-words">{formatSalary()}</span>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <FaBriefcase />
              <span className="break-words">{job?.type || 'Full-Time'}</span>
            </div>
          </div>
        </div>
        <div
          className={`${T.sm} ${C.subtle} shrink-0 ${T.body} self-start sm:self-auto whitespace-nowrap`}
        >
          {created}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
