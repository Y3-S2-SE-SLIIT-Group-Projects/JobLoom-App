import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useJobs } from '../../../contexts/JobContext';
import Navbar from '../../../components/Navbar';
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
} from 'react-icons/fa';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

// Expanded categories
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

// Common job roles
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
const PlacesAutocomplete = ({ onSelect, error, googleMapsLoaded }) => {
  // Always call the hook unconditionally (React requirement)
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'lk' }, // Restrict to Sri Lanka
    },
    debounce: 300,
  });

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
        try {
          const results = await getGeocode({ address });
          if (results && results[0]) {
            const { lat, lng } = await getLatLng(results[0]);
            // Only call onSelect with coordinates if they're valid numbers
            if (
              typeof lat === 'number' &&
              typeof lng === 'number' &&
              !isNaN(lat) &&
              !isNaN(lng) &&
              lat >= -90 &&
              lat <= 90 &&
              lng >= -180 &&
              lng <= 180
            ) {
              onSelect({
                address,
                coordinates: [lng, lat], // [longitude, latitude]
              });
            } else {
              // If coordinates are invalid, call onSelect without coordinates
              onSelect({
                address,
                coordinates: null,
              });
            }
          } else {
            // No results, call onSelect without coordinates
            onSelect({
              address,
              coordinates: null,
            });
          }
        } catch (geocodeError) {
          console.error('Error getting geocode:', geocodeError);
          // If geocoding fails, still call onSelect but without coordinates
          onSelect({
            address,
            coordinates: null,
          });
        }
      } else {
        // Google Maps not loaded, call onSelect without coordinates
        onSelect({
          address,
          coordinates: null,
        });
      }
    } catch (error) {
      console.error('Error in handleSelect:', error);
      // On any error, call onSelect without coordinates
      onSelect({
        address,
        coordinates: null,
      });
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
        className={`w-full px-4 py-2 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
      />
      {status === 'OK' && data && data.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
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

const CreateJob = () => {
  const navigate = useNavigate();
  const { createJob, generateJobDescription } = useJobs();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [generationMessage, setGenerationMessage] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [useMapLocation, setUseMapLocation] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [componentError, setComponentError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '', // Will be HTML from rich text editor
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
        try {
          setGoogleMapsLoaded(true);
        } catch (err) {
          console.error('Error setting Google Maps loaded state:', err);
        }
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
      };
      document.head.appendChild(script);

      return () => {
        // Script cleanup is handled by browser
      };
    } catch (err) {
      console.error('Error loading Google Maps:', err);
      setComponentError(err);
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
          "Describe the job requirements, responsibilities, benefits, working conditions, etc. Be detailed and clear about what you're looking for...",
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

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  // Sync editor content when formData.description changes externally
  useEffect(() => {
    if (editor && formData.description !== editor.getHTML()) {
      editor.commands.setContent(formData.description || '');
    }
  }, [formData.description, editor]);

  // Error boundary for this component - check AFTER all hooks
  if (componentError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            {componentError.message || 'An error occurred while loading the page.'}
          </p>
          <button
            onClick={() => {
              setComponentError(null);
              window.location.reload();
            }}
            className="px-4 py-2 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0]"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Character count for description
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
    // Extract province from address if possible (common Sri Lankan provinces)
    const provinces = [
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
    const addressParts = place.address.split(',').map(part => part.trim());
    let extractedProvince = '';

    for (const part of addressParts) {
      const foundProvince = provinces.find(p => part.includes(p));
      if (foundProvince) {
        extractedProvince = foundProvince;
        break;
      }
    }

    // Only set coordinates if they're valid (array with 2 numbers)
    const validCoordinates =
      place.coordinates &&
      Array.isArray(place.coordinates) &&
      place.coordinates.length === 2 &&
      typeof place.coordinates[0] === 'number' &&
      typeof place.coordinates[1] === 'number' &&
      !isNaN(place.coordinates[0]) &&
      !isNaN(place.coordinates[1]) &&
      place.coordinates[0] >= -180 &&
      place.coordinates[0] <= 180 &&
      place.coordinates[1] >= -90 &&
      place.coordinates[1] <= 90;

    setFormData(prev => {
      const newLocation = {
        ...prev.location,
        fullAddress: place.address,
        province: extractedProvince || prev.location.province || '',
      };

      // Only add coordinates if valid, otherwise don't include it at all
      if (validCoordinates) {
        newLocation.coordinates = {
          type: 'Point',
          coordinates: place.coordinates,
        };
      } else {
        // Explicitly remove coordinates if invalid
        delete newLocation.coordinates;
      }

      return {
        ...prev,
        location: newLocation,
      };
    });
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

  const handleGenerateDescription = async () => {
    setError('');
    setGenerationMessage('');
    setIsGeneratingDescription(true);

    try {
      const result = await generateJobDescription({
        title: formData.title,
        category: formData.category,
        jobRole: formData.jobRole,
        employmentType: formData.employmentType,
        salaryType: formData.salaryType,
        salaryAmount: formData.salaryAmount,
        skillsRequired: formData.skillsRequired,
        experienceRequired: formData.experienceRequired,
        positions: formData.positions,
        location: formData.location,
      });

      const generatedDescription = result?.description || '';
      setFormData(prev => ({ ...prev, description: generatedDescription }));
      setGenerationMessage(
        result?.source === 'ai'
          ? 'Description generated using third-party AI.'
          : 'Description generated using template fallback (AI key is missing or request failed).'
      );
    } catch (err) {
      setError(err.message || 'Failed to generate description.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    // All fields are optional now - no required validation
    // Only validate format if values are provided

    if (formData.title && formData.title.length > 0 && formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters if provided';
    }

    // Description validation (only if provided)
    if (formData.description) {
      const textDescription = formData.description.trim();
      if (
        textDescription.replace(/<[^>]*>/g, '').trim().length > 0 &&
        textDescription.replace(/<[^>]*>/g, '').trim().length < 20
      ) {
        newErrors.description = 'Description must be at least 20 characters if provided';
      }
    }

    if (formData.positions && (formData.positions < 1 || formData.positions > 100)) {
      newErrors.positions = 'Positions must be between 1 and 100 if provided';
    }

    if (formData.salaryAmount && formData.salaryAmount <= 0) {
      newErrors.salaryAmount = 'Salary amount must be greater than 0 if provided';
    }

    setErrors(newErrors);
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
      // Prepare data for submission - all fields are optional
      // Only include coordinates if they're valid (not empty array)
      let locationData;

      if (useMapLocation && formData.location.fullAddress) {
        // Extract location parts from address
        const addressParts = formData.location.fullAddress.split(',').map(p => p.trim());
        locationData = {
          village: addressParts[0] || formData.location.village || '',
          district: addressParts[1] || formData.location.district || '',
          province: formData.location.province || '',
          fullAddress: formData.location.fullAddress,
        };

        // Only add coordinates if they exist and are valid
        // CRITICAL: Never add coordinates with empty arrays
        if (
          formData.location.coordinates &&
          formData.location.coordinates.coordinates &&
          Array.isArray(formData.location.coordinates.coordinates) &&
          formData.location.coordinates.coordinates.length === 2 &&
          formData.location.coordinates.coordinates.length > 0 && // Extra check
          typeof formData.location.coordinates.coordinates[0] === 'number' &&
          typeof formData.location.coordinates.coordinates[1] === 'number' &&
          !isNaN(formData.location.coordinates.coordinates[0]) &&
          !isNaN(formData.location.coordinates.coordinates[1]) &&
          formData.location.coordinates.coordinates[0] >= -180 &&
          formData.location.coordinates.coordinates[0] <= 180 &&
          formData.location.coordinates.coordinates[1] >= -90 &&
          formData.location.coordinates.coordinates[1] <= 90
        ) {
          locationData.coordinates = formData.location.coordinates;
        }
        // DO NOT add coordinates if invalid - leave it undefined
      } else {
        locationData = {
          village: formData.location.village || '',
          district: formData.location.district || '',
          province: formData.location.province || '',
          fullAddress: formData.location.fullAddress || '',
        };
        // Only add coordinates if they exist and are valid (from manual entry)
        if (
          formData.location.coordinates &&
          formData.location.coordinates.coordinates &&
          Array.isArray(formData.location.coordinates.coordinates) &&
          formData.location.coordinates.coordinates.length === 2 &&
          formData.location.coordinates.coordinates.length > 0 &&
          typeof formData.location.coordinates.coordinates[0] === 'number' &&
          typeof formData.location.coordinates.coordinates[1] === 'number' &&
          !isNaN(formData.location.coordinates.coordinates[0]) &&
          !isNaN(formData.location.coordinates.coordinates[1])
        ) {
          locationData.coordinates = formData.location.coordinates;
        }
      }

      // Clean up location data - only include non-empty values
      const cleanedLocation = {};
      if (locationData.village && locationData.village.trim())
        cleanedLocation.village = locationData.village.trim();
      if (locationData.district && locationData.district.trim())
        cleanedLocation.district = locationData.district.trim();
      if (locationData.province && locationData.province.trim())
        cleanedLocation.province = locationData.province.trim();
      if (locationData.fullAddress && locationData.fullAddress.trim())
        cleanedLocation.fullAddress = locationData.fullAddress.trim();

      // Only include coordinates if they're valid and not empty
      // CRITICAL: Never include coordinates with empty arrays to prevent MongoDB GeoJSON errors
      // Check coordinates exist, have coordinates array, array is not empty, has exactly 2 valid numbers
      const coords = locationData.coordinates?.coordinates;
      const hasValidCoords =
        locationData.coordinates &&
        coords &&
        Array.isArray(coords) &&
        coords.length === 2 &&
        coords.length > 0 && // Extra check for empty array
        typeof coords[0] === 'number' &&
        typeof coords[1] === 'number' &&
        !isNaN(coords[0]) &&
        !isNaN(coords[1]) &&
        coords[0] >= -180 &&
        coords[0] <= 180 &&
        coords[1] >= -90 &&
        coords[1] <= 90;

      if (hasValidCoords) {
        cleanedLocation.coordinates = locationData.coordinates;
      }
      // DO NOT include coordinates if invalid - leave it undefined
      // This prevents sending { coordinates: { coordinates: [] } }

      // Clean up form data - remove empty strings, null, undefined
      const cleanedFormData = {};
      Object.keys(formData).forEach(key => {
        if (key === 'location') {
          // Handle location separately
          if (Object.keys(cleanedLocation).length > 0) {
            cleanedFormData.location = cleanedLocation;
          }
        } else if (key === 'skillsRequired') {
          // Always include skillsRequired array if it exists and has items
          if (Array.isArray(formData[key]) && formData[key].length > 0) {
            cleanedFormData[key] = formData[key];
          }
          // If empty array, don't include it (optional field)
        } else if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
          cleanedFormData[key] = formData[key];
        }
      });

      // Ensure skillsRequired is explicitly included if it has items
      // This is a safety check to ensure it's not lost in the cleaning process
      if (
        formData.skillsRequired &&
        Array.isArray(formData.skillsRequired) &&
        formData.skillsRequired.length > 0
      ) {
        cleanedFormData.skillsRequired = formData.skillsRequired;
      }

      const submitData = cleanedFormData;

      // Final check: Remove coordinates if they exist but are invalid
      // This is CRITICAL to prevent MongoDB GeoJSON errors
      if (submitData.location) {
        if (submitData.location.coordinates) {
          const coords = submitData.location.coordinates.coordinates;
          // Remove coordinates if empty array, invalid, or missing
          if (
            !coords ||
            !Array.isArray(coords) ||
            coords.length === 0 ||
            coords.length !== 2 ||
            typeof coords[0] !== 'number' ||
            typeof coords[1] !== 'number' ||
            isNaN(coords[0]) ||
            isNaN(coords[1])
          ) {
            // Force remove coordinates
            delete submitData.location.coordinates;
            // Also set to undefined to ensure it's not included
            submitData.location.coordinates = undefined;
          }
        }

        // If location has no valid data, remove it entirely
        if (
          !submitData.location.village &&
          !submitData.location.district &&
          !submitData.location.province &&
          !submitData.location.fullAddress &&
          !submitData.location.coordinates
        ) {
          delete submitData.location;
        }
      }

      // Remove any undefined values from the entire object
      const cleanSubmitData = JSON.parse(JSON.stringify(submitData));

      // CRITICAL: Ensure skillsRequired is included if it has items
      // JSON.parse(JSON.stringify()) might remove it, so we explicitly add it back
      if (
        formData.skillsRequired &&
        Array.isArray(formData.skillsRequired) &&
        formData.skillsRequired.length > 0
      ) {
        cleanSubmitData.skillsRequired = formData.skillsRequired;
      }

      console.log('Submitting job data:', JSON.stringify(cleanSubmitData, null, 2));
      console.log('Skills being sent:', cleanSubmitData.skillsRequired);
      console.log('Original formData skills:', formData.skillsRequired);
      await createJob(cleanSubmitData);
      navigate('/employer/my-jobs');
    } catch (err) {
      setError(err.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DottedBackground>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Job</h1>
          <p className="text-gray-600">Fill in the details below to post your job opening</p>
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
              <FaBriefcase className="w-5 h-5 mr-2 text-[#6794D1]" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                  placeholder="e.g., Senior Farm Worker"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                  <input
                    type="text"
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleChange}
                    list="job-roles"
                    className={`w-full px-4 py-2 border ${errors.jobRole ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
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
                  Employment Type
                </label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.employmentType ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
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
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaMapMarkerAlt className="w-5 h-5 mr-2 text-[#6794D1]" />
              Location
            </h2>

            {/* Location Type Toggle */}
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
              {useMapLocation && !googleMapsLoaded && (
                <p className="mt-2 text-sm text-amber-600">
                  Google Maps is loading. Please wait or use manual entry.
                </p>
              )}
            </div>

            {!useMapLocation ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                  <input
                    type="text"
                    name="location.village"
                    value={formData.location.village}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors['location.village'] ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    placeholder="e.g., Maharagama"
                  />
                  {errors['location.village'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['location.village']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input
                    type="text"
                    name="location.district"
                    value={formData.location.district}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors['location.district'] ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    placeholder="e.g., Colombo"
                  />
                  {errors['location.district'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['location.district']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <select
                    name="location.province"
                    value={formData.location.province}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors['location.province'] ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
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
                  Search Location
                </label>
                <PlacesAutocomplete
                  onSelect={handlePlaceSelect}
                  error={errors.location}
                  googleMapsLoaded={googleMapsLoaded}
                />
                {formData.location.fullAddress && (
                  <div className="mt-2 p-3 bg-[#6794D1]/10 text-[#6794D1] rounded-lg text-sm">
                    <strong>Selected:</strong> {formData.location.fullAddress}
                  </div>
                )}
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                <p className="mt-2 text-sm text-gray-500">
                  Search and select a location from the dropdown
                </p>
              </div>
            )}
          </div>

          {/* Salary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaDollarSign className="w-5 h-5 mr-2 text-[#6794D1]" />
              Salary Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Amount (LKR)
                </label>
                <input
                  type="number"
                  name="salaryAmount"
                  value={formData.salaryAmount}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.salaryAmount ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                  placeholder="e.g., 1500"
                  min="0"
                />
                {errors.salaryAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.salaryAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
                <select
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
              <FaUsers className="w-5 h-5 mr-2 text-blue-600" />
              Requirements
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Positions
                  </label>
                  <input
                    type="number"
                    name="positions"
                    value={formData.positions}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.positions ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., Planting, Harvesting"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                </div>
                {formData.skillsRequired.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skillsRequired.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 text-blue-700 hover:text-blue-900"
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
              <FaCalendar className="w-5 h-5 mr-2 text-blue-600" />
              Job Duration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.startDate ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDescription}
                className="px-4 py-2 bg-[#6794D1] text-white rounded-lg hover:bg-[#5a83c0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGeneratingDescription ? 'Generating...' : 'Generate Description'}
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              Use the details above, then generate and edit the description before creating the job.
            </p>

            {generationMessage && (
              <div className="mb-3 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
                {generationMessage}
              </div>
            )}

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
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={`px-2 py-1.5 text-sm italic rounded hover:bg-gray-200 transition-colors ${editor?.isActive('italic') ? 'bg-gray-300' : ''}`}
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleUnderline().run()}
                      className={`px-2 py-1.5 text-sm underline rounded hover:bg-gray-200 transition-colors ${editor?.isActive('underline') ? 'bg-gray-300' : ''}`}
                      title="Underline"
                    >
                      U
                    </button>
                  </div>

                  <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
                      title="Heading 1"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''}`}
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().setParagraph().run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors ${editor?.isActive('paragraph') ? 'bg-gray-300' : ''}`}
                      title="Paragraph"
                    >
                      P
                    </button>
                  </div>

                  <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
                      title="Align Left"
                    >
                      Left
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
                      title="Align Center"
                    >
                      Center
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
                      title="Align Right"
                    >
                      Right
                    </button>
                  </div>

                  <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors ${editor?.isActive('bulletList') ? 'bg-gray-300' : ''}`}
                      title="Bullet List"
                    >
                      UL
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors ${editor?.isActive('orderedList') ? 'bg-gray-300' : ''}`}
                      title="Numbered List"
                    >
                      OL
                    </button>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().undo().run()}
                      disabled={!editor?.can().undo()}
                      className="px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Undo"
                    >
                      Undo
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().redo().run()}
                      disabled={!editor?.can().redo()}
                      className="px-2 py-1.5 text-xs rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Redo"
                    >
                      Redo
                    </button>
                  </div>
                </div>
              </div>

              <div className="min-h-[220px] max-h-[420px] overflow-y-auto">
                <EditorContent editor={editor} />
              </div>
            </div>

            <div className="flex justify-between items-center mt-2">
              {errors.description ? (
                <p className="text-sm text-red-600">{errors.description}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  {charCount > 0 && charCount < 20
                    ? `Minimum ${20 - charCount} more characters recommended`
                    : charCount >= 20
                      ? 'Use formatting tools to make your description stand out'
                      : 'Description is optional'}
                </p>
              )}
              <p className="text-xs text-gray-400">{charCount} characters</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link
              to="/employer/dashboard"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FaPlus className="w-4 h-4 mr-2" />
                  Create Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DottedBackground>
  );
};

export default CreateJob;
