import axios from 'axios';
import type { Movie, MovieDetails, TMDBResponse, Language, Genre } from '@/types';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Language mapping for TMDB API
const languageMap: Record<Language, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  uk: 'uk-UA',
  pl: 'pl-PL',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
};

// Create axios instance with interceptors
const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// Helper to get language code
export const getLanguageCode = (lang: Language): string => languageMap[lang];

// Helper to construct image URLs
export const getImageUrl = (path: string | null, size: 'w300' | 'w500' | 'original' = 'w500'): string => {
  if (!path) return '/placeholder-movie.jpg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

// Genres
export const getGenres = async (lang: Language, mediaType: 'movie' | 'tv' = 'movie'): Promise<Genre[]> => {
  try {
    const response = await tmdbAxios.get(`/genre/${mediaType}/list`, {
      params: { language: getLanguageCode(lang) },
    });
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

// Trending
export const getTrending = async (
  lang: Language,
  mediaType: 'all' | 'movie' | 'tv' = 'all',
  timeWindow: 'day' | 'week' = 'week'
): Promise<Movie[]> => {
  try {
    const response = await tmdbAxios.get<TMDBResponse<Movie>>(`/trending/${mediaType}/${timeWindow}`, {
      params: { language: getLanguageCode(lang) },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
};

// Popular Movies
export const getPopularMovies = async (lang: Language, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbAxios.get<TMDBResponse<Movie>>('/movie/popular', {
      params: { language: getLanguageCode(lang), page },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

// Top Rated Movies
export const getTopRatedMovies = async (lang: Language, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbAxios.get<TMDBResponse<Movie>>('/movie/top_rated', {
      params: { language: getLanguageCode(lang), page },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return [];
  }
};

// Now Playing Movies
export const getNowPlayingMovies = async (lang: Language, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbAxios.get<TMDBResponse<Movie>>('/movie/now_playing', {
      params: { language: getLanguageCode(lang), page },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    return [];
  }
};

// Upcoming Movies
export const getUpcomingMovies = async (lang: Language, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbAxios.get<TMDBResponse<Movie>>('/movie/upcoming', {
      params: { language: getLanguageCode(lang), page },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    return [];
  }
};

// Popular TV Series
export const getPopularTV = async (lang: Language, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbAxios.get<TMDBResponse<Movie>>('/tv/popular', {
      params: { language: getLanguageCode(lang), page },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching popular TV:', error);
    return [];
  }
};

// Top Rated TV Series
export const getTopRatedTV = async (lang: Language, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbAxios.get<TMDBResponse<Movie>>('/tv/top_rated', {
      params: { language: getLanguageCode(lang), page },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching top rated TV:', error);
    return [];
  }
};

// Airing Today TV
export const getAiringTodayTV = async (lang: Language, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbAxios.get<TMDBResponse<Movie>>('/tv/airing_today', {
      params: { language: getLanguageCode(lang), page },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching airing today TV:', error);
    return [];
  }
};

// Anime (Animation genre + Japan origin)
export const getAnime = async (lang: Language, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbAxios.get<TMDBResponse<Movie>>('/discover/tv', {
      params: {
        language: getLanguageCode(lang),
        page,
        with_genres: 16,
        with_origin_country: 'JP',
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching anime:', error);
    return [];
  }
};

// Cartoons (Animation genre excluding Japanese content)
export const getCartoons = async (lang: Language, page: number = 1, mediaType: 'movie' | 'tv' = 'movie'): Promise<Movie[]> => {
  try {
    const response = await tmdbAxios.get<TMDBResponse<Movie>>(`/discover/${mediaType}`, {
      params: {
        language: getLanguageCode(lang),
        page,
        with_genres: 16,
        without_origin_country: 'JP',
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching cartoons:', error);
    return [];
  }
};

// Get Movie/TV Details
export const getMediaDetails = async (
  id: number,
  mediaType: 'movie' | 'tv',
  lang: Language
): Promise<MovieDetails | null> => {
  try {
    const response = await tmdbAxios.get<MovieDetails>(`/${mediaType}/${id}`, {
      params: {
        language: getLanguageCode(lang),
        append_to_response: 'credits,videos,recommendations',
      },
    });
    // Map recommendations to similar for backward compatibility
    const data = response.data;
    if (data.recommendations) {
      // Sort by release date (newest first) and filter out items without posters
      const sortedResults = data.recommendations.results
        .filter((item: Movie) => item.poster_path)
        .sort((a: Movie, b: Movie) => {
          const dateA = a.release_date || a.first_air_date || '0000';
          const dateB = b.release_date || b.first_air_date || '0000';
          return dateB.localeCompare(dateA);
        });
      data.similar = { results: sortedResults };
    }
    return data;
  } catch (error) {
    console.error('Error fetching media details:', error);
    return null;
  }
};

// Search Multi (Movies + TV)
export const searchMulti = async (
  query: string,
  lang: Language,
  page: number = 1
): Promise<Movie[]> => {
  try {
    const response = await tmdbAxios.get<TMDBResponse<Movie>>('/search/multi', {
      params: {
        language: getLanguageCode(lang),
        query,
        page,
      },
    });
    return response.data.results.filter((item) => item.media_type === 'movie' || item.media_type === 'tv');
  } catch (error) {
    console.error('Error searching:', error);
    return [];
  }
};

// Discover with filters
export const discoverMedia = async (
  lang: Language,
  mediaType: 'movie' | 'tv',
  filters: {
    year?: string;
    genre?: string;
    sortBy?: string;
    page?: number;
  } = {}
): Promise<Movie[]> => {
  try {
    const params: any = {
      language: getLanguageCode(lang),
      sort_by: filters.sortBy || 'popularity.desc',
      page: filters.page || 1,
    };

    if (filters.year) {
      if (mediaType === 'movie') {
        params.primary_release_year = filters.year;
      } else {
        params.first_air_date_year = filters.year;
      }
    }

    if (filters.genre) {
      params.with_genres = filters.genre;
    }

    const response = await tmdbAxios.get<TMDBResponse<Movie>>(`/discover/${mediaType}`, {
      params,
    });
    return response.data.results;
  } catch (error) {
    console.error('Error discovering media:', error);
    return [];
  }
};

export default tmdbAxios;