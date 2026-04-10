import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useJobs } from '../../../hooks/useJobs';

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

const normalizeText = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const resolveCategoryValue = input => {
  const raw = String(input || '').trim();
  if (!raw) return '';

  const exactValue = JOB_CATEGORIES.find(cat => cat.value.toLowerCase() === raw.toLowerCase());
  if (exactValue) return exactValue.value;

  const exactLabel = JOB_CATEGORIES.find(cat => cat.label.toLowerCase() === raw.toLowerCase());
  if (exactLabel) return exactLabel.value;

  const normalizedRaw = normalizeText(raw);
  const normalizedMatch = JOB_CATEGORIES.find(cat => {
    const valueNorm = normalizeText(cat.value);
    const labelNorm = normalizeText(cat.label);
    return (
      valueNorm === normalizedRaw ||
      labelNorm === normalizedRaw ||
      valueNorm.startsWith(normalizedRaw) ||
      labelNorm.startsWith(normalizedRaw)
    );
  });

  return normalizedMatch ? normalizedMatch.value : '';
};

// Skill sets per category  (advanced + simple basics merged)
const CATEGORY_SKILLS = {
  agriculture: [
    'Planting',
    'Harvesting',
    'Irrigation Management',
    'Pest Control',
    'Soil Preparation',
    'Fertilizer Application',
    'Crop Monitoring',
    'Land Clearing',
    'Seed Selection',
    'Post-Harvest Handling',
    'Greenhouse Operations',
    'Composting',
    'Farm Equipment Operation',
    'Teamwork',
    'Physical Fitness',
    'Punctuality',
    'Following Instructions',
  ],
  farming: [
    'Soil Preparation',
    'Planting & Seeding',
    'Weeding',
    'Harvesting',
    'Crop Rotation',
    'Water Management',
    'Organic Farming Practices',
    'Pesticide Application',
    'Field Maintenance',
    'Storage Handling',
    'Teamwork',
    'Physical Fitness',
    'Punctuality',
    'Basic Tool Use',
  ],
  livestock: [
    'Animal Care & Feeding',
    'Herd Management',
    'Milking',
    'Veterinary Assistance',
    'Pasture Management',
    'Animal Health Monitoring',
    'Breeding Assistance',
    'Record Keeping',
    'Vaccination Assistance',
    'Poultry Handling',
    'Teamwork',
    'Physical Fitness',
    'Punctuality',
    'Attention to Detail',
  ],
  fishing: [
    'Net Handling',
    'Fish Processing & Cleaning',
    'Boat Operation',
    'Aquaculture Maintenance',
    'Fish Sorting & Grading',
    'Cold Chain Handling',
    'Fishing Equipment Maintenance',
    'Catch Reporting',
    'Dive Safety',
    'Teamwork',
    'Physical Fitness',
    'Punctuality',
    'Safety Awareness',
  ],
  construction: [
    'Masonry',
    'Carpentry',
    'Concrete Mixing & Pouring',
    'Site Safety',
    'Scaffolding',
    'Blueprint Reading',
    'Formwork Setup',
    'Tiling',
    'Painting & Finishing',
    'Steel Fixing',
    'Excavation',
    'Roofing',
    'Demolition',
    'Material Handling',
    'Teamwork',
    'Physical Fitness',
    'Punctuality',
    'Following Instructions',
  ],
  carpentry: [
    'Woodworking',
    'Measure & Cut',
    'Joinery',
    'Furniture Making',
    'Door & Window Fitting',
    'Cabinet Making',
    'Wood Polishing',
    'Power Tool Operation',
    'Framing',
    'Repairs & Restoration',
    'Attention to Detail',
    'Teamwork',
    'Punctuality',
  ],
  masonry: [
    'Brick Laying',
    'Concrete Work',
    'Stone Cutting',
    'Plastering',
    'Block Work',
    'Foundation Work',
    'Tiling',
    'Rendering',
    'Physical Fitness',
    'Teamwork',
    'Punctuality',
    'Safety Awareness',
  ],
  plumbing: [
    'Pipe Fitting',
    'Drainage Installation',
    'Leak Repair',
    'Soldering',
    'Sanitation Systems',
    'Water Supply Systems',
    'Valve Installation',
    'Guttering',
    'Pipe Threading',
    'Blueprint Reading',
    'Attention to Detail',
    'Punctuality',
    'Teamwork',
  ],
  electrical: [
    'Wiring & Cabling',
    'Troubleshooting',
    'Safety Protocols',
    'Panel Board Installation',
    'Earthing & Grounding',
    'Circuit Testing',
    'Load Calculation',
    'Solar Panel Installation',
    'Conduit Fitting',
    'Switchgear Operation',
    'Appliance Repairs',
    'Attention to Detail',
    'Punctuality',
    'Safety Awareness',
  ],
  welding: [
    'MIG Welding',
    'TIG Welding',
    'Arc Welding',
    'Cutting & Grinding',
    'Metal Fabrication',
    'Blueprint Reading',
    'Safety Practices',
    'Welding Inspection',
    'Brazing',
    'Sheet Metal Work',
    'Attention to Detail',
    'Physical Fitness',
    'Safety Awareness',
  ],
  manufacturing: [
    'Machine Operation',
    'Quality Control',
    'Assembly Line Work',
    'Production Planning',
    'Inventory Management',
    'Equipment Maintenance',
    'Safety & OSHA Compliance',
    'Forklift Operation',
    'Packaging',
    'Batch Record Keeping',
    'Material Inspection',
    'Teamwork',
    'Punctuality',
    'Following Instructions',
    'Physical Fitness',
  ],
  factory_work: [
    'Assembly Work',
    'Machine Operation',
    'Quality Inspection',
    'Production Targets',
    'Shift Work',
    'Conveyor Belt Operation',
    'Safety Compliance',
    'Raw Material Handling',
    'Teamwork',
    'Punctuality',
    'Physical Fitness',
    'Attention to Detail',
  ],
  assembly: [
    'Component Assembly',
    'Tool Handling',
    'Quality Checking',
    'Following Work Instructions',
    'Packing & Labeling',
    'Line Balancing',
    'Teamwork',
    'Punctuality',
    'Attention to Detail',
  ],
  food_service: [
    'Food Preparation',
    'Sanitation & Hygiene',
    'Order Taking',
    'Table Service',
    'Cash Handling',
    'Stock Rotation',
    'Food Safety Standards',
    'POS Operation',
    'Menu Knowledge',
    'Customer Service',
    'Clearing & Cleaning',
    'Teamwork',
    'Punctuality',
    'Communication Skills',
  ],
  cooking: [
    'Food Preparation',
    'Knife Skills',
    'Cooking Techniques',
    'Menu Planning',
    'Kitchen Hygiene',
    'Stock & Inventory',
    'Recipe Following',
    'Pastry & Baking',
    'Cost Control',
    'Kitchen Equipment Use',
    'Portion Control',
    'Teamwork',
    'Punctuality',
    'Attention to Detail',
  ],
  catering: [
    'Bulk Cooking',
    'Event Setup',
    'Food Portioning',
    'Buffet Management',
    'Client Coordination',
    'Food Safety',
    'Transport & Cold Chain',
    'Staff Supervision',
    'Teamwork',
    'Communication Skills',
    'Punctuality',
  ],
  hospitality: [
    'Guest Service',
    'Housekeeping',
    'Front Desk Operations',
    'Reservation Management',
    'Room Service',
    'Check-In/Check-Out',
    'Complaint Handling',
    'Event Coordination',
    'Laundry Service',
    'Concierge Services',
    'F&B Service',
    'Communication Skills',
    'Teamwork',
    'Punctuality',
    'Attention to Detail',
  ],
  retail: [
    'Cash Handling',
    'Stock Replenishment',
    'POS Operation',
    'Customer Assistance',
    'Inventory Counting',
    'Product Knowledge',
    'Visual Merchandising',
    'Loss Prevention',
    'Returns Handling',
    'Opening & Closing Procedures',
    'Communication Skills',
    'Teamwork',
    'Punctuality',
  ],
  sales: [
    'Lead Generation',
    'Negotiation',
    'Customer Relations',
    'Target Achievement',
    'Product Pitching',
    'Cold Calling',
    'CRM Software',
    'Market Research',
    'Upselling & Cross-Selling',
    'Reporting & Analytics',
    'Contract Closing',
    'Communication Skills',
    'Confidence',
    'Time Management',
  ],
  customer_service: [
    'Communication Skills',
    'Problem Solving',
    'Phone & Email Support',
    'Live Chat Support',
    'Complaint Resolution',
    'CRM Usage',
    'Data Entry',
    'Empathy & Patience',
    'Escalation Handling',
    'Product Knowledge',
    'Multi-tasking',
    'Teamwork',
    'Punctuality',
    'Active Listening',
  ],
  transportation: [
    'Route Planning',
    'Goods Handling',
    'Vehicle Maintenance',
    'Delivery Scheduling',
    'Shipment Documentation',
    'GPS Navigation',
    'Load Securing',
    'Customs Clearance Basics',
    'Warehouse Operations',
    'Punctuality',
    'Physical Fitness',
    'Time Management',
  ],
  driving: [
    'Valid Driving License',
    'Route Planning',
    'Vehicle Maintenance',
    'Safe Driving Practices',
    'Navigation Apps',
    'Logbook Keeping',
    'Passenger Handling',
    'Defensive Driving',
    'Traffic Law Knowledge',
    'Punctuality',
    'Time Management',
    'Communication Skills',
  ],
  delivery: [
    'Last-Mile Delivery',
    'Route Optimization',
    'Package Handling',
    'Customer Interaction',
    'Delivery App Usage',
    'Time Management',
    'Cash on Delivery Handling',
    'POD Documentation',
    'Punctuality',
    'Physical Fitness',
    'Communication Skills',
  ],
  logistics: [
    'Warehouse Management',
    'Stock Tracking',
    'Order Fulfillment',
    'ERP Software',
    'Supply Chain Coordination',
    'Loading & Unloading',
    'Inventory Auditing',
    'Forklift Operation',
    'Cold Chain Management',
    'Teamwork',
    'Attention to Detail',
    'Punctuality',
  ],
  cleaning: [
    'Surface Cleaning',
    'Sanitation & Disinfection',
    'Waste Disposal',
    'Floor Mopping & Polishing',
    'Window Cleaning',
    'Equipment Use',
    'Chemical Handling Safety',
    'Linen Management',
    'Restroom Cleaning',
    'Laundry Services',
    'Teamwork',
    'Punctuality',
    'Attention to Detail',
    'Physical Fitness',
  ],
  maintenance: [
    'General Repairs',
    'Preventive Maintenance',
    'Plumbing Basics',
    'Electrical Basics',
    'Painting & Touch-Up',
    'HVAC Maintenance',
    'Equipment Servicing',
    'Carpentry Basics',
    'Record Keeping',
    'Punctuality',
    'Physical Fitness',
    'Problem Solving',
  ],
  janitorial: [
    'Trash Removal',
    'Sweeping & Mopping',
    'Restroom Maintenance',
    'Chemical Handling',
    'Recycling Management',
    'Outdoor Cleaning',
    'Punctuality',
    'Physical Fitness',
    'Teamwork',
  ],
  security: [
    'Patrolling',
    'Access Control',
    'Incident Reporting',
    'CCTV Monitoring',
    'Emergency Response',
    'Crowd Control',
    'First Aid Basics',
    'Search Procedures',
    'Communication Skills',
    'Alarm Systems',
    'Shift Handover Procedures',
    'Physical Fitness',
    'Alertness',
    'Punctuality',
    'Integrity',
  ],
  guard_services: [
    'Gate Control',
    'Visitor Logging',
    'Patrolling',
    'Conflict De-escalation',
    'Emergency Procedures',
    'Physical Fitness',
    'Punctuality',
    'Alertness',
    'Integrity',
    'Communication Skills',
  ],
  tailoring: [
    'Sewing Machine Operation',
    'Pattern Making',
    'Alterations & Repairs',
    'Measurement Taking',
    'Fabric Cutting',
    'Hand Stitching',
    'Garment Finishing',
    'Button & Zipper Fitting',
    'Design Reading',
    'Custom Fitting',
    'Embroidery',
    'Attention to Detail',
    'Creativity',
    'Punctuality',
  ],
  textiles: [
    'Fabric Inspection',
    'Loom Operation',
    'Dyeing & Printing',
    'Thread Work',
    'Quality Checking',
    'Machine Troubleshooting',
    'Attention to Detail',
    'Teamwork',
    'Punctuality',
  ],
  garment_making: [
    'Pattern Cutting',
    'Sewing & Stitching',
    'Overlock Machine Use',
    'Quality Inspection',
    'Pressing & Ironing',
    'Fabric Handling',
    'Attention to Detail',
    'Teamwork',
    'Punctuality',
  ],
  beauty_services: [
    'Hair Cutting & Styling',
    'Makeup Application',
    'Facial Treatments',
    'Waxing & Threading',
    'Nail Care & Manicure',
    'Pedicure',
    'Hair Coloring',
    'Skin Care',
    'Customer Consultation',
    'Product Knowledge',
    'Hygiene & Sanitation',
    'Communication Skills',
    'Creativity',
    'Punctuality',
    'Attention to Detail',
  ],
  salon: [
    'Hair Cutting',
    'Blow Dry & Styling',
    'Coloring & Highlights',
    'Keratin Treatment',
    'Scalp Treatment',
    'Customer Relations',
    'Communication Skills',
    'Creativity',
    'Punctuality',
  ],
  spa: [
    'Massage Therapy',
    'Aromatherapy',
    'Body Wraps',
    'Reflexology',
    'Stone Therapy',
    'Customer Consultation',
    'Hygiene Standards',
    'Product Application',
    'Communication Skills',
    'Empathy',
    'Punctuality',
  ],
  education: [
    'Lesson Planning',
    'Classroom Management',
    'Student Assessment',
    'Subject Knowledge',
    'Communication Skills',
    'Curriculum Development',
    'Student Counseling',
    'Report Writing',
    'Digital Tools Usage',
    'Special Needs Awareness',
    'Bilingual Teaching',
    'Patience',
    'Empathy',
    'Punctuality',
    'Teamwork',
  ],
  teaching: [
    'Subject Expertise',
    'Lesson Delivery',
    'Classroom Discipline',
    'Assignment & Grading',
    'Parent Communication',
    'Result Analysis',
    'Patience',
    'Communication Skills',
    'Punctuality',
  ],
  tutoring: [
    'One-on-One Coaching',
    'Study Plan Creation',
    'Practice Tests',
    'Doubt Clarification',
    'Progress Tracking',
    'Online Tools',
    'Patience',
    'Communication Skills',
    'Punctuality',
  ],
  healthcare: [
    'Patient Care',
    'First Aid & CPR',
    'Medication Administration',
    'Vital Signs Monitoring',
    'Medical Records',
    'Wound Care',
    'Patient Communication',
    'Infection Control',
    'IV Cannulation',
    'Patient Lifting Techniques',
    'Mental Health Support',
    'Empathy',
    'Teamwork',
    'Punctuality',
    'Attention to Detail',
  ],
  nursing: [
    'Clinical Assessment',
    'Medication Management',
    'IV Therapy',
    'Patient Education',
    'Wound Dressing',
    'Shift Reporting',
    'Emergency Response',
    'ECG Monitoring',
    'Empathy',
    'Teamwork',
    'Punctuality',
    'Attention to Detail',
  ],
  caregiving: [
    'Personal Hygiene Assistance',
    'Mobility Support',
    'Meal Preparation',
    'Companionship',
    'Medication Reminders',
    'Appointment Scheduling',
    'Dementia Care',
    'Report Writing',
    'Empathy',
    'Patience',
    'Communication Skills',
    'Punctuality',
  ],
  IT: [
    'Hardware Troubleshooting',
    'Software Installation',
    'Network Setup',
    'Remote Desktop Support',
    'Help Desk Ticketing',
    'OS Administration',
    'Data Backup & Recovery',
    'Cybersecurity Basics',
    'Active Directory',
    'VPN Configuration',
    'User Training',
    'Problem Solving',
    'Communication Skills',
    'Teamwork',
    'Attention to Detail',
  ],
  technology: [
    'Technical Support',
    'System Administration',
    'Cloud Platforms',
    'Database Management',
    'IT Documentation',
    'Vendor Management',
    'Problem Solving',
    'Communication Skills',
    'Teamwork',
  ],
  software: [
    'Programming (Python/Java/JS)',
    'Debugging',
    'Version Control (Git)',
    'REST API Development',
    'Database Design (SQL/NoSQL)',
    'Unit Testing',
    'Agile/Scrum',
    'Code Review',
    'UI/UX Principles',
    'CI/CD Pipelines',
    'Docker & Containers',
    'Problem Solving',
    'Communication Skills',
    'Teamwork',
    'Attention to Detail',
  ],
  general_labor: [
    'Manual Handling',
    'Basic Tool Use',
    'Teamwork',
    'Loading & Unloading',
    'Site Cleanup',
    'Following Instructions',
    'Physical Fitness',
    'Time Management',
    'Safety Awareness',
    'Punctuality',
    'Adaptability',
    'Communication Skills',
  ],
  manual_labor: [
    'Heavy Lifting',
    'Digging & Excavation',
    'Equipment Operation',
    'Outdoor Work Endurance',
    'Team Collaboration',
    'Physical Fitness',
    'Punctuality',
    'Following Instructions',
  ],
  other: [
    'Communication',
    'Punctuality',
    'Teamwork',
    'Problem Solving',
    'Time Management',
    'Attention to Detail',
    'Adaptability',
    'Honesty',
    'Willingness to Learn',
    'Physical Fitness',
  ],
};

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

