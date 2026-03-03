import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useJobs } from '../../../contexts/JobContext';

import DottedBackground from '../../../components/DottedBackground';
import {
  FaArrowLeft,
  FaBriefcase,
  FaMapMarkerAlt,
  FaDollarSign,
  FaUsers,
  FaCalendar,
  FaTimes,
  FaPlus,
  FaMap,
  FaSave,
} from 'react-icons/fa';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

// Import shared constants from CreateJob (we'll need to extract these to a shared file later)
const JOB_CATEGORIES = [
  { value: 'agriculture', label: 'Agriculture & Farming' },
  { value: 'farming', label: 'Farming' },
  { value: 'livestock', label: 'Livestock Management' },
  { value: 'fishing', label: 'Fishing & Aquaculture' },
  { value: 'construction', label: 'Construction' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'masonry', label: 'Masonry' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical Work' },
  { value: 'welding', label: 'Welding' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'factory_work', label: 'Factory Work' },
  { value: 'assembly', label: 'Assembly Line' },
  { value: 'food_service', label: 'Food Service' },
  { value: 'cooking', label: 'Cooking & Chef' },
  { value: 'catering', label: 'Catering' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'retail', label: 'Retail' },
  { value: 'sales', label: 'Sales' },
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'driving', label: 'Driving' },
  { value: 'delivery', label: 'Delivery Services' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'janitorial', label: 'Janitorial' },
  { value: 'security', label: 'Security Services' },
  { value: 'guard_services', label: 'Guard Services' },
  { value: 'tailoring', label: 'Tailoring' },
  { value: 'textiles', label: 'Textiles' },
  { value: 'garment_making', label: 'Garment Making' },
  { value: 'beauty_services', label: 'Beauty Services' },
  { value: 'salon', label: 'Salon & Spa' },
  { value: 'spa', label: 'Spa Services' },
  { value: 'education', label: 'Education' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'tutoring', label: 'Tutoring' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'nursing', label: 'Nursing' },
  { value: 'caregiving', label: 'Caregiving' },
  { value: 'IT', label: 'Information Technology' },
  { value: 'technology', label: 'Technology' },
  { value: 'software', label: 'Software Development' },
  { value: 'general_labor', label: 'General Labor' },
  { value: 'manual_labor', label: 'Manual Labor' },
  { value: 'other', label: 'Other' },
];

const COMMON_JOB_ROLES = [
  'Farm Worker',
  'Supervisor',
  'Manager',
  'Assistant',
  'Technician',
  'Driver',
  'Helper',
  'Operator',
  'Mechanic',
  'Clerk',
  'Sales Representative',
  'Delivery Person',
  'Guard',
  'Cleaner',
  'Cook',
  'Waiter/Waitress',
  'Teacher',
  'Nurse',
  'Caregiver',
  'Developer',
  'Designer',
  'Consultant',
  'Specialist',
  'Other',
];

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'freelance', label: 'Freelance' },
];

const SALARY_TYPES = ['daily', 'weekly', 'monthly', 'contract'];
const EXPERIENCE_LEVELS = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];
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

