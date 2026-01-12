'use client'
import { useEffect, useRef, useState } from 'react';
import { useConsent } from '@/hooks/useConsent';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DisclaimerModal() {
  const { hasConsented, isLoading, saveConsent, denyConsent } = useConsent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname();
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Don't show modal on Privacy or Terms pages
  const isExemptPage = pathname === '/privacy' || pathname === '/terms' || pathname === '/tos';

  // Lock body scroll logic
  useEffect(() => {
    if (hasConsented || isLoading || isExemptPage) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [hasConsented, isLoading, isExemptPage]);

  if (hasConsented || isLoading || isExemptPage) return null;

  const handleAccept = async () => {
    setIsSubmitting(true);
    const success = await saveConsent();
    if (!success) {
      alert('Failed to submit consent. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
          ref={modalRef}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Vyska Legal Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Disclaimer
                </h2>
                <p className="text-xs text-slate-500 font-medium">Vyska Legal</p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed bg-slate-50/30 dark:bg-slate-900/30">
            <p className="font-semibold text-slate-900 dark:text-white">
              The rules of the Bar Council of India prohibit law firms from soliciting work or advertising in any manner. By clicking on {`"I AGREE"`}, the user acknowledges that:
            </p>
            <ul className="list-disc pl-5 space-y-2 marker:text-blue-500">
              <li>
                The user wishes to gain more information about Us for his/her/their own information and use.
              </li>
              <li>
                There has been no advertisement, personal communication, solicitation, invitation or inducement of any sort whatsoever from Us or any of our members to solicit any work through this website.
              </li>
              <li>
                The information about Us is provided to the user only on his/her/their specific request and any information obtained or downloaded from this website is completely at the user’s volition and any transmission, receipt or use of this site would not create any lawyer-client relationship.
              </li>
              <li>
                The information provided under this website is solely available at your request for informational purposes only, should not be interpreted as soliciting or advertisement.
              </li>
              <li>
                We are not liable for any consequence of any action taken by the user relying on material / information provided under this website. In cases where the user has any legal issues, he/she in all cases must seek independent legal advice.
              </li>
            </ul>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-xs text-amber-800 dark:text-amber-200 mt-2">
              <strong>Note:</strong> This website is a resource for information purposes only. Vyska Legal is not intended to be a source of advertising or solicitation.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-4 justify-between items-center text-sm">

            {/* Secondary Links */}
            <div className="flex gap-4 font-medium text-slate-500 dark:text-slate-400 order-2 sm:order-1">
              <Link href="/terms" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition" target="_blank">
                <FileText className="w-4 h-4" /> Terms
              </Link>
              <Link href="/privacy" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition" target="_blank">
                <Lock className="w-4 h-4" /> Privacy
              </Link>
            </div>

            {/* Primary Buttons */}
            <div className="flex w-full sm:w-auto gap-3 order-1 sm:order-2">
              <button
                onClick={denyConsent}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  "I AGREE"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
