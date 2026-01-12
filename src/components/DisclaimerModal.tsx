'use client'
import { useEffect, useRef, useState } from 'react';
import { useConsent } from '@/hooks/useConsent';
import { toast } from 'sonner';

export default function DisclaimerModal() {
  const { hasConsented, isLoading, saveConsent, denyConsent } = useConsent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const acceptButtonRef = useRef<HTMLButtonElement | null>(null);

  // Focus trap and keyboard management
  useEffect(() => {
    if (hasConsented || isLoading) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setTimeout(() => acceptButtonRef.current?.focus(), 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        denyConsent();
      } else if (e.key === 'Tab') {
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
  }, [hasConsented, isLoading, denyConsent]);

  const handleAccept = async () => {
    setIsSubmitting(true);
    const success = await saveConsent();
    if (!success) {
      toast.error('Failed to submit consent. Please try again.');
    }
    setIsSubmitting(false);
  };

  if (hasConsented || isLoading) return null;

  return (
    <div
      // Mobile: full screen with safe area, Tablet+: centered overlay
      className="fixed inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 
                 flex items-end sm:items-center justify-center z-50 
                 p-0 sm:p-4 md:p-6 lg:p-8
                 overflow-x-hidden overflow-y-auto
                 animate-in fade-in duration-300"
      aria-hidden={false}
      onClick={(e) => {
        if (e.target === e.currentTarget && window.innerWidth >= 640) {
          denyConsent();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
        // Responsive width: full on mobile, constrained on larger screens
        // Mobile: bottom sheet, Tablet+: centered card
        className="bg-white dark:bg-gray-900 
                   w-full sm:w-[90vw] md:w-[600px] lg:w-[650px] xl:w-[700px]
                   max-w-full sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-4xl
                   max-h-[90vh] sm:max-h-[85vh] md:max-h-[80vh]
                   overflow-y-auto overflow-x-hidden
                   rounded-t-3xl sm:rounded-2xl md:rounded-3xl
                   shadow-2xl
                   mx-0 sm:mx-auto
                   box-border min-w-0
                   border-t-4 sm:border sm:border-gray-200 dark:sm:border-gray-700
                   border-blue-500 dark:border-blue-400
                   animate-in zoom-in-95 sm:zoom-in-100 duration-300
                   safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content wrapper with responsive padding */}
        <div className="p-5 xs:p-6 sm:p-7 md:p-8 lg:p-10">

          {/* Close button - visible on all screens, positioned better */}
          <div className="flex items-start justify-between mb-3 sm:mb-4 -mt-1">
            <div className="w-0" />
            <button
              onClick={denyConsent}
              aria-label="Close disclaimer"
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200
                         p-2 -mr-2 rounded-lg
                         hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         touch-manipulation"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Icon - responsive sizing */}
          <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 sm:p-4 md:p-5 rounded-full">
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
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

          {/* Title - responsive typography */}
          <h2
            id="disclaimer-title"
            className="text-xl xs:text-2xl sm:text-3xl md:text-4xl 
                       font-bold text-center 
                       mb-3 sm:mb-4 
                       text-gray-900 dark:text-white
                       leading-tight"
          >
            Welcome to Vyska Legal
          </h2>

          {/* Description - responsive text size and spacing */}
          <p className="text-center text-sm sm:text-base md:text-lg
                        text-gray-600 dark:text-gray-300 
                        mb-3 sm:mb-4 
                        leading-relaxed
                        px-2 sm:px-0">
            Before you continue, please review and accept our terms to access the website.
          </p>

          {/* Terms link - responsive text */}
          <p className="text-xs sm:text-sm 
                        text-center 
                        text-gray-500 dark:text-gray-400 
                        mb-5 sm:mb-6 md:mb-7
                        leading-relaxed
                        px-1 sm:px-0">
            By clicking &quot;Accept & Continue&quot;, you agree to our{' '}
            <a
              href="/terms"
              className="text-blue-600 dark:text-blue-400 
                         hover:underline hover:text-blue-700 dark:hover:text-blue-300
                         font-medium
                         transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>
            {' '}and{' '}
            <a
              href="/privacy"
              className="text-blue-600 dark:text-blue-400 
                         hover:underline hover:text-blue-700 dark:hover:text-blue-300
                         font-medium
                         transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </p>

          {/* Action buttons - responsive layout and sizing */}
          <div className="flex flex-col-reverse xs:flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              ref={acceptButtonRef}
              onClick={handleAccept}
              disabled={isSubmitting}
              className="flex-1 
                         bg-gradient-to-r from-blue-600 to-blue-700 
                         hover:from-blue-700 hover:to-blue-800
                         active:from-blue-800 active:to-blue-900
                         text-white font-semibold 
                         px-5 sm:px-6 md:px-8
                         py-3 sm:py-3.5 md:py-4
                         text-sm sm:text-base md:text-lg
                         rounded-lg sm:rounded-xl
                         shadow-lg hover:shadow-xl
                         transform hover:scale-[1.02] active:scale-[0.98]
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         flex items-center justify-center gap-2 sm:gap-3
                         touch-manipulation
                         min-h-[44px] sm:min-h-[48px]"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Accept & Continue</span>
                </>
              )}
            </button>

            <button
              onClick={denyConsent}
              disabled={isSubmitting}
              className="flex-1 
                         bg-gray-200 dark:bg-gray-700 
                         hover:bg-gray-300 dark:hover:bg-gray-600
                         active:bg-gray-400 dark:active:bg-gray-500
                         text-gray-700 dark:text-gray-200 font-semibold 
                         px-5 sm:px-6 md:px-8
                         py-3 sm:py-3.5 md:py-4
                         text-sm sm:text-base md:text-lg
                         rounded-lg sm:rounded-xl
                         shadow hover:shadow-md
                         transform hover:scale-[1.02] active:scale-[0.98]
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         flex items-center justify-center gap-2 sm:gap-3
                         touch-manipulation
                         min-h-[44px] sm:min-h-[48px]"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Decline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
