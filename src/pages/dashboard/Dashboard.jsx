import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import DottedBackground from '../../components/DottedBackground';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../contexts/JobContext';
import JobCard from './JobCard';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaSlidersH,
  FaTimes,
  FaArrowRight,
} from 'react-icons/fa';
import heroImage from '../../assets/images/create-job.png';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

const normalizeRegionName = value =>
  (value || '')
    .replace(/\b(district|province)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

// ------------------------------------------------------------------
// PlacesInput defined OUTSIDE Dashboard so React doesn't remount it
// ------------------------------------------------------------------
const PlacesInput = ({ value, onChange, t }) => {
  const {
    value: v,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
    init,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: 'lk' } },
    debounce: 300,
    initOnMount: false,
  });

  useEffect(() => {
    const tryInit = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        init();
        return true;
      }
      return false;
    };

    if (tryInit()) return undefined;

    const intervalId = window.setInterval(() => {
      if (tryInit()) window.clearInterval(intervalId);
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [init]);

  useEffect(() => {
    if (v !== value) setValue(value || '', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleInput = e => {
    const newValue = e.target.value;
    setValue(newValue);
    // Also notify parent so manual typing still updates filters
    const typedDistrict = newValue.split(',')[0].trim() || null;
    onChange({ address: newValue, coordinates: null, district: typedDistrict, province: null });
  };

  // Extract district from a Google Places address component string
  const extractDistrict = addressComponents => {
    if (!addressComponents) return null;
    for (const comp of addressComponents) {
      if (comp.types.includes('administrative_area_level_2')) {
        return normalizeRegionName(comp.long_name);
      }
    }
    for (const comp of addressComponents) {
      if (comp.types.includes('administrative_area_level_1')) {
        return normalizeRegionName(comp.long_name);
      }
    }
    return null;
  };

  const handleSelect = async address => {
    try {
      setValue(address, false);
      clearSuggestions();
      let coords = null;
      let district = null;
      let province = null;
      if (window.google && window.google.maps) {
        const results = await getGeocode({ address });
        if (results && results[0]) {
          const { lat, lng } = await getLatLng(results[0]);
          coords = [lng, lat];
          const comps = results[0].address_components || [];
          district = extractDistrict(comps);
          const prov = comps.find(c => c.types.includes('administrative_area_level_1'));
          province = prov ? normalizeRegionName(prov.long_name) : null;
        }
      }
      onChange({ address, coordinates: coords, district, province });
    } catch (err) {
      console.error('Places select error', err);
      onChange({ address, coordinates: null, district: null, province: null });
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <FaMapMarkerAlt className="text-[#6794D1] shrink-0" />
        <input
          value={v}
          onChange={handleInput}
          placeholder={t('dashboard.location_placeholder')}
          className="w-full outline-none text-gray-700 bg-transparent text-sm placeholder:text-sm"
        />
      </div>
      {status === 'OK' && data && data.length > 0 && (
        <ul className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto left-0 top-full">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description)}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors"
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Category options matching backend enum
const JOB_CATEGORIES = [
  { value: 'agriculture', label: 'Agriculture & Farming' },
  { value: 'construction', label: 'Construction' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'food_service', label: 'Food Service' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'retail', label: 'Retail' },
  { value: 'sales', label: 'Sales' },
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'driving', label: 'Driving' },
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'security', label: 'Security Services' },
  { value: 'tailoring', label: 'Tailoring' },
  { value: 'beauty_services', label: 'Beauty Services' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'IT', label: 'Information Technology' },
  { value: 'general_labor', label: 'General Labor' },
  { value: 'other', label: 'Other' },
];

const PROVINCES = [
  'Western',
  'Central',
  'Southern',
  'Northern',
  'Eastern',
  'North Western',
  'North Central',
  'Uva',
  'Sabaragamuwa',
];

const SALARY_RANGES = [
  { label: 'Any', min: '', max: '' },
  { label: '0 – 30,000', min: '0', max: '30000' },
  { label: '30,001 – 60,000', min: '30001', max: '60000' },
  { label: '60,001 – 100,000', min: '60001', max: '100000' },
  { label: '100,001 – 200,000', min: '100001', max: '200000' },
  { label: '200,000+', min: '200000', max: '' },
];

// ---------------------------------------------------------------
// Main Dashboard component
// ---------------------------------------------------------------
const Dashboard = () => {
  const { fetchJobs, jobs, loading } = useJobs();
  const { t } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Ref to scroll to the search/results section
  const searchRef = useRef(null);

  // Search state
  const [query, setQuery] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [locationObj, setLocationObj] = useState(null);

  // Filter state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [province, setProvince] = useState('');
  const [salaryRangeKey, setSalaryRangeKey] = useState('Any');

  // Nearby jobs state (overrides context jobs when set)
  const [nearbyJobs, setNearbyJobs] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState('');

  // Google Maps loader
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || (window.google && window.google.maps)) return;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Initial load
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build and fire the search
  const runSearch = async (extra = {}) => {
    setNearbyJobs(null);
    setNearbyError('');
    const selectedRange = SALARY_RANGES.find(r => r.label === salaryRangeKey) || {};
    const locationParts = locationLabel
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);
    const fallbackDistrict = locationParts.length > 1 ? locationParts[1] : locationParts[0];
    const district = normalizeRegionName(locationObj?.district || fallbackDistrict || undefined);
    const prov = normalizeRegionName(locationObj?.province || province || undefined);

    const filters = {
      search: query || undefined,
      category: category || undefined,
      district,
      province: prov,
      minSalary: selectedRange.min || undefined,
      maxSalary: selectedRange.max || undefined,
      ...extra,
    };
    // Remove undefined keys so they don't appear in query string
    Object.keys(filters).forEach(k => filters[k] === undefined && delete filters[k]);

    const exactJobs = await fetchJobs(filters);

    const selectedCoordinates = locationObj?.coordinates;
    if (Array.isArray(selectedCoordinates) && selectedCoordinates.length === 2) {
      try {
        const [lng, lat] = selectedCoordinates;
        const nearRes = await fetch(`${API_URL}/jobs/nearby?lng=${lng}&lat=${lat}&radius=35`);
        const nearPayload = await nearRes.json();
        if (!nearRes.ok) throw new Error(nearPayload.message || 'Failed to fetch nearby jobs');

        const nearJobs = Array.isArray(nearPayload.data?.jobs)
          ? nearPayload.data.jobs
          : Array.isArray(nearPayload.data)
            ? nearPayload.data
            : [];

        const q = query.trim().toLowerCase();
        const min = selectedRange.min ? Number(selectedRange.min) : null;
        const max = selectedRange.max ? Number(selectedRange.max) : null;

        const filteredNearJobs = nearJobs.filter(job => {
          const title = (job.title || '').toLowerCase();
          const desc = (job.description || '').toLowerCase();
          const role = (job.jobRole || '').toLowerCase();
          const salary = Number(job.salaryAmount || 0);

          const matchesQuery = !q || title.includes(q) || desc.includes(q) || role.includes(q);
          const matchesCategory = !category || job.category === category;
          const matchesMin = min === null || salary >= min;
          const matchesMax = max === null || salary <= max;

          return matchesQuery && matchesCategory && matchesMin && matchesMax;
        });

        const mergedMap = new Map();
        [...(Array.isArray(exactJobs) ? exactJobs : []), ...filteredNearJobs].forEach(job => {
          if (job?._id) mergedMap.set(job._id, job);
        });
        setNearbyJobs(Array.from(mergedMap.values()));
      } catch (err) {
        setNearbyError(err.message || 'Could not load nearby jobs for the selected location.');
      }
    }

    searchRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = async e => {
    e.preventDefault();
    await runSearch();
  };

  const clearFilters = async () => {
    setQuery('');
    setLocationLabel('');
    setLocationObj(null);
    setCategory('');
    setEmploymentType('');
    setProvince('');
    setSalaryRangeKey('Any');
    setNearbyJobs(null);
    setNearbyError('');
    await fetchJobs({});
  };

  // Client-side employment type filter (backend doesn't support this param)
  const displayJobs = (() => {
    const baseData = nearbyJobs !== null ? nearbyJobs : jobs;
    const base = Array.isArray(baseData) ? baseData : [];
    if (!employmentType) return base;
    return base.filter(
      j => (j.employmentType || '').toLowerCase() === employmentType.toLowerCase()
    );
  })();

  // Find nearby jobs using browser geolocation
  const handleNearby = () => {
    if (!navigator.geolocation) {
      setNearbyError('Geolocation is not supported by your browser.');
      return;
    }
    setNearbyLoading(true);
    setNearbyError('');
    setNearbyJobs(null);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords;
          // Backend expects query params as lat & lng
          const res = await fetch(
            `${API_URL}/jobs/nearby?lng=${longitude}&lat=${latitude}&radius=50`
          );
          const payload = await res.json();
          if (!res.ok) throw new Error(payload.message || 'Failed to fetch nearby jobs');

          const jobsFromApi = Array.isArray(payload.data?.jobs)
            ? payload.data.jobs
            : Array.isArray(payload.data)
              ? payload.data
              : [];

          setNearbyJobs(jobsFromApi);
          searchRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
          setNearbyError(err.message || 'Could not load nearby jobs.');
        } finally {
          setNearbyLoading(false);
        }
      },
      () => {
        setNearbyError('Location access denied. Please allow location access and try again.');
        setNearbyLoading(false);
      }
    );
  };

  const isNearbyResult = nearbyJobs !== null;

  return (
    <DottedBackground>
      <Navbar />

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left */}
        <div>
          <span className="inline-block mb-4 px-3 py-1 bg-[#E8F0FB] text-[#6794D1] text-xs font-semibold rounded-full tracking-widest uppercase">
            Sri Lanka's Job Platform
          </span>
          <h1 className="text-5xl font-extrabold text-[#1F2A37] leading-tight mb-3">
            {t('dashboard.hero_title')}
          </h1>
          <p className="text-2xl font-semibold text-[#6794D1] mb-5">
            {t('dashboard.hero_subtitle')}
          </p>
          <p className="text-gray-500 mb-8 max-w-md leading-relaxed">
            {t('dashboard.hero_description')}
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => searchRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-6 py-3 bg-[#6794D1] text-white rounded-lg font-medium hover:bg-[#5a83c0] transition-colors"
            >
              {t('dashboard.explore_jobs')} <FaArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-400">
            Trusted by thousands of job seekers and employers across Sri Lanka.
          </p>
        </div>

        {/* Right – illustration */}
        <div className="flex justify-center md:justify-end">
          <img src={heroImage} alt="Find jobs" className="w-full max-w-xl" />
        </div>
      </section>

      {/* ── SEARCH & RESULTS SECTION ─────────────────────────────── */}
      <div ref={searchRef} className="max-w-7xl mx-auto px-6 pb-16">
        {/* Search bar card */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4"
        >
          {/* Main search row */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Keyword */}
            <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
              <FaSearch className="text-[#6794D1] shrink-0" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('dashboard.job_title_placeholder')}
                className="w-full outline-none text-gray-700 text-sm"
              />
            </div>

            {/* Location */}
            <div className="md:w-72 flex items-center border border-gray-200 rounded-xl px-4 py-3 relative">
              <PlacesInput
                value={locationLabel}
                t={t}
                onChange={val => {
                  setLocationLabel(val.address || '');
                  setLocationObj(val);
                }}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 shrink-0">
              <button
                type="submit"
                className="px-6 py-3 bg-[#6794D1] text-white rounded-xl font-medium hover:bg-[#5a83c0] transition-colors"
              >
                {t('dashboard.search_button')}
              </button>
              <button
                type="button"
                onClick={handleNearby}
                disabled={nearbyLoading}
                title="Find jobs near your current location"
                className="flex items-center gap-2 px-4 py-3 bg-[#E8F0FB] text-[#6794D1] rounded-xl font-medium hover:bg-[#d4e5f7] transition-colors disabled:opacity-60"
              >
                <FaLocationArrow className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {nearbyLoading ? t('dashboard.nearby_locating') : t('dashboard.nearby_button')}
                </span>
              </button>
            </div>
          </div>

          {/* Filter row */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen(f => !f)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              <FaSlidersH className="w-3.5 h-3.5" />
              {t('dashboard.filters_button')}
              {(category || employmentType || province || salaryRangeKey !== 'Any') && (
                <span className="w-2 h-2 rounded-full bg-[#6794D1] inline-block"></span>
              )}
            </button>
            {(query ||
              locationLabel ||
              category ||
              employmentType ||
              province ||
              salaryRangeKey !== 'Any' ||
              isNearbyResult) && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-400 hover:text-red-600"
              >
                <FaTimes className="w-3 h-3" /> {t('dashboard.clear_filters')}
              </button>
            )}
            {isNearbyResult && (
              <span className="px-3 py-1.5 bg-[#E8F0FB] text-[#6794D1] text-xs font-semibold rounded-full">
                {t('dashboard.nearby_jobs_badge')}
              </span>
            )}
          </div>

          {filtersOpen && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Category */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t('dashboard.category_label')}
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">{t('dashboard.all_categories')}</option>
                  {JOB_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employment type (client-side) */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t('dashboard.employment_type_label')}
                </label>
                <select
                  value={employmentType}
                  onChange={e => setEmploymentType(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">{t('dashboard.all_types')}</option>
                  <option value="full-time">{t('employment_types.full_time', 'Full-Time')}</option>
                  <option value="part-time">{t('employment_types.part_time', 'Part-Time')}</option>
                  <option value="contract">{t('employment_types.contract', 'Contract')}</option>
                  <option value="temporary">{t('employment_types.temporary', 'Temporary')}</option>
                  <option value="internship">
                    {t('employment_types.internship', 'Internship')}
                  </option>
                  <option value="seasonal">{t('employment_types.seasonal', 'Seasonal')}</option>
                  <option value="freelance">{t('employment_types.freelance', 'Freelance')}</option>
                </select>
              </div>

              {/* Province */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t('dashboard.province_label')}
                </label>
                <select
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">{t('dashboard.all_provinces')}</option>
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salary range */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t('dashboard.salary_label')}
                </label>
                <select
                  value={salaryRangeKey}
                  onChange={e => setSalaryRangeKey(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                >
                  {SALARY_RANGES.map(r => (
                    <option key={r.label} value={r.label}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </form>

        {/* Nearby error */}
        {nearbyError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {nearbyError}
          </div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-[#1F2A37]">
            {isNearbyResult
              ? t('dashboard.results_count_nearby', { count: displayJobs.length })
              : t('dashboard.results_count_total', { count: displayJobs.length })}
          </span>
        </div>

        {/* Job list */}
        {(loading || nearbyLoading) && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-[#6794D1] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">{t('dashboard.loading_jobs')}</p>
          </div>
        )}
        {!loading && !nearbyLoading && displayJobs.length === 0 && (
          <div className="text-center py-16 text-gray-400">{t('dashboard.no_jobs_found')}</div>
        )}
        {!loading && !nearbyLoading && displayJobs.map(job => <JobCard key={job._id} job={job} />)}
      </div>
    </DottedBackground>
  );
};

export default Dashboard;
