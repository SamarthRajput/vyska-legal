import React from 'react';
import { Share2, Facebook, Twitter, Linkedin, Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  title: string;
  url: string;
  excerpt?: string;
  orientation?: 'horizontal' | 'vertical';
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url, excerpt, orientation = 'horizontal' }) => {
  const shareData = {
    title,
    text: excerpt || title,
    url,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch { }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
  };

  return (
    <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-wrap'} items-center gap-2 sm:gap-3`}>
      {orientation === 'horizontal' && <span className={`text-sm font-medium text-slate-600`}>Share:</span>}
      <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-wrap'} items-center gap-2`}>
        <button
          onClick={handleNativeShare}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 focus:outline-none focus:ring transition-colors"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
        </a>
        <a
          href={shareUrls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-600 hover:text-sky-800 focus:outline-none focus:ring transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
        </a>
        <a
          href={shareUrls.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-900 focus:outline-none focus:ring transition-colors"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </a>
        <a
          href={shareUrls.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-800 focus:outline-none focus:ring transition-colors"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </a>
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 focus:outline-none focus:ring transition-colors"
          aria-label="Copy link"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
      {orientation === 'vertical' && (
        <span className={`text-sm font-medium text-slate-600 ${orientation === 'vertical' ? '[writing-mode:vertical-rl] mb-2 hidden md:block rotate-180' : ''}`}>Share:</span>
      )}
    </div>
  );
};

export default ShareButtons;
