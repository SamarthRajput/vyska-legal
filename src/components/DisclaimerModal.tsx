'use client'
import { useEffect, useRef, useState } from 'react';

export default function DisclaimerModal() {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // add refs for focus management
  const modalRef = useRef<HTMLDivElement | null>(null);
  const acceptButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const checkConsent = async () => {
      const hasConsented = localStorage.getItem('disclaimerConsent');
      const cookieConsent = document.cookie.includes('consent=accepted');

      if (hasConsented === 'accepted' || cookieConsent) {
        setShowModal(false);
        return;
      }

      try {
        const response = await fetch('/api/check-consent');
        const data = await response.json();

        if (data.hasConsented) {
          localStorage.setItem('disclaimerConsent', 'accepted');
          document.cookie = `consent=accepted; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
          setShowModal(false);
        } else {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error checking consent:', error);
        setShowModal(true);
      }
    };

    checkConsent();
  }, []);

  // --- NEW: ensure mobile viewport meta exists so mobile browsers don't auto-zoom ---
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1';
      document.head.appendChild(meta);
    } else {
      // ensure it contains width=device-width; keep other parts if present
      if (!/width=device-width/.test(meta.content)) {
        meta.content = 'width=device-width, initial-scale=1';
      }
    }
  }, []);
  // --- end new effect ---

  // manage focus trapping, keyboard (Escape) and body scroll when modal open
  useEffect(() => {
    if (!showModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // focus the primary action
    setTimeout(() => acceptButtonRef.current?.focus(), 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDeny();
      } else if (e.key === 'Tab') {
        // simple focus trap
        const container = modalRef.current;
        if (!container) return;
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => !el.hasAttribute('disabled'));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [showModal]);

  const handleAccept = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent: true,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        localStorage.setItem('disclaimerConsent', 'accepted');
        document.cookie = `consent=accepted; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        setShowModal(false);
      } else {
        throw new Error('Failed to save consent');
      }
    } catch (error) {
      console.error('Error saving consent:', error);
      alert('Failed to submit consent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeny = () => {
    localStorage.setItem('disclaimerConsent', 'denied');
    window.history.back();
  };

  if (!showModal) return null;

  return (
    <div
      // responsive: bottom-sheet on small, centered on larger screens
      // add horizontal padding on mobile (px-4) so modal never touches edges,
      // hide horizontal overflow to prevent scrolling caused by shadows/borders
      className="fixed inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 flex items-end sm:items-center justify-center z-50 px-4 sm:p-4 overflow-x-hidden animate-in fade-in duration-300"
      aria-hidden={false}
    >
      <div
        // role + aria for accessibility; ref for focus trap
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
        // ensure modal fills available width within backdrop padding (w-full),
        // but cap to a mobile-friendly max (420px) and keep desktop max width
        // prevent horizontal overflow while allowing vertical scrolling
        // added min-w-0 to avoid flex children forcing an overflow on small screens
        className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-[420px] sm:max-w-lg mx-auto box-border min-w-0 max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 sm:p-8 border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-300"
      >
        {/* small-screen close button */}
        <div className="flex items-start justify-between mb-2">
          <div className="w-0" />
          <button
            onClick={handleDeny}
            aria-label="Close disclaimer"
            className="sm:hidden text-gray-500 dark:text-gray-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        </div>

        <h2 id="disclaimer-title" className="text-2xl sm:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Welcome to Vyska Legal
        </h2>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          Before you continue, please review and accept our terms to access the website.
        </p>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-6">
          By clicking &quot;Accept & Continue&quot;, you agree to our{' '}
          <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            ref={acceptButtonRef}
            onClick={handleAccept}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Accept & Continue
              </>
            )}
          </button>
          <button
            onClick={handleDeny}
            disabled={isSubmitting}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold px-6 py-3 rounded-lg shadow hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