const hasHtmlTags = text => /<\/?(p|h3|ul|li|strong)\b/i.test(text || '');

const toFormattedHtml = raw => {
  const input = String(raw || '').trim();
  if (!input) return '';
  if (hasHtmlTags(input)) return input;

  const normalized = input
    .replace(/^```(?:html)?/i, '')
    .replace(/```$/i, '')
    .replace(/\r/g, '')
    .trim();

  const lines = normalized
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  // Lossless markdown-like conversion:
  // - keeps every line from AI output
  // - supports bullet lists, bold headings, and paragraphs
  // - does not drop unrecognized content
  const htmlParts = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }
  };

  lines.forEach(line => {
    const cleaned = line.trim();
    if (!cleaned) return;

    // Bullet line
    if (/^[-*]\s+/.test(cleaned)) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      const item = cleaned.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlParts.push(`<li>${item}</li>`);
      return;
    }

    // Non-bullet line closes any running list
    closeList();

    // Markdown-style full bold heading line, e.g. **Key Responsibilities:**
    const headingMatch = cleaned.match(/^\*\*(.+)\*\*$/);
    if (headingMatch) {
      const headingText = headingMatch[1].trim().replace(/:$/, '');
      htmlParts.push(`<h3>${headingText}</h3>`);
      return;
    }

    // Plain heading-ish line ending with ":" (e.g., How to Apply:)
    if (/^[A-Za-z][^<>]{1,80}:$/.test(cleaned)) {
      htmlParts.push(`<h3>${cleaned.replace(/:$/, '').trim()}</h3>`);
      return;
    }

    // Normal paragraph, preserve inline bold
    const paragraph = cleaned.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    htmlParts.push(`<p>${paragraph}</p>`);
  });

  closeList();
  return htmlParts.join('');
};

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
      <div className="w-full px-4 py-2 border border-border rounded-lg bg-surface-muted text-subtle">
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
        className={`w-full px-4 py-2 border ${error ? 'border-error' : 'border-border'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
      />
      {status === 'OK' && data && data.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description)}
              className="px-4 py-2 hover:bg-info/10 cursor-pointer text-sm text-muted transition-colors"
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createJob, generateJobDescription } = useJobs();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [generationMessage, setGenerationMessage] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
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

  // Add suggested skill(s) from category
  const handleAddSuggestedSkill = skill => {
    if (!skill) return;
    const s = String(skill).trim();
    if (!s) return;
    if (!formData.skillsRequired.includes(s)) {
      setFormData(prev => ({ ...prev, skillsRequired: [...prev.skillsRequired, s] }));
    }
  };

  const handleAddAllSuggested = () => {
    const suggestions = CATEGORY_SKILLS[formData.category] || [];
    const toAdd = suggestions.filter(s => !formData.skillsRequired.includes(s));
    if (toAdd.length === 0) return;
    setFormData(prev => ({ ...prev, skillsRequired: [...prev.skillsRequired, ...toAdd] }));
  };

  // Skills autocomplete: filter category skills by current input
  const skillSuggestions = (() => {
    const q = skillInput.trim().toLowerCase();
    if (!q) return [];
    const pool = CATEGORY_SKILLS[formData.category] || [];
    return pool
      .filter(s => s.toLowerCase().includes(q) && !formData.skillsRequired.includes(s))
      .slice(0, 8);
  })();

  const [errors, setErrors] = useState({});
  const todayDate = new Date().toISOString().split('T')[0];
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    if (!error) return undefined;
    const timer = window.setTimeout(() => setError(''), 4500);
    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

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
      <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
        <div className="bg-surface rounded-xl shadow-sm border border-error/30 p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-error mb-2">Something went wrong</h2>
          <p className="text-muted mb-4">
            {componentError.message || 'An error occurred while loading the page.'}
          </p>
          <button
            onClick={() => {
              setComponentError(null);
              window.location.reload();
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-deep-blue"
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
      const rawCategory = String(categoryInput || formData.category || '').trim();
      const resolvedCategory = resolveCategoryValue(rawCategory);
      const categoryForGeneration = resolvedCategory || (rawCategory ? 'other' : '');

      const missingFields = [];
      if (!formData.title?.trim()) missingFields.push('Job Title');
      if (!categoryForGeneration) missingFields.push('Category');
      if (!formData.jobRole?.trim()) missingFields.push('Job Role');
      if (!formData.employmentType) missingFields.push('Employment Type');
      if (!formData.skillsRequired?.length) missingFields.push('Required Skills');
      if (!formData.salaryAmount || Number(formData.salaryAmount) <= 0)
        missingFields.push('Salary Amount');

      const hasAddressData = Boolean(
        formData.location?.fullAddress?.trim() ||
        formData.location?.district?.trim() ||
        formData.location?.province?.trim()
      );
      if (!hasAddressData) missingFields.push('Location (district/province or map address)');

      if (missingFields.length > 0) {
        setError(
          `Details are not enough to generate a good description. Please provide: ${missingFields.join(', ')}.`
        );
        scrollToTop();
        return;
      }

      const result = await generateJobDescription({
        title: formData.title,
        category: categoryForGeneration,
        jobRole: formData.jobRole,
        employmentType: formData.employmentType,
        salaryType: formData.salaryType,
        salaryAmount: formData.salaryAmount,
        skillsRequired: formData.skillsRequired,
        experienceRequired: formData.experienceRequired,
        positions: formData.positions,
        location: formData.location,
      });

      const generatedDescription = toFormattedHtml(result?.description || '');
      setFormData(prev => ({ ...prev, description: generatedDescription }));
      const usedTemplate = result?.source === 'template';
      setGenerationMessage(
        usedTemplate
          ? `Description generated using template fallback${result?.reason ? ` (${result.reason})` : ''}.`
          : 'Description generated using AI.'
      );
    } catch (err) {
      setError(err.message || 'Failed to generate description.');
      scrollToTop();
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

    if (formData.startDate && formData.startDate < todayDate) {
      newErrors.startDate = 'Start date cannot be in the past';
    }

    if (formData.endDate && formData.endDate < todayDate) {
      newErrors.endDate = 'End date cannot be in the past';
    }

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be the same day or after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      scrollToTop();
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

      const rawCategory = String(categoryInput || formData.category || '').trim();
      const resolvedCategory = resolveCategoryValue(rawCategory);
      if (rawCategory) {
        cleanedFormData.category = resolvedCategory || 'other';
        if (!resolvedCategory) {
          cleanedFormData.categoryLabel = rawCategory;
        }
      }

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
      setToast({ type: 'success', message: 'Job created successfully.' });
      window.setTimeout(() => navigate('/employer/my-jobs'), 800);
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message || 'Failed to create job. Please try again.',
      });
      scrollToTop();
    } finally {
      setLoading(false);
    }
  };

  return (
    <DottedBackground>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            {t('employer.create_form.title')}
          </h1>
          <p className="text-muted">{t('employer.create_form.subtitle')}</p>
        </div>

        {error && (
          <div className="fixed left-4 bottom-4 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-auto">
            <div className="bg-error text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-2">
              <FaTimes className="w-4 h-4 mt-0.5" />
              <span className="text-sm leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed left-4 bottom-4 z-[60] max-w-sm w-[calc(100%-2rem)] sm:w-auto">
            <div
              className={`px-4 py-3 rounded-lg shadow-lg flex items-start gap-2 text-white ${
                toast.type === 'success' ? 'bg-success' : 'bg-error'
              }`}
            >
              <FaTimes className="w-4 h-4 mt-0.5" />
              <span className="text-sm leading-relaxed">{toast.message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
              <FaBriefcase className="w-5 h-5 mr-2 text-primary" />
              {t('employer.create_form.section_basic')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.title ? 'border-error' : 'border-border'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                  placeholder="e.g., Senior Farm Worker"
                />
                {errors.title && <p className="mt-1 text-sm text-error">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    list="job-categories"
                    value={categoryInput}
                    onChange={e => {
                      const inputValue = e.target.value;
                      const resolvedValue = resolveCategoryValue(inputValue);

                      setCategoryInput(inputValue);
                      setFormData(prev => ({ ...prev, category: resolvedValue || inputValue }));
                      if (errors.category) {
                        setErrors(prev => ({ ...prev, category: '' }));
                      }
                    }}
                    className={`w-full px-4 py-2 border ${errors.category ? 'border-error' : 'border-border'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    placeholder="Type or select category"
                  />
                  <datalist id="job-categories">
                    {JOB_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.label}>
                        {cat.label}
                      </option>
                    ))}
                  </datalist>
                  {errors.category && <p className="mt-1 text-sm text-error">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Job Role</label>
                  <input
                    type="text"
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleChange}
                    list="job-roles"
                    className={`w-full px-4 py-2 border ${errors.jobRole ? 'border-error' : 'border-border'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    placeholder="e.g., Farm Supervisor"
                  />
                  <datalist id="job-roles">
                    {COMMON_JOB_ROLES.map(role => (
                      <option key={role} value={role} />
                    ))}
                  </datalist>
                  {errors.jobRole && <p className="mt-1 text-sm text-error">{errors.jobRole}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.employmentType ? 'border-error' : 'border-border'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                >
                  <option value="">Select employment type</option>
                  {EMPLOYMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.employmentType && (
                  <p className="mt-1 text-sm text-error">{errors.employmentType}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
              <FaMapMarkerAlt className="w-5 h-5 mr-2 text-primary" />
              {t('employer.create_form.section_location')}
            </h2>

            {/* Location Type Toggle */}
            <div className="mb-4 p-4 bg-surface-muted rounded-lg">
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={!useMapLocation}
                    onChange={() => setUseMapLocation(false)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-muted">Manual Entry</span>
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
                    className={`text-sm font-medium ${googleMapsLoaded ? 'text-muted' : 'text-subtle'} flex items-center`}
                  >
                    <FaMap className="w-4 h-4 mr-1" />
                    Search on Map {!googleMapsLoaded && '(Loading...)'}
                  </span>
                </label>
              </div>
              {useMapLocation && !googleMapsLoaded && (
                <p className="mt-2 text-sm text-secondary">
                  Google Maps is loading. Please wait or use manual entry.
                </p>
              )}
            </div>

            {!useMapLocation ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Village</label>
                  <input
                    type="text"
                    name="location.village"
                    value={formData.location.village}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors['location.village'] ? 'border-error' : 'border-border'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    placeholder="e.g., Maharagama"
                  />
                  {errors['location.village'] && (
                    <p className="mt-1 text-sm text-error">{errors['location.village']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-1">District</label>
                  <input
                    type="text"
                    name="location.district"
                    value={formData.location.district}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors['location.district'] ? 'border-error' : 'border-border'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    placeholder="e.g., Colombo"
                  />
                  {errors['location.district'] && (
                    <p className="mt-1 text-sm text-error">{errors['location.district']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Province</label>
                  <select
                    name="location.province"
                    value={formData.location.province}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors['location.province'] ? 'border-error' : 'border-border'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                  >
                    <option value="">Select province</option>
                    {PROVINCES.map(prov => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                  {errors['location.province'] && (
                    <p className="mt-1 text-sm text-error">{errors['location.province']}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Search Location</label>
                <PlacesAutocomplete
                  onSelect={handlePlaceSelect}
                  error={errors.location}
                  googleMapsLoaded={googleMapsLoaded}
                />
                {formData.location.fullAddress && (
                  <div className="mt-2 p-3 bg-primary/10 text-primary rounded-lg text-sm">
                    <strong>Selected:</strong> {formData.location.fullAddress}
                  </div>
                )}
                {errors.location && <p className="mt-1 text-sm text-error">{errors.location}</p>}
                <p className="mt-2 text-sm text-subtle">
                  Search and select a location from the dropdown
                </p>
              </div>
            )}
          </div>

          {/* Salary */}
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
              <FaDollarSign className="w-5 h-5 mr-2 text-primary" />
              {t('employer.create_form.section_salary')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">
                  Salary Amount (LKR)
                </label>
                <input
                  type="number"
                  name="salaryAmount"
                  value={formData.salaryAmount}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${errors.salaryAmount ? 'border-error' : 'border-border'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                  placeholder="e.g., 1500"
                  min="0"
                />
                {errors.salaryAmount && (
                  <p className="mt-1 text-sm text-error">{errors.salaryAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Salary Type</label>
                <select
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
              <FaUsers className="w-5 h-5 mr-2 text-info" />
              {t('employer.create_form.section_requirements')}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">
                    Number of Positions
                  </label>
                  <input
                    type="number"
                    name="positions"
                    value={formData.positions}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${errors.positions ? 'border-error' : 'border-border'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    min="1"
                    max="100"
                  />
                  {errors.positions && (
                    <p className="mt-1 text-sm text-error">{errors.positions}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted mb-1">
                    Experience Level
                  </label>
                  <select
                    name="experienceRequired"
                    value={formData.experienceRequired}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
                <label className="block text-sm font-medium text-muted mb-1">Required Skills</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => {
                        setSkillInput(e.target.value);
                        setSkillDropdownOpen(true);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                          setSkillDropdownOpen(false);
                        }
                        if (e.key === 'Escape') setSkillDropdownOpen(false);
                      }}
                      onFocus={() => setSkillDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setSkillDropdownOpen(false), 150)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder={
                        formData.category
                          ? 'Type to search or add a skill…'
                          : 'e.g., Communication, Teamwork'
                      }
                    />
                    {skillDropdownOpen && skillSuggestions.length > 0 && (
                      <ul className="absolute z-20 left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {skillSuggestions.map((s, i) => (
                          <li
                            key={i}
                            onMouseDown={() => {
                              handleAddSuggestedSkill(s);
                              setSkillInput('');
                              setSkillDropdownOpen(false);
                            }}
                            className="px-4 py-2 text-sm text-muted hover:bg-info/10 cursor-pointer"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddSkill();
                      setSkillDropdownOpen(false);
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-deep-blue transition-colors flex items-center"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                </div>
                {/* Suggested skills for selected category */}
                {Array.isArray(CATEGORY_SKILLS[formData.category]) &&
                  CATEGORY_SKILLS[formData.category].length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-muted">Suggested skills</div>
                        <button
                          type="button"
                          onClick={handleAddAllSuggested}
                          className="text-sm text-info hover:underline"
                        >
                          Add all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_SKILLS[formData.category].map((sug, i) => {
                          const already = formData.skillsRequired.includes(sug);
                          const btnClass = already
                            ? 'inline-flex items-center px-3 py-1 bg-neutral-100 text-subtle rounded-full text-sm opacity-70 cursor-not-allowed'
                            : 'inline-flex items-center px-3 py-1 bg-info/10 text-info rounded-full text-sm hover:bg-info/20';
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleAddSuggestedSkill(sug)}
                              disabled={already}
                              className={btnClass}
                            >
                              {sug}
                              {!already && <span className="ml-2 text-xs">+</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {formData.skillsRequired.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skillsRequired.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-success/10 text-success rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 text-success hover:text-deep-blue"
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
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
              <FaCalendar className="w-5 h-5 mr-2 text-info" />
              {t('employer.create_form.section_duration')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={todayDate}
                  className={`w-full px-4 py-2 border ${errors.startDate ? 'border-error' : 'border-border'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-error">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={
                    formData.startDate && formData.startDate > todayDate
                      ? formData.startDate
                      : todayDate
                  }
                  className={`w-full px-4 py-2 border ${errors.endDate ? 'border-error' : 'border-border'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-error">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-dark">
                {t('employer.create_form.section_description')}
              </h2>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDescription}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-deep-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGeneratingDescription ? 'Generating...' : 'Generate Description'}
              </button>
            </div>

            <p className="text-sm text-muted mb-3">
              Use the details above, then generate and edit the description before creating the job.
            </p>

            <div className="mb-3 p-3 bg-info/10 border border-info/30 rounded-lg">
              <p className="text-sm text-info font-medium mb-1">
                Required fields for auto-generate:
              </p>
              <p className="text-sm text-muted">
                Job Title, Category, Job Role, Employment Type, Salary Amount, Required Skills, and
                Location (district/province or map address).
              </p>
            </div>

            {generationMessage && (
              <div className="mb-3 p-3 bg-success/10 text-success border border-success/30 rounded-lg text-sm">
                {generationMessage}
              </div>
            )}

            <div
              className={`border ${errors.description ? 'border-error' : 'border-border'} rounded-lg overflow-hidden bg-surface`}
            >
              <div className="border-b border-border bg-surface-muted px-3 py-2">
                <div className="flex flex-wrap gap-1 items-center">
                  <div className="flex gap-1 border-r border-border pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={`px-2 py-1.5 text-sm font-bold rounded hover:bg-neutral-200 transition-colors ${editor?.isActive('bold') ? 'bg-neutral-300' : ''}`}
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={`px-2 py-1.5 text-sm italic rounded hover:bg-neutral-200 transition-colors ${editor?.isActive('italic') ? 'bg-neutral-300' : ''}`}
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleUnderline().run()}
                      className={`px-2 py-1.5 text-sm underline rounded hover:bg-neutral-200 transition-colors ${editor?.isActive('underline') ? 'bg-neutral-300' : ''}`}
                      title="Underline"
                    >
                      U
                    </button>
                  </div>

                  <div className="flex gap-1 border-r border-border pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-neutral-200 transition-colors ${editor?.isActive('heading', { level: 1 }) ? 'bg-neutral-300' : ''}`}
                      title="Heading 1"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-neutral-200 transition-colors ${editor?.isActive('heading', { level: 2 }) ? 'bg-neutral-300' : ''}`}
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-neutral-200 transition-colors ${editor?.isActive('heading', { level: 3 }) ? 'bg-neutral-300' : ''}`}
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().setParagraph().run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-neutral-200 transition-colors ${editor?.isActive('paragraph') ? 'bg-neutral-300' : ''}`}
                      title="Paragraph"
                    >
                      P
                    </button>
                  </div>

                  <div className="flex gap-1 border-r border-border pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-neutral-200 transition-colors ${editor?.isActive({ textAlign: 'left' }) ? 'bg-neutral-300' : ''}`}
                      title="Align Left"
                    >
                      Left
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-neutral-200 transition-colors ${editor?.isActive({ textAlign: 'center' }) ? 'bg-neutral-300' : ''}`}
                      title="Align Center"
                    >
                      Center
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-neutral-200 transition-colors ${editor?.isActive({ textAlign: 'right' }) ? 'bg-neutral-300' : ''}`}
                      title="Align Right"
                    >
                      Right
                    </button>
                  </div>

                  <div className="flex gap-1 border-r border-border pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-neutral-200 transition-colors ${editor?.isActive('bulletList') ? 'bg-neutral-300' : ''}`}
                      title="Bullet List"
                    >
                      UL
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                      className={`px-2 py-1.5 text-xs rounded hover:bg-neutral-200 transition-colors ${editor?.isActive('orderedList') ? 'bg-neutral-300' : ''}`}
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
                      className="px-2 py-1.5 text-xs rounded hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Undo"
                    >
                      Undo
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().redo().run()}
                      disabled={!editor?.can().redo()}
                      className="px-2 py-1.5 text-xs rounded hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Redo"
                    >
                      Redo
                    </button>
                  </div>
                </div>
              </div>

              <div className="min-h-[220px]">
                <EditorContent editor={editor} />
              </div>
            </div>

            <div className="flex justify-between items-center mt-2">
              {errors.description ? (
                <p className="text-sm text-error">{errors.description}</p>
              ) : (
                <p className="text-sm text-subtle">
                  {charCount > 0 && charCount < 20
                    ? `Minimum ${20 - charCount} more characters recommended`
                    : charCount >= 20
                      ? 'Use formatting tools to make your description stand out'
                      : 'Description is optional'}
                </p>
              )}
              <p className="text-xs text-subtle">{charCount} characters</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link
              to="/employer/dashboard"
              className="px-6 py-2 border border-border text-muted rounded-lg hover:bg-surface-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-deep-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
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
