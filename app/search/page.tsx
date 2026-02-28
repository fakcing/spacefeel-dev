'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Film, SlidersHorizontal, X } from 'lucide-react';
import MovieCard from '@/components/ui/MovieCard';
import { useStore } from '@/store/useStore';
import { searchMulti } from '@/lib/tmdb';
import { getTranslation } from '@/lib/i18n';
import type { Movie } from '@/types';

// TMDB Genre IDs
const GENRE_IDS: Record<string, number> = {
  action: 28,
  comedy: 35,
  drama: 18,
  horror: 27,
  romance: 10749,
  sciFi: 878,
  thriller: 53,
  animation: 16,
  documentary: 99,
  family: 10751,
  fantasy: 14,
  mystery: 9648,
  crime: 80,
  adventure: 12,
  war: 10752,
};

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const yearParam = searchParams.get('year') || 'all';
  const genreParam = searchParams.get('genre') || 'all';
  const { language } = useStore();
  const t = getTranslation(language);

  const [results, setResults] = useState<Movie[]>([]);
  const [filteredResults, setFilteredResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: categoryParam,
    year: yearParam,
    genre: genreParam,
  });

  // Sync filters with URL params
  useEffect(() => {
    setFilters({
      category: categoryParam,
      year: yearParam,
      genre: genreParam,
    });
  }, [categoryParam, yearParam, genreParam]);

  // Update URL when filters change
  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (newFilters.category !== 'all') params.set('category', newFilters.category);
    if (newFilters.year !== 'all') params.set('year', newFilters.year);
    if (newFilters.genre !== 'all') params.set('genre', newFilters.genre);
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    updateFilters({ category: 'all', year: 'all', genre: 'all' });
  };

  const hasActiveFilters = filters.category !== 'all' || filters.year !== 'all' || filters.genre !== 'all';

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setFilteredResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchMulti(query, language);
        setResults(data);
      } catch (error) {
        console.error('Error searching:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, language]);

  // Apply filters to results
  useEffect(() => {
    let filtered = [...results];

    // Category filter
    if (filters.category !== 'all') {
      if (filters.category === 'movie') {
        filtered = filtered.filter(item => item.media_type === 'movie' || item.title);
      } else if (filters.category === 'tv') {
        filtered = filtered.filter(item => item.media_type === 'tv' || (!item.title && item.name));
      } else if (filters.category === 'anime') {
        filtered = filtered.filter(item =>
          item.genre_ids?.includes(16) || item.original_language === 'ja'
        );
      }
    }

    // Year filter
    if (filters.year !== 'all') {
      filtered = filtered.filter(item => {
        const date = item.release_date || item.first_air_date || '';
        return date.startsWith(filters.year);
      });
    }

    // Genre filter
    if (filters.genre !== 'all') {
      const genreId = GENRE_IDS[filters.genre];
      if (genreId) {
        filtered = filtered.filter(item => item.genre_ids?.includes(genreId));
      }
    }

    setFilteredResults(filtered);
  }, [results, filters]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8">
            <div className="skeleton h-10 w-64 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton aspect-[2/3] w-full rounded-xl" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No query provided
  if (!query.trim()) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24 pb-16">
        <div className="text-center">
          <Search className="mx-auto mb-4 h-16 w-16 text-gray-600" />
          <h1 className="mb-2 text-2xl font-bold text-white">{t.search.searchForContent}</h1>
          <p className="text-gray-400">{t.search.enterSearchTerm}</p>
        </div>
      </div>
    );
  }

  // No results found
  if (results.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24 pb-16">
        <div className="text-center">
          <Film className="mx-auto mb-4 h-16 w-16 text-gray-600" />
          <h1 className="mb-2 text-2xl font-bold text-white">{t.common.noResults}</h1>
          <p className="text-gray-400">
            {t.search.noResultsFor} "<span className="text-white">{query}</span>"
          </p>
          <p className="mt-2 text-sm text-gray-500">{t.search.tryDifferent}</p>
        </div>
      </div>
    );
  }

  const categories = [
    { value: 'all', label: t.search.all },
    { value: 'movie', label: t.nav.movies },
    { value: 'tv', label: t.search.tvShows },
    { value: 'anime', label: t.nav.anime },
  ];

  const years = ['all', '2026', '2025', '2024', '2023', '2022', '2021', '2020'];

  const genres = [
    { value: 'all', label: t.search.all },
    { value: 'action', label: t.search.action },
    { value: 'comedy', label: t.search.comedy },
    { value: 'drama', label: t.search.drama },
    { value: 'horror', label: t.search.horror },
    { value: 'thriller', label: t.search.thriller },
    { value: 'romance', label: t.search.romance },
    { value: 'sciFi', label: t.search.sciFi },
    { value: 'fantasy', label: t.search.fantasy },
    { value: 'animation', label: t.search.animation },
    { value: 'adventure', label: t.search.adventure },
    { value: 'crime', label: t.search.crime },
    { value: 'documentary', label: t.search.documentary },
    { value: 'family', label: t.search.family },
    { value: 'mystery', label: t.search.mystery },
    { value: 'war', label: t.search.war },
  ];

  // Results found
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {t.search.searchResults}
              </h1>
              <p className="text-gray-400 mt-1">
                {t.search.foundResults}: {filteredResults.length} — "<span className="text-white">{query}</span>"
                {hasActiveFilters && <span className="text-accent"> ({t.search.filtered})</span>}
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-accent border-accent text-white'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t.search.filters}
              {hasActiveFilters && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded">
                  {(filters.category !== 'all' ? 1 : 0) + (filters.year !== 'all' ? 1 : 0) + (filters.genre !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Category Filter */}
                <div className="flex-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                    {t.search.category}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => updateFilters({ ...filters, category: cat.value })}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          filters.category === cat.value
                            ? 'bg-accent border-accent text-white'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year Filter */}
                <div className="flex-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                    {t.search.releaseYear}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {years.map(year => (
                      <button
                        key={year}
                        onClick={() => updateFilters({ ...filters, year })}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          filters.year === year
                            ? 'bg-accent border-accent text-white'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {year === 'all' ? t.search.all : year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Genre Filter */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                  {t.search.genres}
                </label>
                <div className="flex flex-wrap gap-2">
                  {genres.map(genre => (
                    <button
                      key={genre.value}
                      onClick={() => updateFilters({ ...filters, genre: genre.value })}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        filters.genre === genre.value
                          ? 'bg-accent border-accent text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {genre.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    {t.search.clearFilters}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {filteredResults.length === 0 && hasActiveFilters ? (
            <div className="text-center py-12">
              <Film className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-gray-400">{t.search.noMatchFilters}</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-accent hover:underline"
              >
                {t.search.clearFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredResults.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <MovieCard
                    movie={item}
                    mediaType={item.media_type || (item.title ? 'movie' : 'tv')}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 md:px-8">
            <div className="mb-8">
              <div className="skeleton h-10 w-64 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton aspect-[2/3] w-full rounded-xl" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
