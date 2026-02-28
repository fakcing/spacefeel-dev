'use client';

import { useEffect, useState } from 'react';
import SectionRow from '@/components/ui/SectionRow';
import { useStore } from '@/store/useStore';
import {
  getPopularTV,
  getTopRatedTV,
  getAiringTodayTV,
} from '@/lib/tmdb';
import type { Movie } from '@/types';
import { getTranslation } from '@/lib/i18n';

export default function TVPage() {
  const { language } = useStore();
  const t = getTranslation(language);
  
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<Movie[]>([]);
  const [airingTodayTV, setAiringTodayTV] = useState<Movie[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [popular, topRated, airingToday] = await Promise.all([
          getPopularTV(language),
          getTopRatedTV(language),
          getAiringTodayTV(language),
        ]);

        setPopularTV(popular);
        setTopRatedTV(topRated);
        setAiringTodayTV(airingToday);
      } catch (error) {
        console.error('Error fetching TV series:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language]);

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-16 md:px-8">
        <h1 className="text-4xl font-bold text-white md:text-5xl">{t.nav.series}</h1>
        <p className="mt-2 text-gray-400">{t.sections.discoverSeries}</p>
      </div>

      <div className="space-y-4">
        <SectionRow
          title={t.sections.airingToday}
          movies={airingTodayTV}
          mediaType="tv"
          isLoading={isLoading}
        />

        <SectionRow
          title={t.sections.popularTV}
          movies={popularTV}
          mediaType="tv"
          isLoading={isLoading}
        />

        <SectionRow
          title={t.sections.topRatedTV}
          movies={topRatedTV}
          mediaType="tv"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}