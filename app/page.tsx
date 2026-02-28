'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/ui/Hero';
import SectionRow from '@/components/ui/SectionRow';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getPopularTV,
  getMediaDetails,
} from '@/lib/tmdb';
import type { Movie, MovieDetails } from '@/types';

export default function HomePage() {
  const { language } = useStore();
  const t = getTranslation(language);

  const [heroMovie, setHeroMovie] = useState<MovieDetails | undefined>();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch 2 pages for each category to get more movies (40 instead of 20)
        const [
          trendingData,
          popularMoviesPage1, popularMoviesPage2,
          topRatedPage1, topRatedPage2,
          popularTVPage1, popularTVPage2,
        ] = await Promise.all([
          getTrending(language, 'all', 'week'),
          getPopularMovies(language, 1),
          getPopularMovies(language, 2),
          getTopRatedMovies(language, 1),
          getTopRatedMovies(language, 2),
          getPopularTV(language, 1),
          getPopularTV(language, 2),
        ]);

        setTrending(trendingData);
        setPopularMovies([...popularMoviesPage1, ...popularMoviesPage2]);
        setTopRatedMovies([...topRatedPage1, ...topRatedPage2]);
        setPopularTV([...popularTVPage1, ...popularTVPage2]);

        if (trendingData.length > 0) {
          const heroData = trendingData[0];
          const mediaType = heroData.title ? 'movie' : 'tv';
          const details = await getMediaDetails(heroData.id, mediaType, language);
          if (details) {
            setHeroMovie(details);
          }
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language]);

  return (
    <div className="min-h-screen">
      <Hero movie={heroMovie} isLoading={isLoading} />

      <div className="space-y-4 pb-16">
        <SectionRow
          title={t.sections.trendingNow}
          movies={trending}
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
          title={t.sections.popularTV}
          movies={popularTV}
          mediaType="tv"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}