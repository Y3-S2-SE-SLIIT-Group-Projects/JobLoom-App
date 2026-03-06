import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { FaCalendarAlt } from 'react-icons/fa';

const WIDGET_SCRIPT_URL = 'https://assets.calendly.com/assets/external/widget.js';

const loadCalendlyScript = () =>
  new Promise((resolve, reject) => {
    if (window.Calendly) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${WIDGET_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = WIDGET_SCRIPT_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

/**
 * Renders a button that opens the Calendly popup widget.
 * Reads the employer's schedulingUrl from Redux (currentUser.calendly)
 * first, falling back to a /calendly/status API call.
 *
 * @param {string}  inviteeName  - Candidate full name (pre-filled in Calendly)
 * @param {string}  inviteeEmail - Candidate email (pre-filled in Calendly)
 * @param {string}  className    - Extra CSS classes for the wrapper
 */
const CalendlyPopupButton = ({ inviteeName = '', inviteeEmail = '', className = '' }) => {
  const storeUrl = useSelector(state => state.user?.currentUser?.calendly?.schedulingUrl);
  const [schedulingUrl, setSchedulingUrl] = useState(storeUrl || null);
  const [loading, setLoading] = useState(!storeUrl);
  const [scriptReady, setScriptReady] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    let cancelled = false;

    (async () => {
      try {
        const tasks = [loadCalendlyScript().catch(() => null)]; // Don't fail if script blocked

        if (!storeUrl) {
          tasks.push(
            api.get('/calendly/status').then(({ data }) => {
              if (!cancelled && data.data?.connected) {
                setSchedulingUrl(data.data.schedulingUrl);
              }
            })
          );
        }

        await Promise.all(tasks);
        if (!cancelled) setScriptReady(!!window.Calendly);
      } catch {
        // Calendly not connected — button stays hidden
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storeUrl]);

  useEffect(() => {
    if (storeUrl) setSchedulingUrl(storeUrl);
  }, [storeUrl]);

  const openPopup = useCallback(() => {
    if (!window.Calendly || !schedulingUrl) return;

    window.Calendly.initPopupWidget({
      url: schedulingUrl,
      prefill: {
        name: inviteeName,
        email: inviteeEmail,
      },
    });
  }, [schedulingUrl, inviteeName, inviteeEmail]);

  if (loading) return null;
  if (!schedulingUrl) return null;

  // Popup widget (requires Calendly script)
  if (scriptReady && window.Calendly) {
    return (
      <button
        type="button"
        onClick={openPopup}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-[#006bff] text-white rounded-lg hover:bg-[#0057d1] transition-colors text-sm font-medium ${className}`}
      >
        <FaCalendarAlt className="w-4 h-4" />
        Schedule via Calendly
      </button>
    );
  }

  // Fallback: open scheduling URL in new tab (e.g. when Calendly script is blocked)
  return (
    <a
      href={schedulingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 bg-[#006bff] text-white rounded-lg hover:bg-[#0057d1] transition-colors text-sm font-medium ${className}`}
    >
      <FaCalendarAlt className="w-4 h-4" />
      Schedule via Calendly
    </a>
  );
};

export default CalendlyPopupButton;
