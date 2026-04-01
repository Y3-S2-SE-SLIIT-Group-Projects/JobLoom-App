import React, { useEffect, useRef, useState } from 'react';

import DottedBackground from '../../components/DottedBackground';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../hooks/useJobs';
import { useUser } from '../../hooks/useUser';
import JobCard from './JobCard';
import { C, T } from './jobloomTokens';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaSlidersH,
  FaTimes,
  FaArrowRight,
  FaBriefcase,
  FaChartLine,
  FaUserCheck,
  FaBullhorn,
  FaFileAlt,
  FaBell as FaBellIcon,
  FaStar,
  FaHandshake,
  FaTractor,
  FaHardHat,
  FaUtensils,
  FaHotel,
  FaShoppingCart,
  FaTruck,
  FaLaptopCode,
  FaHeartbeat,
  FaGraduationCap,
  FaShieldAlt,
  FaChevronRight,
  FaChevronLeft,
} from 'react-icons/fa';
import heroImage from '../../assets/images/hero-image.svg';
import employerIllustration from '../../assets/images/employer-illustration.svg';
import candidateIllustration from '../../assets/images/candidate-illustration.svg';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

const normalizeRegionName = value =>
  (value || '')
    .replace(/\b(district|province)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

// PlacesInput defined OUTSIDE Dashboard so React doesn't remount it
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
        <FaMapMarkerAlt className={`${C.primary} shrink-0`} />
        <input
          value={v}
          onChange={handleInput}
          placeholder={t('dashboard.location_placeholder')}
          className={`w-full outline-none ${C.muted} bg-transparent ${T.sm} ${T.body} ${C.placeholderSubtle}`}
        />
      </div>
      {status === 'OK' && data && data.length > 0 && (
        <ul
          className={`absolute z-30 w-full mt-1 ${C.bgSurface} border ${C.border} rounded-lg shadow-lg max-h-60 overflow-auto left-0 top-full`}
        >
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description)}
              className={`px-4 py-2 cursor-pointer ${T.sm} ${C.muted} ${C.hoverSkyLight40} transition-colors`}
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

const CATEGORY_CARDS = [
  {
    icon: FaLaptopCode,
    label: 'IT',
    value: 'IT',
    color: 'text-blue-green',
    bg: 'bg-blue-green/10',
  },
  {
    icon: FaHeartbeat,
    label: 'Healthcare',
    value: 'healthcare',
    color: 'text-error',
    bg: 'bg-error/10',
  },
  {
    icon: FaGraduationCap,
    label: 'Education',
    value: 'education',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: FaHardHat,
    label: 'Construction',
    value: 'construction',
    color: 'text-orange',
    bg: 'bg-orange/10',
  },
  {
    icon: FaUtensils,
    label: 'Food Service',
    value: 'food_service',
    color: 'text-amber',
    bg: 'bg-amber/10',
  },
  {
    icon: FaHotel,
    label: 'Hospitality',
    value: 'hospitality',
    color: 'text-deep-blue',
    bg: 'bg-deep-blue/10',
  },
  {
    icon: FaShoppingCart,
    label: 'Retail',
    value: 'retail',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    icon: FaTruck,
    label: 'Transport',
    value: 'transportation',
    color: 'text-info',
    bg: 'bg-info/10',
  },
  {
    icon: FaTractor,
    label: 'Agriculture',
    value: 'agriculture',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    icon: FaShieldAlt,
    label: 'Security',
    value: 'security',
    color: 'text-deep-blue',
    bg: 'bg-deep-blue/10',
  },
  { icon: FaBriefcase, label: 'Sales', value: 'sales', color: 'text-primary', bg: 'bg-primary/10' },
  {
    icon: FaHandshake,
    label: 'Service',
    value: 'customer_service',
    color: 'text-amber',
    bg: 'bg-amber/10',
  },
];

const CategoriesCarousel = ({ setCategory, searchRef }) => {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = dir => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section id="explore" className="max-w-7xl mx-auto px-6 pb-20 scroll-mt-[72px]">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span
            className={`inline-block mb-3 px-4 py-1.5 ${C.bgSkyLight50} ${C.primary} ${T.sm} ${T.bold} rounded-full tracking-widest uppercase ${T.body}`}
          >
            {t('dashboard.explore_badge')}
          </span>
          <h2 className={`${T['2xl']} ${T.heading} ${T.bold} ${C.text} mb-2`}>
            {t('dashboard.popular_categories_title')}
          </h2>
          <p className={`${C.subtle} max-w-xl ${T.base} ${T.body} ${T.leadingLoose}`}>
            {t('dashboard.popular_categories_desc')}
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-2 shrink-0 pb-1">
          <button
            onClick={() => searchRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className={`${C.primary} ${T.sm} ${T.medium} ${T.body} underline underline-offset-4 hover:opacity-80 transition-opacity`}
          >
            {t('dashboard.view_all_categories')}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border ${C.border} flex items-center justify-center transition-colors ${
                canScrollLeft
                  ? 'hover:bg-primary hover:text-white hover:border-primary text-muted'
                  : 'text-neutral-300 cursor-not-allowed'
              }`}
              aria-label="Scroll left"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border ${C.border} flex items-center justify-center transition-colors ${
                canScrollRight
                  ? 'hover:bg-primary hover:text-white hover:border-primary text-muted'
                  : 'text-neutral-300 cursor-not-allowed'
              }`}
              aria-label="Scroll right"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORY_CARDS.map(item => (
          <button
            key={item.value}
            onClick={() => {
              setCategory(item.value);
              searchRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`group ${C.bgSurface} border ${C.border} rounded-xl w-28 h-28 shrink-0 snap-start flex flex-col items-center justify-center gap-2.5 hover:shadow-card-hover hover:border-primary/30 transition-all cursor-pointer`}
          >
            <span
              className={`flex items-center justify-center w-11 h-11 rounded-xl ${item.bg} ${item.color} transition-transform group-hover:scale-110`}
            >
              <item.icon className="w-5 h-5" />
            </span>
            <span className={`${T.xs} ${T.medium} ${C.text} ${T.body} text-center leading-tight`}>
              {t(`categories.${item.value}_short`, item.label)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

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
  const { fetchJobs, fetchRecommendedJobs, jobs, loading, pagination } = useJobs();
  const { currentUser } = useUser();
  const { t } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const isJobSeeker = currentUser?.role === 'job_seeker';
  const shouldShowRecommendations = isLoggedIn && isJobSeeker;

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
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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
    fetchJobs({ status: 'open' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load recommendations only for logged-in job seekers
  useEffect(() => {
    if (!shouldShowRecommendations) {
      setRecommendedJobs([]);
      setRecommendedLoading(false);
      return;
    }

    let isMounted = true;
    const loadRecommendations = async () => {
      setRecommendedLoading(true);
      try {
        const recommendationData = await fetchRecommendedJobs();
        const recommendations = Array.isArray(recommendationData?.jobs)
          ? recommendationData.jobs
          : Array.isArray(recommendationData)
            ? recommendationData
            : [];

        if (isMounted) {
          setRecommendedJobs(recommendations);
        }
      } catch {
        if (isMounted) {
          setRecommendedJobs([]);
        }
      } finally {
        if (isMounted) {
          setRecommendedLoading(false);
        }
      }
    };

    loadRecommendations();

    return () => {
      isMounted = false;
    };
    // fetchRecommendedJobs is provided by context and may have unstable identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowRecommendations]);

  // Build and fire the search
  const runSearch = async (extra = {}) => {
    setNearbyJobs(null);
    setNearbyError('');
    const page = extra.page || 1;
    const selectedRange = SALARY_RANGES.find(r => r.label === salaryRangeKey) || {};
    const locationParts = locationLabel
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);
    const fallbackDistrict = locationParts.length > 1 ? locationParts[1] : locationParts[0];
    const district = normalizeRegionName(locationObj?.district || fallbackDistrict || undefined);
    const prov = normalizeRegionName(locationObj?.province || province || undefined);

    const filters = {
      status: 'open',
      search: query || undefined,
      category: category || undefined,
      employmentType: employmentType || undefined,
      district,
      province: prov,
      minSalary: selectedRange.min || undefined,
      maxSalary: selectedRange.max || undefined,
      page,
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
          const jobEmploymentType = (job.employmentType || '').toLowerCase();
          const jobProvince = normalizeRegionName(job.location?.province || '');
          const salary = Number(job.salaryAmount || 0);

          const matchesQuery = !q || title.includes(q) || desc.includes(q) || role.includes(q);
          const matchesCategory = !category || job.category === category;
          const matchesEmploymentType =
            !employmentType || jobEmploymentType === employmentType.toLowerCase();
          const matchesProvince = !prov || jobProvince === prov;
          const matchesMin = min === null || salary >= min;
          const matchesMax = max === null || salary <= max;

          return (
            matchesQuery &&
            matchesCategory &&
            matchesEmploymentType &&
            matchesProvince &&
            matchesMin &&
            matchesMax
          );
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
    setCurrentPage(1);
    await fetchJobs({ status: 'open' });
  };

  useEffect(() => {
    if (!pagination) return;
    const pageFromApi =
      pagination.page || pagination.currentPage || pagination.current_page || pagination.current;
    if (pageFromApi) setCurrentPage(pageFromApi);
  }, [pagination]);

  const changePage = async newPage => {
    if (!newPage || newPage === currentPage) return;
    const pageNum = Number(newPage);
    setCurrentPage(pageNum);
    await runSearch({ page: pageNum });
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

          const selectedRange = SALARY_RANGES.find(r => r.label === salaryRangeKey) || {};
          const q = query.trim().toLowerCase();
          const min = selectedRange.min ? Number(selectedRange.min) : null;
          const max = selectedRange.max ? Number(selectedRange.max) : null;
          const normalizedProvince = normalizeRegionName(province || '');

          const filteredNearbyJobs = jobsFromApi.filter(job => {
            const title = (job.title || '').toLowerCase();
            const desc = (job.description || '').toLowerCase();
            const role = (job.jobRole || '').toLowerCase();
            const jobEmploymentType = (job.employmentType || '').toLowerCase();
            const jobProvince = normalizeRegionName(job.location?.province || '');
            const salary = Number(job.salaryAmount || 0);

            const matchesQuery = !q || title.includes(q) || desc.includes(q) || role.includes(q);
            const matchesCategory = !category || job.category === category;
            const matchesEmploymentType =
              !employmentType || jobEmploymentType === employmentType.toLowerCase();
            const matchesProvince = !normalizedProvince || jobProvince === normalizedProvince;
            const matchesMin = min === null || salary >= min;
            const matchesMax = max === null || salary <= max;

            return (
              matchesQuery &&
              matchesCategory &&
              matchesEmploymentType &&
              matchesProvince &&
              matchesMin &&
              matchesMax
            );
          });

          setNearbyJobs(filteredNearbyJobs);
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

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  return (
    <DottedBackground>
      {/*HERO SECTION*/}
      <section
        id="home"
        className="relative min-h-[calc(100vh-72px)] max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-16 md:py-20 overflow-hidden"
      >
        {/* Decorative glow blobs */}
        <div className="hero-glow w-72 h-72 bg-[color:var(--color-sky-light)] -top-20 -left-20" />
        <div
          className="hero-glow w-56 h-56 bg-[color:var(--color-amber)] bottom-10 left-1/3"
          style={{ animationDelay: '2.5s' }}
        />

        {/* Left */}
        <div className="relative z-10 flex flex-col justify-center">
          {/* Top badge */}
          <span
            className={`hero-badge-shimmer inline-flex items-center gap-2 w-fit mb-6 px-4 py-2 ${C.bgSkyLight50} ${C.primary} ${T.sm} ${T.bold} rounded-full tracking-widest uppercase ${T.body} border border-[color:color-mix(in_srgb,var(--color-sky-light)_60%,transparent)]`}
          >
            <span className="w-2 h-2 rounded-full bg-[color:var(--color-blue-green)] animate-pulse" />
            {t('dashboard.hero_badge')}
          </span>

          {/* Hero heading */}
          <h1
            className={`hero-gradient-text text-[clamp(2.5rem,5vw,4.5rem)] ${T.heading} ${T.extrabold} ${T.leadingTight} ${T.trackingTight} mb-5`}
          >
            {t('dashboard.hero_title')}
          </h1>

          {/* Description */}
          <p className={`${C.muted} mb-10 max-w-lg ${T.leadingLoose} ${T.lg} ${T.body}`}>
            {t('dashboard.hero_description')}
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-wrap gap-4 mb-10">
            <button
              onClick={() => searchRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className={`group flex items-center gap-2.5 px-8 py-4 ${C.bgPrimary} ${C.textOnPrimary} rounded-xl ${T.semibold} ${C.hoverDeepBlue} transition-all shadow-lg hover:shadow-xl ${T.lg}`}
            >
              {t('dashboard.explore_jobs')}
              <FaArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('who-we-are');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex items-center gap-2.5 px-8 py-4 border-2 border-[color:var(--color-primary)] ${C.primary} rounded-xl ${T.semibold} ${T.lg} transition-all hover:bg-[color:color-mix(in_srgb,var(--color-primary)_8%,transparent)]`}
            >
              {t('dashboard.learn_more', 'Learn More')}
            </button>
          </div>

          {/* Floating social-proof badges */}
          <div className="flex flex-wrap items-center gap-5">
            <div
              className={`hero-float flex items-center gap-3 px-4 py-2.5 ${C.bgSurface} rounded-xl shadow-card border ${C.border}`}
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)]">
                <FaBriefcase className="w-4 h-4 text-[color:var(--color-primary)]" />
              </span>
              <div>
                <p className={`${T.sm} ${T.bold} ${C.text} ${T.heading} leading-none`}>18+</p>
                <p className={`${T.xs} ${C.subtle} ${T.body} leading-tight mt-0.5`}>
                  {t('dashboard.stat_categories')}
                </p>
              </div>
            </div>

            <div
              className={`hero-float-delay flex items-center gap-3 px-4 py-2.5 ${C.bgSurface} rounded-xl shadow-card border ${C.border}`}
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[color:color-mix(in_srgb,var(--color-amber)_15%,transparent)]">
                <FaMapMarkerAlt className="w-4 h-4 text-[color:var(--color-amber)]" />
              </span>
              <div>
                <p className={`${T.sm} ${T.bold} ${C.text} ${T.heading} leading-none`}>9+</p>
                <p className={`${T.xs} ${C.subtle} ${T.body} leading-tight mt-0.5`}>
                  {t('dashboard.stat_provinces')}
                </p>
              </div>
            </div>

            <div
              className={`hero-float-delay-2 flex items-center gap-3 px-4 py-2.5 ${C.bgSurface} rounded-xl shadow-card border ${C.border}`}
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[color:color-mix(in_srgb,var(--color-success)_12%,transparent)]">
                <FaHandshake className="w-4 h-4 text-[color:var(--color-success)]" />
              </span>
              <div>
                <p className={`${T.sm} ${T.bold} ${C.text} ${T.heading} leading-none`}>100%</p>
                <p className={`${T.xs} ${C.subtle} ${T.body} leading-tight mt-0.5`}>
                  {t('dashboard.stat_free')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right – illustration */}
        <div className="relative z-10 flex justify-center md:justify-end items-center">
          <img src={heroImage} alt="Find jobs" className="w-full max-w-xl drop-shadow-2xl" />
        </div>
      </section>

      {/*  WHO WE ARE FOR */}
      <section id="who-we-are" className="max-w-7xl mx-auto px-6 scroll-mt-[72px] py-20">
        {/* Section header */}
        <div className="text-center mb-14">
          <span
            className={`inline-block mb-4 px-4 py-1.5 ${C.bgSkyLight50} ${C.primary} ${T.sm} ${T.bold} rounded-full tracking-widest uppercase ${T.body}`}
          >
            {t('dashboard.who_built_for_badge')}
          </span>
          <h2 className={`${T['2xl']} md:text-4xl ${T.heading} ${T.bold} ${C.text} mb-3`}>
            {t('dashboard.who_built_for_title')}
          </h2>
        </div>

        {/* Employer Card — illustration left */}
        <div
          className={`${C.bgSurface} border ${C.border} rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow mb-8`}
        >
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="md:w-2/5 flex items-center justify-center bg-gradient-to-br from-primary/5 via-sky-light/20 to-transparent p-8 md:p-10">
              <img
                src={employerIllustration}
                alt="Employer tools"
                className="w-full max-w-xs md:max-w-sm object-contain"
              />
            </div>
            <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
              <span className="inline-block w-fit mb-3 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full tracking-wide uppercase">
                {t('dashboard.employers_badge')}
              </span>
              <h3 className={`${T.xl} ${T.heading} ${T.bold} ${C.text} mb-2`}>
                {t('dashboard.employers_title')}
              </h3>
              <p className={`${C.subtle} ${T.sm} ${T.body} ${T.leadingLoose} mb-5`}>
                {t('dashboard.employers_description')}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: FaBriefcase, text: t('dashboard.employer_feature_post') },
                  { icon: FaUserCheck, text: t('dashboard.employer_feature_screen') },
                  { icon: FaChartLine, text: t('dashboard.employer_feature_analytics') },
                  { icon: FaBullhorn, text: t('dashboard.employer_feature_reach') },
                  { icon: FaHandshake, text: t('dashboard.employer_feature_interview') },
                  { icon: FaStar, text: t('dashboard.employer_feature_reputation') },
                ].map(item => (
                  <li key={item.text} className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-primary" />
                    </span>
                    <span className={`${C.muted} ${T.sm} ${T.body}`}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Candidate Card — illustration right */}
        <div
          className={`${C.bgSurface} border ${C.border} rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow mb-14`}
        >
          <div className="flex flex-col md:flex-row-reverse items-stretch">
            <div className="md:w-2/5 flex items-center justify-center bg-gradient-to-bl from-amber/10 via-orange/5 to-transparent p-8 md:p-10">
              <img
                src={candidateIllustration}
                alt="Candidate tools"
                className="w-full max-w-xs md:max-w-sm object-contain"
              />
            </div>
            <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
              <span className="inline-block w-fit mb-3 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full tracking-wide uppercase">
                {t('dashboard.seekers_badge')}
              </span>
              <h3 className={`${T.xl} ${T.heading} ${T.bold} ${C.text} mb-2`}>
                {t('dashboard.seekers_title')}
              </h3>
              <p className={`${C.subtle} ${T.sm} ${T.body} ${T.leadingLoose} mb-5`}>
                {t('dashboard.seekers_description')}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: FaFileAlt, text: t('dashboard.seeker_feature_apply') },
                  { icon: FaBellIcon, text: t('dashboard.seeker_feature_ai') },
                  { icon: FaStar, text: t('dashboard.seeker_feature_review') },
                  { icon: FaMapMarkerAlt, text: t('dashboard.seeker_feature_gps') },
                  { icon: FaSearch, text: t('dashboard.seeker_feature_search') },
                  { icon: FaChartLine, text: t('dashboard.seeker_feature_track') },
                ].map(item => (
                  <li key={item.text} className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber/10 shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-amber" />
                    </span>
                    <span className={`${C.muted} ${T.sm} ${T.body}`}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Trust / stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '9+', label: t('dashboard.stat_provinces_covered'), icon: FaMapMarkerAlt },
            { value: '18+', label: t('dashboard.stat_job_categories'), icon: FaBriefcase },
            { value: '3', label: t('dashboard.stat_languages_supported'), icon: FaBullhorn },
            { value: '100%', label: t('dashboard.stat_free_for_seekers'), icon: FaHandshake },
          ].map(stat => (
            <div
              key={stat.label}
              className={`${C.bgSurface} border ${C.border} rounded-xl p-5 text-center hover:shadow-card transition-shadow`}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mx-auto mb-3">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
              <p className={`${T.xl} ${T.heading} ${T.bold} ${C.text}`}>{stat.value}</p>
              <p className={`${T.xs} ${C.subtle} ${T.body} mt-0.5`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR CATEGORIES*/}
      <CategoriesCarousel setCategory={setCategory} searchRef={searchRef} />

      {/* SEARCH & RESULTS SECTION */}
      <div ref={searchRef} className="max-w-7xl mx-auto px-6 pb-16">
        {/* Search bar card */}
        <form
          onSubmit={handleSearch}
          className={`${C.bgSurface} rounded-2xl shadow-sm border ${C.border} p-5 mb-4`}
        >
          {/* Main search row */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Keyword */}
            <div
              className={`flex-1 flex items-center gap-3 border ${C.border} rounded-xl px-4 py-3 ${C.bgSurface}`}
            >
              <FaSearch className={`${C.primary} shrink-0`} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('dashboard.job_title_placeholder')}
                className={`w-full outline-none ${C.muted} ${T.sm} ${T.body} ${C.placeholderSubtle}`}
              />
            </div>

            {/* Location */}
            <div
              className={`md:w-72 flex items-center border ${C.border} rounded-xl px-4 py-3 relative ${C.bgSurface}`}
            >
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
                className={`px-6 py-3 ${C.bgPrimary} ${C.textOnPrimary} rounded-xl ${T.medium} ${C.hoverDeepBlue} transition-colors shadow-sm`}
              >
                {t('dashboard.search_button')}
              </button>
              <button
                type="button"
                onClick={handleNearby}
                disabled={nearbyLoading}
                title="Find jobs near your current location"
                className={`flex items-center gap-2 px-4 py-3 ${C.bgSkyLight50} ${C.primary} rounded-xl ${T.medium} ${C.hoverSkyLightSolid} transition-colors disabled:opacity-60`}
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
              className={`flex items-center gap-2 px-3 py-1.5 border ${C.border} rounded-lg ${T.sm} ${C.muted} ${C.hoverSurfaceMuted}`}
            >
              <FaSlidersH className="w-3.5 h-3.5" />
              {t('dashboard.filters_button')}
              {(category || employmentType || province || salaryRangeKey !== 'Any') && (
                <span className={`w-2 h-2 rounded-full ${C.bgPrimary} inline-block`} />
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
                className={`flex items-center gap-1 px-3 py-1.5 ${T.sm} ${C.error} opacity-80 hover:opacity-100`}
              >
                <FaTimes className="w-3 h-3" /> {t('dashboard.clear_filters')}
              </button>
            )}
            {isNearbyResult && (
              <span
                className={`px-3 py-1.5 ${C.bgSkyLight50} ${C.primary} ${T.xs} ${T.bold} rounded-full`}
              >
                {t('dashboard.nearby_jobs_badge')}
              </span>
            )}
          </div>

          {filtersOpen && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Category */}
              <div>
                <label className={`block ${T.xs} ${C.subtle} mb-1 ${T.body}`}>
                  {t('dashboard.category_label')}
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className={`w-full p-2.5 border ${C.border} rounded-lg ${T.sm} ${C.muted} ${C.bgSurface} ${T.body}`}
                >
                  <option value="">{t('dashboard.all_categories')}</option>
                  {JOB_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>
                      {t(`categories.${c.value}`, c.label)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employment type (client-side) */}
              <div>
                <label className={`block ${T.xs} ${C.subtle} mb-1 ${T.body}`}>
                  {t('dashboard.employment_type_label')}
                </label>
                <select
                  value={employmentType}
                  onChange={e => setEmploymentType(e.target.value)}
                  className={`w-full p-2.5 border ${C.border} rounded-lg ${T.sm} ${C.muted} ${C.bgSurface} ${T.body}`}
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
                <label className={`block ${T.xs} ${C.subtle} mb-1 ${T.body}`}>
                  {t('dashboard.province_label')}
                </label>
                <select
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className={`w-full p-2.5 border ${C.border} rounded-lg ${T.sm} ${C.muted} ${C.bgSurface} ${T.body}`}
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
                <label className={`block ${T.xs} ${C.subtle} mb-1 ${T.body}`}>
                  {t('dashboard.salary_label')}
                </label>
                <select
                  value={salaryRangeKey}
                  onChange={e => setSalaryRangeKey(e.target.value)}
                  className={`w-full p-2.5 border ${C.border} rounded-lg ${T.sm} ${C.muted} ${C.bgSurface} ${T.body}`}
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
          <div
            className={`mb-4 p-3 ${C.bgError10} border ${C.borderError25} ${C.error} rounded-lg ${T.sm} ${T.body}`}
          >
            {nearbyError}
          </div>
        )}

        {/* Results header */}
        {shouldShowRecommendations && (
          <div className="mb-6">
            <h2 className={`${T.xl} ${T.heading} ${T.bold} ${C.text} mb-3 ${T.leadingTight}`}>
              {t('dashboard.recommended_title')}
            </h2>
            {recommendedLoading && (
              <div
                className={`${C.bgSurface} rounded-xl border ${C.border} p-4 ${T.sm} ${C.muted} ${T.body}`}
              >
                {t('dashboard.recommended_loading')}
              </div>
            )}
            {!recommendedLoading && recommendedJobs.length === 0 && (
              <div
                className={`${C.bgSurface} rounded-xl border ${C.border} p-4 ${T.sm} ${C.muted} ${T.body}`}
              >
                {t('dashboard.recommended_empty')}
              </div>
            )}
            {!recommendedLoading &&
              recommendedJobs.length > 0 &&
              recommendedJobs.map(job => <JobCard key={`recommended-${job._id}`} job={job} />)}
          </div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <span className={`${T.xl} ${T.heading} ${T.bold} ${C.text} ${T.leadingTight}`}>
            {(() => {
              const total =
                pagination?.total ||
                pagination?.totalCount ||
                pagination?.total_count ||
                pagination?.totalItems ||
                pagination?.total_items ||
                displayJobs.length;
              return isNearbyResult
                ? t('dashboard.results_count_nearby', { count: displayJobs.length })
                : t('dashboard.results_count_total', { count: total });
            })()}
          </span>
        </div>

        {/* Job list */}
        {(loading || nearbyLoading) && (
          <div className="text-center py-16">
            <div
              className={`w-10 h-10 border-4 ${C.borderPrimary} border-t-transparent rounded-full animate-spin mx-auto mb-3`}
            />
            <p className={`${C.muted} ${T.sm} ${T.body}`}>{t('dashboard.loading_jobs')}</p>
          </div>
        )}
        {!loading && !nearbyLoading && displayJobs.length === 0 && (
          <div className={`text-center py-16 ${C.subtle} ${T.body}`}>
            {t('dashboard.no_jobs_found')}
          </div>
        )}
        {!loading && !nearbyLoading && displayJobs.map(job => <JobCard key={job._id} job={job} />)}

        {/* Pagination controls (only when not using nearby results) */}
        {!isNearbyResult &&
          pagination &&
          (() => {
            const total =
              pagination?.total ||
              pagination?.totalCount ||
              pagination?.total_count ||
              pagination?.totalItems ||
              pagination?.total_items ||
              0;
            const limit = pagination?.limit || pagination?.perPage || pagination?.pageSize || 20;
            const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
            if (total <= limit) return null;
            return (
              <div className="max-w-7xl mx-auto px-6 mt-6 flex items-center justify-between">
                <div className={`${T.sm} ${C.muted} ${T.body}`}>
                  {t('dashboard.pagination_showing', { shown: displayJobs.length, total })}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`px-3 py-1.5 rounded-lg border ${C.border} ${C.bgSurface} ${T.sm} ${C.muted} ${T.body} ${C.hoverSurfaceMuted} disabled:opacity-50`}
                  >
                    {t('dashboard.pagination_prev')}
                  </button>
                  <div className={`${T.sm} ${C.muted} ${T.body}`}>
                    {t('dashboard.pagination_page', { current: currentPage, total: totalPages })}
                  </div>
                  <button
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={`px-3 py-1.5 rounded-lg border ${C.border} ${C.bgSurface} ${T.sm} ${C.muted} ${T.body} ${C.hoverSurfaceMuted} disabled:opacity-50`}
                  >
                    {t('dashboard.pagination_next')}
                  </button>
                </div>
              </div>
            );
          })()}
      </div>
    </DottedBackground>
  );
};

export default Dashboard;
