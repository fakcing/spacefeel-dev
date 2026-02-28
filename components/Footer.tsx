'use client';

import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';

export default function Footer() {
  const { language } = useStore();
  const t = getTranslation(language);

  return (
    <footer className="border-t border-white/10 bg-primary py-8">
      <div className="container mx-auto px-4 text-center md:px-8">
        <p className="text-sm text-gray-400">{t.footer.copyright}</p>
      </div>
    </footer>
  );
}