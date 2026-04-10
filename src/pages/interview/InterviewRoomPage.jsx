import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadInterviewJoinContext,
  selectInterviewJoinContext,
  selectApplicationLoading,
  selectApplicationError,
} from '../../store/slices/applicationSlice';
import { useUser } from '../../hooks/useUser';
import { useTranslation } from 'react-i18next';
import DottedBackground from '../../components/DottedBackground';
import AlertBanner from '../../components/ui/AlertBanner';
import Spinner from '../../components/ui/Spinner';
import { FaArrowLeft, FaVideo, FaSignOutAlt } from 'react-icons/fa';

const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';

const InterviewRoomPage = () => {
  const { applicationId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { t, i18n } = useTranslation();

  const formatInterviewWhen = value => {
    if (!value) return '';
    const lang = i18n.language?.startsWith('si')
      ? 'si-LK'
      : i18n.language?.startsWith('ta')
        ? 'ta-LK'
        : 'en-US';
    return new Date(value).toLocaleString(lang, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const context = useSelector(selectInterviewJoinContext);
  const loading = useSelector(selectApplicationLoading('interviewJoinContext'));
  const loadError = useSelector(selectApplicationError('interviewJoinContext'));

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const handleLeaveRef = useRef(() => {});
  const [jitsiReady, setJitsiReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.JitsiMeetExternalAPI)
  );
  const [scriptFailed, setScriptFailed] = useState(false);

  const backPath =
    applicationId && currentUser?.role === 'employer'
      ? `/employer/applications/${applicationId}`
      : applicationId
        ? `/my-applications/${applicationId}`
        : '/';

  const handleLeave = useCallback(() => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
      } catch {
        /* ignore */
      }
      jitsiApiRef.current = null;
    }
    if (!applicationId) {
      navigate('/', { replace: true });
      return;
    }
    const path =
      context?.role === 'employer'
        ? `/employer/applications/${applicationId}`
        : `/my-applications/${applicationId}`;
    navigate(path, { replace: false });
  }, [applicationId, context?.role, navigate]);

  useEffect(() => {
    handleLeaveRef.current = handleLeave;
  }, [handleLeave]);

  useEffect(() => {
    if (applicationId) dispatch(loadInterviewJoinContext(applicationId));
  }, [dispatch, applicationId]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.JitsiMeetExternalAPI) {
      const t = window.setTimeout(() => setJitsiReady(true), 0);
      return () => window.clearTimeout(t);
    }

    const script = document.createElement('script');
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    script.onload = () => setJitsiReady(true);
    script.onerror = () => setScriptFailed(true);
    document.head.appendChild(script);

    return undefined;
  }, []);

  useEffect(() => {
    if (!jitsiReady || scriptFailed || !context?.roomName || !jitsiContainerRef.current) {
      return undefined;
    }
    if (jitsiApiRef.current) return undefined;

    const domain = (context.domain || JITSI_DOMAIN).replace(/^https?:\/\//, '').split('/')[0];

    const api = new window.JitsiMeetExternalAPI(domain, {
      roomName: context.roomName,
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: '100%',
      userInfo: {
        displayName: context.displayName || 'Participant',
      },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        prejoinPageEnabled: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'desktop',
          'chat',
          'raisehand',
          'tileview',
          'hangup',
        ],
      },
    });

    api.addEventListener('readyToClose', () => {
      handleLeaveRef.current();
    });

    jitsiApiRef.current = api;

    return () => {
      try {
        api.dispose();
      } catch {
        /* ignore */
      }
      jitsiApiRef.current = null;
    };
  }, [jitsiReady, scriptFailed, context?.roomName, context?.domain, context?.displayName]);

  if (loading) {
    return (
      <DottedBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-muted">{t('applications.interview_preparing_room')}</p>
          </div>
        </div>
      </DottedBackground>
    );
  }

  if (loadError) {
    return (
      <DottedBackground>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="max-w-md mx-auto text-center">
            <AlertBanner type="error" message={loadError} />
            <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:justify-center">
              <Link
                to={backPath}
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <FaArrowLeft className="w-3.5 h-3.5" aria-hidden />
                {t('applications.interview_back_to_application')}
              </Link>
              <Link to="/" className="text-sm text-subtle hover:text-primary hover:underline">
                {t('navbar.home')}
              </Link>
            </div>
          </div>
        </div>
      </DottedBackground>
    );
  }

  if (!context?.roomName) {
    return (
      <DottedBackground>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="max-w-md mx-auto text-center">
            <AlertBanner type="error" message={t('applications.interview_room_missing')} />
            <Link
              to={backPath}
              className="inline-flex items-center justify-center gap-2 mt-6 text-sm font-medium text-primary hover:underline"
            >
              <FaArrowLeft className="w-3.5 h-3.5" aria-hidden />
              {t('applications.interview_back_to_application')}
            </Link>
          </div>
        </div>
      </DottedBackground>
    );
  }

  if (scriptFailed) {
    return (
      <DottedBackground>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="max-w-md mx-auto text-center">
            <AlertBanner
              type="error"
              message={t('applications.interview_jitsi_load_failed', { domain: JITSI_DOMAIN })}
            />
            <Link
              to={backPath}
              className="inline-flex items-center justify-center gap-2 mt-6 text-sm font-medium text-primary hover:underline"
            >
              <FaArrowLeft className="w-3.5 h-3.5" aria-hidden />
              {t('applications.interview_back_to_application')}
            </Link>
          </div>
        </div>
      </DottedBackground>
    );
  }

  if (!jitsiReady) {
    return (
      <DottedBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-muted">{t('applications.interview_loading_video')}</p>
          </div>
        </div>
      </DottedBackground>
    );
  }

  const durationPart =
    context.interviewDuration != null
      ? t('applications.interview_duration_minutes', { count: context.interviewDuration })
      : '';
  const subtitle = [formatInterviewWhen(context.interviewDate), durationPart]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex flex-col h-[100dvh] bg-neutral-900 text-white">
      <header className="flex flex-col gap-2 px-4 py-3 border-b shrink-0 border-neutral-700 bg-neutral-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 min-w-0 sm:flex-row sm:items-center sm:gap-4">
          <Link
            to={backPath}
            className="inline-flex items-center self-start gap-2 text-xs transition-colors sm:text-sm text-neutral-300 hover:text-white"
          >
            <FaArrowLeft className="w-3.5 h-3.5 shrink-0" aria-hidden />
            {t('applications.interview_back_to_application')}
          </Link>
          <div className="flex items-start gap-3 min-w-0">
            <FaVideo className="w-4 h-4 mt-0.5 text-sky-400 shrink-0" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {t('applications.interview_for_job', {
                  title: context.jobTitle || t('applications.interview_job_fallback'),
                })}
              </p>
              {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLeave}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm text-white transition-colors rounded-lg sm:self-center bg-error/80 hover:bg-error shrink-0"
        >
          <FaSignOutAlt className="w-3.5 h-3.5" aria-hidden />
          {t('applications.interview_leave_button')}
        </button>
      </header>

      <div
        ref={jitsiContainerRef}
        data-testid="jitsi-container"
        className="flex-1 min-h-0 w-full"
      />
    </div>
  );
};

export default InterviewRoomPage;
