import { useState } from 'react';
import {
  Download,
  Share2,
  ScrollText,
  FileCode,
  File,
  Copy,
  Check,
  AtSign,
  Facebook,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToastStore } from '@/store/toastStore';
import { useI18n } from '@/store/i18nStore';

interface ExportShareProps {
  type: 'resume' | 'article';
  data: any;
  fileName?: string;
  shareUrl?: string;
}

const ExportShare = ({ type, data, fileName, shareUrl }: ExportShareProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToastStore();
  const { t } = useI18n();

  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const element = document.getElementById(
        type === 'resume' ? 'resume-preview' : 'article-content'
      );
      if (!element) {
        toast.error(t('export.elementNotFound'));
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${fileName || 'export'}-${new Date().getTime()}.pdf`);
      toast.success(t('export.pdfExported'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('export.pdfExportFailed'));
    }
  };

  const handleExportHTML = () => {
    const element = document.getElementById(
      type === 'resume' ? 'resume-preview' : 'article-content'
    );
    if (!element) {
      toast.error(t('export.elementNotFound'));
      return;
    }

    const htmlContent = element.outerHTML;
    const blob = new Blob(
      [
        `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${fileName || 'Export'}</title></head><body>${htmlContent}</body></html>`,
      ],
      { type: 'text/html' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'export'}-${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('export.htmlExported'));
  };

  const handleCopyLink = async () => {
    if (!shareUrl) {
      const currentUrl = window.location.href;
      try {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(t('export.linkCopied'));
      } catch (error) {
        toast.error(t('export.copyFailed'));
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(t('export.linkCopied'));
      } catch (error) {
        toast.error(t('export.copyFailed'));
      }
    }
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin' | 'email') => {
    const url = shareUrl || window.location.href;
    const title =
      type === 'resume' ? data.personalInfo?.fullName || 'My Resume' : data.title || 'Article';
    const text = type === 'resume' ? 'Check out my resume' : data.summary || '';

    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2"
      >
        {showMenu ? <File size={16} /> : <Share2 size={16} />}
        {t('export.exportShare')}
      </Button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fade-in">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              {t('export.exportAs')}
            </div>
            <button
              onClick={() => {
                handleExportPDF();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <ScrollText size={16} className="text-red-600" />
              {t('export.pdf')}
            </button>
            <button
              onClick={() => {
                handleExportHTML();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <FileCode size={16} className="text-blue-600" />
              {t('export.html')}
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              {t('export.share')}
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              {copied ? t('export.copied') : t('export.copyLink')}
            </button>
            <button
              onClick={() => {
                handleShare('facebook');
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <Facebook size={16} className="text-blue-600" />
              Facebook
            </button>
            <button
              onClick={() => {
                handleShare('twitter');
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <Twitter size={16} className="text-blue-400" />
              Twitter
            </button>
            <button
              onClick={() => {
                handleShare('linkedin');
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <Linkedin size={16} className="text-blue-700" />
              LinkedIn
            </button>
            <button
              onClick={() => {
                handleShare('email');
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <AtSign size={16} className="text-gray-600" />
              {t('export.email')}
            </button>
          </div>
        </div>
      )}

      {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}
    </div>
  );
};

export default ExportShare;
