import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../services/api';
import { getMyProfile } from '../../store/slices/userSlice';
import Spinner from '../../components/ui/Spinner';
import DottedBackground from '../../components/DottedBackground';

const CalendlyCallback = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Derive immediate error from URL — no setState in effect
  const immediateError = error
    ? searchParams.get('error_description') || 'Authorization was denied.'
    : !code
      ? 'No authorization code received from Calendly.'
      : null;

  const [status, setStatus] = useState(() => (immediateError ? 'error' : 'loading'));
  const [errorMsg, setErrorMsg] = useState(immediateError || '');
  const exchanged = useRef(false);

  useEffect(() => {
    if (immediateError || !code) return;
    if (exchanged.current) return;
    exchanged.current = true;

    const redirectUri = `${window.location.origin}/auth/calendly/callback`;
    const codeVerifier = sessionStorage.getItem('calendly_pkce_code_verifier');
    sessionStorage.removeItem('calendly_pkce_code_verifier');

    api
      .post('/calendly/connect', { code, redirectUri, codeVerifier })
      .then(async () => {
        setStatus('success');
        await dispatch(getMyProfile())
          .unwrap()
          .catch(() => {}); // Refresh user so calendly.schedulingUrl is in Redux
      })
      .catch(err => {
        setStatus('error');
        setErrorMsg(err.message || 'Failed to connect Calendly.');
      });
  }, [code, immediateError, dispatch]);

  return (
    <DottedBackground>
      <div className="max-w-md mx-auto mt-24 px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <Spinner size="lg" className="mb-4" />
              <h2 className="text-xl font-semibold text-[#2B373F] mb-2">Connecting Calendly...</h2>
              <p className="text-[#516876]">Please wait while we link your account.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#2B373F] mb-2">Calendly Connected!</h2>
              <p className="text-[#516876] mb-6">
                Your Calendly account has been linked. You can now schedule interviews through
                Calendly.
              </p>
              <button
                onClick={() => navigate('/employer/settings/calendly')}
                className="w-full bg-[#6794D1] text-white py-3 rounded-xl font-medium hover:bg-[#5a82b8] transition-colors"
              >
                Go to Calendly Settings
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#2B373F] mb-2">Connection Failed</h2>
              <p className="text-[#516876] mb-6">{errorMsg}</p>
              <button
                onClick={() => navigate('/employer/settings/calendly')}
                className="w-full bg-[#6794D1] text-white py-3 rounded-xl font-medium hover:bg-[#5a82b8] transition-colors"
              >
                Back to Calendly Settings
              </button>
            </>
          )}
        </div>
      </div>
    </DottedBackground>
  );
};

export default CalendlyCallback;