// Google Places Autocomplete Component
const PlacesAutocomplete = ({ onSelect, error, googleMapsLoaded, initialValue = '' }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'lk' },
    },
    debounce: 300,
    defaultValue: initialValue,
  });

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue, false);
    }
  }, [initialValue, setValue]);

  if (!googleMapsLoaded) {
    return (
      <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
        Google Maps is loading...
      </div>
    );
  }

  const handleInput = e => {
    setValue(e.target.value);
  };

  const handleSelect = async address => {
    try {
      setValue(address, false);
      clearSuggestions();

      if (window.google && window.google.maps) {
        const results = await getGeocode({ address });
        const { lat, lng } = await getLatLng(results[0]);
        onSelect({
          address,
          coordinates: [lng, lat],
        });
      }
    } catch (error) {
      console.error('Error getting geocode:', error);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder="Search for a location in Sri Lanka..."
        className={`w-full px-4 py-2 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
      />
      {status === 'OK' && data && data.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description)}
              className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm text-gray-700 transition-colors"
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchJobById, updateJob } = useJobs();
  const [loading, setLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(true);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [useMapLocation, setUseMapLocation] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    jobRole: '',
    employmentType: '',
    location: {
      village: '',
      district: '',
      province: '',
      fullAddress: '',
      coordinates: null,
    },
    salaryType: 'daily',
    salaryAmount: '',
    currency: 'LKR',
    skillsRequired: [],
    experienceRequired: 'none',
    positions: 1,
    startDate: '',
    endDate: '',
  });

  const [errors, setErrors] = useState({});
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const loadJob = async () => {
    try {
      setLoadingJob(true);
      const job = await fetchJobById(id);

      // Set form data from job
      setFormData({
        title: job.title || '',
        description: job.description || '',
        category: job.category || '',
        jobRole: job.jobRole || '',
        employmentType: job.employmentType || '',
        location: {
          village: job.location?.village || '',
          district: job.location?.district || '',
          province: job.location?.province || '',
          fullAddress: job.location?.fullAddress || '',
          coordinates: job.location?.coordinates || null,
        },
        salaryType: job.salaryType || 'daily',
        salaryAmount: job.salaryAmount || '',
        currency: job.currency || 'LKR',
        skillsRequired: job.skillsRequired || [],
        experienceRequired: job.experienceRequired || 'none',
        positions: job.positions || 1,
        startDate: job.startDate ? job.startDate.split('T')[0] : '',
        endDate: job.endDate ? job.endDate.split('T')[0] : '',
      });

      // Set map location if coordinates exist
      if (job.location?.coordinates || job.location?.fullAddress) {
        setUseMapLocation(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to load job');
      scrollToTop();
      console.error('Error loading job:', err);
    } finally {
      setLoadingJob(false);
    }
  };

  // Load job data
  useEffect(() => {
    if (id) {
      loadJob();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Load Google Maps script
  useEffect(() => {
    try {
      const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!googleMapsApiKey) {
        console.warn('Google Maps API key not found. Map search will be disabled.');
        return;
      }

      if (window.google && window.google.maps && window.google.maps.places) {
        setGoogleMapsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleMapsLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
      };
      document.head.appendChild(script);
    } catch (err) {
      console.error('Error loading Google Maps:', err);
    }
  }, []);

  // TipTap Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder:
          'Describe the job requirements, responsibilities, benefits, working conditions, etc.',
      }),
    ],
    content: formData.description || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({ ...prev, description: html }));
      if (errors.description) {
        setErrors(prev => ({ ...prev, description: '' }));
      }
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  // Sync editor when formData.description changes
  useEffect(() => {
    if (editor && formData.description && formData.description !== editor.getHTML()) {
      editor.commands.setContent(formData.description);
    }
  }, [formData.description, editor]);

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  const descriptionText = formData.description.replace(/<[^>]*>/g, '').trim();
  const charCount = descriptionText.length;

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePlaceSelect = place => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        fullAddress: place.address,
        coordinates: {
          type: 'Point',
          coordinates: place.coordinates,
        },
      },
    }));
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skillsRequired.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = skillToRemove => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(skill => skill !== skillToRemove),
    }));
  };

  const validate = () => {
    const newErrors = {};
    const todayDate = new Date().toISOString().split('T')[0];

    // Keep edit validation aligned with Create Job: optional fields,
    // validate only when a value is provided.
    if (formData.title && formData.title.length > 0 && formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters if provided';
    }

    const textDescription = (formData.description || '').trim();
    if (
      textDescription &&
      textDescription.replace(/<[^>]*>/g, '').trim().length > 0 &&
      textDescription.replace(/<[^>]*>/g, '').trim().length < 20
    ) {
      newErrors.description = 'Description must be at least 20 characters if provided';
    }

    if (formData.salaryAmount && formData.salaryAmount <= 0) {
      newErrors.salaryAmount = 'Salary amount must be greater than 0 if provided';
    }
    if (formData.positions && (formData.positions < 1 || formData.positions > 100)) {
      newErrors.positions = 'Positions must be between 1 and 100 if provided';
    }

    if (formData.startDate && formData.startDate < todayDate) {
      newErrors.startDate = 'Start date cannot be in the past';
    }
    if (formData.endDate && formData.endDate < todayDate) {
      newErrors.endDate = 'End date cannot be in the past';
    }
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be the same day or after start date';
    }

    if (useMapLocation && formData.location.fullAddress && !formData.location.coordinates) {
      newErrors.location = 'Please select a location from the search results';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollToTop();
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const rawSubmitData = {
        ...formData,
        location: useMapLocation
          ? {
              village: formData.location.fullAddress
                ? formData.location.fullAddress.split(',')[0] || ''
                : '',
              district: formData.location.fullAddress
                ? formData.location.fullAddress.split(',')[1]?.trim() || ''
                : '',
              province: formData.location.province || '',
              fullAddress: formData.location.fullAddress || '',
              coordinates: formData.location.coordinates,
            }
          : {
              ...formData.location,
              coordinates: null,
            },
      };

      // Remove empty optional fields so backend optional validators are not triggered by ""
      const cleanedLocation = {};
      const rawLocation = rawSubmitData.location || {};
      if (rawLocation.village?.trim()) cleanedLocation.village = rawLocation.village.trim();
      if (rawLocation.district?.trim()) cleanedLocation.district = rawLocation.district.trim();
      if (rawLocation.province?.trim()) cleanedLocation.province = rawLocation.province.trim();
      if (rawLocation.fullAddress?.trim())
        cleanedLocation.fullAddress = rawLocation.fullAddress.trim();
      if (rawLocation.coordinates) cleanedLocation.coordinates = rawLocation.coordinates;

      const cleanedSubmitData = {};
      Object.entries(rawSubmitData).forEach(([key, value]) => {
        if (key === 'location') {
          if (Object.keys(cleanedLocation).length > 0) {
            cleanedSubmitData.location = cleanedLocation;
          }
          return;
        }

        if (key === 'skillsRequired') {
          if (Array.isArray(value) && value.length > 0) {
            cleanedSubmitData.skillsRequired = value;
          }
          return;
        }

        if (value !== '' && value !== null && value !== undefined) {
          cleanedSubmitData[key] = value;
        }
      });

      await updateJob(id, cleanedSubmitData);
      navigate(`/employer/jobs/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update job. Please try again.');
      scrollToTop();
    } finally {
      setLoading(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DottedBackground>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to={`/employer/jobs/${id}`}
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <FaArrowLeft className="w-5 h-5 mr-2" />
            Back to Job Details
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Job</h1>
          <p className="text-gray-600">Update job details below</p>
        </div>
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <FaTimes className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaBriefcase className="w-5 h-5 mr-2 text-green-600" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                  placeholder="e.g., Senior Farm Worker"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                  >
                    <option value="">Select a category</option>
                    {JOB_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Role *</label>
                  <input
                    type="text"
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleChange}
                    list="job-roles"
                    className={`w-full px-4 py-2 border ${errors.jobRole ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                    placeholder="e.g., Farm Supervisor"
                  />
                  <datalist id="job-roles">
                    {COMMON_JOB_ROLES.map(role => (
                      <option key={role} value={role} />
                    ))}
                  </datalist>
                  {errors.jobRole && <p className="mt-1 text-sm text-red-600">{errors.jobRole}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type *
                </label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.employmentType ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                >
                  <option value="">Select employment type</option>
                  {EMPLOYMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.employmentType && (
                  <p className="mt-1 text-sm text-red-600">{errors.employmentType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <div
                  className={`border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg overflow-hidden bg-white`}
                >
                  <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="flex flex-wrap gap-1 items-center">
                      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleBold().run()}
                          className={`px-2 py-1.5 text-sm font-bold rounded hover:bg-gray-200 transition-colors ${editor?.isActive('bold') ? 'bg-gray-300' : ''}`}
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleItalic().run()}
                          className={`px-2 py-1.5 text-sm italic rounded hover:bg-gray-200 transition-colors ${editor?.isActive('italic') ? 'bg-gray-300' : ''}`}
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleUnderline().run()}
                          className={`px-2 py-1.5 text-sm underline rounded hover:bg-gray-200 transition-colors ${editor?.isActive('underline') ? 'bg-gray-300' : ''}`}
                        >
                          U
                        </button>
                      </div>
                      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                          className={`px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
                        >
                          H1
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                          className={`px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                          className={`px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''}`}
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().setParagraph().run()}
                          className={`px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors ${editor?.isActive('paragraph') ? 'bg-gray-300' : ''}`}
                        >
                          P
                        </button>
                      </div>
                      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                          className={`px-2 py-1.5 text-sm rounded hover:bg-gray-200 transition-colors ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
                        >
                          ⬅
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                          className={`px-2 py-1.5 text-sm rounded hover:bg-gray-200 transition-colors ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
                        >
                          ⬌
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                          className={`px-2 py-1.5 text-sm rounded hover:bg-gray-200 transition-colors ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
                        >
                          ➡
                        </button>
                      </div>
                      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleBulletList().run()}
                          className={`px-2 py-1.5 text-sm rounded hover:bg-gray-200 transition-colors ${editor?.isActive('bulletList') ? 'bg-gray-300' : ''}`}
                        >
                          •
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                          className={`px-2 py-1.5 text-sm rounded hover:bg-gray-200 transition-colors ${editor?.isActive('orderedList') ? 'bg-gray-300' : ''}`}
                        >
                          1.
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().undo().run()}
                          disabled={!editor?.can().undo()}
                          className="px-2 py-1.5 text-sm rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↶
                        </button>
                        <button
                          type="button"
                          onClick={() => editor?.chain().focus().redo().run()}
                          disabled={!editor?.can().redo()}
                          className="px-2 py-1.5 text-sm rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↷
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
                    <EditorContent editor={editor} />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  {errors.description ? (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {charCount < 20
                        ? `Minimum ${20 - charCount} more characters required`
                        : 'Use formatting tools to make your description stand out'}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">{charCount} characters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaMapMarkerAlt className="w-5 h-5 mr-2 text-green-600" />
              Location
            </h2>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={!useMapLocation}
                    onChange={() => setUseMapLocation(false)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Manual Entry</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={useMapLocation}
                    onChange={() => setUseMapLocation(true)}
                    className="mr-2"
                    disabled={!googleMapsLoaded}
                  />
                  <span
                    className={`text-sm font-medium ${googleMapsLoaded ? 'text-gray-700' : 'text-gray-400'} flex items-center`}
                  >
                    <FaMap className="w-4 h-4 mr-1" />
                    Search on Map {!googleMapsLoaded && '(Loading...)'}
                  </span>
                </label>
              </div>
            </div>

            {!useMapLocation ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village *</label>
                  <input
                    type="text"
                    name="location.village"
                    value={formData.location.village}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors['location.village'] ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                    placeholder="e.g., Maharagama"
                  />
                  {errors['location.village'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['location.village']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                  <input
                    type="text"
                    name="location.district"
                    value={formData.location.district}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors['location.district'] ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                    placeholder="e.g., Colombo"
                  />
                  {errors['location.district'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['location.district']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                  <select
                    name="location.province"
                    value={formData.location.province}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors['location.province'] ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                  >
                    <option value="">Select province</option>
                    {PROVINCES.map(prov => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                  {errors['location.province'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['location.province']}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Location *
                </label>
                <PlacesAutocomplete
                  onSelect={handlePlaceSelect}
                  error={errors.location}
                  googleMapsLoaded={googleMapsLoaded}
                  initialValue={formData.location.fullAddress}
                />
                {formData.location.fullAddress && (
                  <div className="mt-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                    <strong>Selected:</strong> {formData.location.fullAddress}
                  </div>
                )}
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>
            )}
          </div>

          {/* Salary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaDollarSign className="w-5 h-5 mr-2 text-green-600" />
              Salary Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Amount (LKR) *
                </label>
                <input
                  type="number"
                  name="salaryAmount"
                  value={formData.salaryAmount}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.salaryAmount ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                  placeholder="e.g., 1500"
                  min="0"
                />
                {errors.salaryAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.salaryAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Type *
                </label>
                <select
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                >
                  {SALARY_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUsers className="w-5 h-5 mr-2 text-green-600" />
              Requirements
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Positions *
                  </label>
                  <input
                    type="number"
                    name="positions"
                    value={formData.positions}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.positions ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                    min="1"
                    max="100"
                  />
                  {errors.positions && (
                    <p className="mt-1 text-sm text-red-600">{errors.positions}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    name="experienceRequired"
                    value={formData.experienceRequired}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  >
                    {EXPERIENCE_LEVELS.map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., Planting, Harvesting"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                </div>
                {formData.skillsRequired.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skillsRequired.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 text-green-700 hover:text-green-900"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaCalendar className="w-5 h-5 mr-2 text-green-600" />
              Job Duration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.startDate ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link
              to={`/employer/jobs/${id}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4 mr-2" />
                  Update Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DottedBackground>
  );
};

export default EditJob;
