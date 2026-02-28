'use client';

import { motion } from 'framer-motion';
import { Plus, Info, Check } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { HeroProps } from '@/types';
import { getImageUrl } from '@/lib/tmdb';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';

export default function Hero({ movie, isLoading = false }: HeroProps) {
  const { language, addToWatchlist, removeFromWatchlist, isInWatchlist, isAuthenticated, notifications } = useStore();
  const t = getTranslation(language);

  if (isLoading || !movie) {
    return (
      <section className="relative h-[70vh] min-h-[500px] w-full md:h-[85vh]">
        <div className="skeleton absolute inset-0" />
      </section>
    );
  }

  const title = movie.title || movie.name || movie.original_title || movie.original_name || 'Featured';
  const overview = movie.overview || 'No description available.';
  const backdropUrl = getImageUrl(movie.backdrop_path, 'original');
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const year = (movie.release_date || movie.first_air_date || '').split('-')[0];
  const mediaType = movie.title ? 'movie' : 'tv';
  const inWatchlist = isInWatchlist(movie.id);

  const toastStyle = {
    background: '#18181b',
    color: '#fff',
    border: '1px solid #333',
  };

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
      if (notifications) {
        toast.error(t.hero.removedFromWatchlist, { style: toastStyle });
      }
    } else {
      addToWatchlist(movie.id, mediaType);
      if (notifications) {
        toast.success(t.hero.addedToWatchlist, { style: toastStyle });
      }
    }
  };

  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden md:h-[85vh]">
      <div className="absolute inset-0">
        <img
          src={backdropUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex h-full items-end pb-16 md:items-center md:pb-0">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            className="max-w-2xl space-y-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-shadow text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              {title}
            </h1>

            <div className="flex items-center gap-4 text-sm md:text-base">
              <span className="flex items-center gap-1 font-semibold text-white">
                ⭐ {rating}
              </span>
              <span className="text-gray-300">{year}</span>
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex gap-2">
                  {movie.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre.id}
                      className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="text-shadow line-clamp-3 text-base text-gray-200 md:line-clamp-4 md:text-lg">
              {overview}
            </p>

            <div className="flex flex-wrap gap-4">
              {isAuthenticated && (
                <motion.button
                  className="btn-secondary flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWatchlistToggle}
                >
                  {inWatchlist ? (
                    <>
                      <Check className="h-5 w-5" />
                      {t.hero.inList}
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      {t.hero.addToList}
                    </>
                  )}
                </motion.button>
              )}

              <Link href={`/${mediaType}/${movie.id}`}>
                <motion.button
                  className="btn-primary flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Info className="h-5 w-5" />
                  {t.hero.moreInfo}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary to-transparent" />
    </section>
  );
}
