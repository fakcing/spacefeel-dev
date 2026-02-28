'use client';

import { useEffect, useState } from 'react';
import SectionRow from '@/components/ui/SectionRow';
import { useStore } from '@/store/useStore';
import { getCartoons } from '@/lib/tmdb';
import type { Movie } from '@/types';
import { getTranslation } from '@/lib/i18n';

export default function CartoonsPage() {
  const { language } = useStore();
  const t = getTranslation(language);
  
  const [cartoonMovies, setCartoonMovies] = useState<Movie[]>([]);
  const [cartoonTV, setCartoonTV] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [movies, tv] = await Promise.all([
          getCartoons(language, 1, 'movie'),
          getCartoons(language, 1, 'tv'),
        ]);

        setCartoonMovies(movies);
        setCartoonTV(tv);
      } catch (error) {
        console.error('Error fetching cartoons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language]);

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-16 md:px-8">
        <h1 className="text-4xl font-bold text-white md:text-5xl">{t.nav.cartoons}</h1>
        <p className="mt-2 text-gray-400">{t.sections.discoverCartoons}</p>
      </div>

      <div className="space-y-4">
        <SectionRow
          title={t.sections.popularCartoons}
          movies={cartoonMovies}
          mediaType="movie"
          isLoading={isLoading}
        />

        <SectionRow
          title={t.sections.topRatedCartoons}
          movies={cartoonTV}
          mediaType="tv"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}