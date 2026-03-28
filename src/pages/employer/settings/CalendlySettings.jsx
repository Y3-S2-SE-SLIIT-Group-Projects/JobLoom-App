import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyProfile } from '../../../store/slices/userSlice';
import api from '../../../services/api';
import DottedBackground from '../../../components/DottedBackground';
import Spinner from '../../../components/ui/Spinner';
import AlertBanner from '../../../components/ui/AlertBanner';

const CALENDLY_CLIENT_ID = import.meta.env.VITE_CALENDLY_CLIENT_ID;
const CODE_VERIFIER_KEY = 'calendly_pkce_code_verifier';

const base64UrlEncode = buffer => {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
};

const generateCodeChallenge = async verifier => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
};

const buildCalendlyAuthUrl = async () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  sessionStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);

  const params = new URLSearchParams({
    client_id: CALENDLY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: `${window.location.origin}/auth/calendly/callback`,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `https://auth.calendly.com/oauth/authorize?${params.toString()}`;
};

const CalendlySettings = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.user?.currentUser);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [schedulingUrl, setSchedulingUrl] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Manual URL state
  const [manualUrl, setManualUrl] = useState('');
  const [savingUrl, setSavingUrl] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/calendly/status');
      const info = data.data;
      setConnected(info.connected);
      setSchedulingUrl(info.schedulingUrl || '');
      setAccountEmail(info.accountEmail || '');
    } catch {
      setError('Failed to load Calendly status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const refreshProfile = () => dispatch(getMyProfile());

  const handleConnect = async () => {
    const url = await buildCalendlyAuthUrl();
    window.location.href = url;
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      await api.delete('/calendly/disconnect');
      setConnected(false);
      setSchedulingUrl('');
      setSuccessMsg('Calendly disconnected successfully.');
      refreshProfile();
    } catch {
      setError('Failed to disconnect Calendly.');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSaveManualUrl = async e => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!manualUrl.trim()) return;

    try {
      setSavingUrl(true);
      const { data } = await api.put('/calendly/url', { url: manualUrl.trim() });
      setSchedulingUrl(data.data.schedulingUrl);
      setConnected(true);
      setManualUrl('');
      setSuccessMsg('Calendly URL saved successfully.');
      refreshProfile();
    } catch (err) {
      setError(err.message || 'Failed to save Calendly URL.');
    } finally {
      setSavingUrl(false);
    }
  };

  if (loading) {
    return (
      <DottedBackground>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Spinner size="lg" />
        </div>
      </DottedBackground>
    );
  }

  return (
    <DottedBackground>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-text-dark mb-2">Calendly Integration</h1>
        <p className="text-muted mb-8">
          Connect your Calendly account to let candidates book interview slots directly.
        </p>

        {error && <AlertBanner type="error" message={error} onDismiss={() => setError('')} />}
        {successMsg && (
          <AlertBanner type="success" message={successMsg} onDismiss={() => setSuccessMsg('')} />
        )}

        {/* Connection status card */}
        <div className="bg-surface rounded-2xl shadow-sm border border-neutral-100 p-8 mt-4">
          {connected ? (
            <>
              {accountEmail && (
                <p className="text-sm text-subtle mb-4">
                  Linked to <span className="font-medium text-muted">{accountEmail}</span>
                  {currentUser?.email && accountEmail !== currentUser.email && (
                    <span className="block mt-1 text-secondary text-xs">
                      Session mismatch: You are logged in as {currentUser.email}. Log out and log
                      back in to fix.
                    </span>
                  )}
                </p>
              )}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-success"
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
                <div>
                  <h2 className="text-lg font-semibold text-text-dark">Connected</h2>
                  <p className="text-sm text-muted">Your Calendly account is linked.</p>
                </div>
              </div>

              {schedulingUrl && (
                <div className="bg-surface-muted rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted mb-1">Scheduling URL</p>
                  <a
                    href={schedulingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline break-all"
                  >
                    {schedulingUrl}
                  </a>
                  <p className="text-xs text-subtle mt-2">
                    If this isn&apos;t your Calendly link, disconnect and reconnect with the correct
                    Calendly account.
                  </p>
                </div>
              )}

              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="px-6 py-2.5 border border-error text-error rounded-xl font-medium hover:bg-error/10 transition-colors disabled:opacity-50"
              >
                {disconnecting ? 'Disconnecting...' : 'Disconnect Calendly'}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-subtle"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-dark">Not Connected</h2>
                  <p className="text-sm text-muted">
                    Link your Calendly to enable interview scheduling.
                  </p>
                </div>
              </div>

              <button
                onClick={handleConnect}
                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-deep-blue transition-colors"
              >
                Connect Calendly
              </button>
            </>
          )}
        </div>

        {/* Manual URL entry card */}
        <div className="bg-surface rounded-2xl shadow-sm border border-neutral-100 p-8 mt-6">
          <h2 className="text-lg font-semibold text-text-dark mb-1">
            {connected ? 'Update Scheduling URL' : 'Or paste your Calendly link'}
          </h2>
          <p className="text-sm text-muted mb-4">
            Enter your Calendly scheduling URL directly if you prefer not to use OAuth.
          </p>

          <form onSubmit={handleSaveManualUrl} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={manualUrl}
              onChange={e => setManualUrl(e.target.value)}
              placeholder="https://calendly.com/your-name"
              className="flex-1 px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
            />
            <button
              type="submit"
              disabled={savingUrl || !manualUrl.trim()}
              className="px-6 py-2.5 bg-deep-blue text-white rounded-xl font-medium hover:bg-deep-blue transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {savingUrl ? 'Saving...' : 'Save URL'}
            </button>
          </form>
        </div>
      </div>
    </DottedBackground>
  );
};

export default CalendlySettings;
