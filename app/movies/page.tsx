'use client';

import { useEffect, useState } from 'react';
import SectionRow from '@/components/ui/SectionRow';
import { useStore } from '@/store/useStore';
import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
} from '@/lib/tmdb';
import type { Movie } from '@/types';
import { getTranslation } from '@/lib/i18n';

export default function MoviesPage() {
  const { language } = useStore();
  const t = getTranslation(language);
  
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [popular, topRated, nowPlaying, upcoming] = await Promise.all([
          getPopularMovies(language),
          getTopRatedMovies(language),
          getNowPlayingMovies(language),
          getUpcomingMovies(language),
        ]);

        setPopularMovies(popular);
        setTopRatedMovies(topRated);
        setNowPlayingMovies(nowPlaying);
        setUpcomingMovies(upcoming);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language]);

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-16 md:px-8">
        <h1 className="text-4xl font-bold text-white md:text-5xl">{t.nav.movies}</h1>
        <p className="mt-2 text-gray-400">{t.sections.discoverMovies}</p>
      </div>

      <div className="space-y-4">
        <SectionRow
          title={t.sections.nowPlaying}
          movies={nowPlayingMovies}
          mediaType="movie"
          isLoading={isLoading}
        />

        <SectionRow
          title={t.sections.popularMovies}
          movies={popularMovies}
          mediaType="movie"
          isLoading={isLoading}
        />

        <SectionRow
          title={t.sections.topRatedMovies}
          movies={topRatedMovies}
          mediaType="movie"
          isLoading={isLoading}
        />

        <SectionRow
          title={t.sections.upcomingMovies}
          movies={upcomingMovies}
          mediaType="movie"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}