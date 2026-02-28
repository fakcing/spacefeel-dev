'use client';

import { useEffect, useState } from 'react';
import SectionRow from '@/components/ui/SectionRow';
import { useStore } from '@/store/useStore';
import { getAnime } from '@/lib/tmdb';
import type { Movie } from '@/types';
import { getTranslation } from '@/lib/i18n';

export default function AnimePage() {
  const { language } = useStore();
  const t = getTranslation(language);
  
  const [animeList, setAnimeList] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const anime = await getAnime(language);
        setAnimeList(anime);
      } catch (error) {
        console.error('Error fetching anime:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language]);

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-16 md:px-8">
        <h1 className="text-4xl font-bold text-white md:text-5xl">{t.nav.anime}</h1>
        <p className="mt-2 text-gray-400">{t.sections.discoverAnime}</p>
      </div>

      <div className="space-y-4">
        <SectionRow
          title={t.sections.popularAnime}
          movies={animeList}
          mediaType="tv"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}