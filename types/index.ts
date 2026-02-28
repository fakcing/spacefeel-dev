// TMDB API Response Types
export interface Movie {
	id: number
	title?: string
	name?: string
	original_title?: string
	original_name?: string
	overview: string
	poster_path: string | null
	backdrop_path: string | null
	release_date?: string
	first_air_date?: string
	vote_average: number
	vote_count: number
	popularity: number
	genre_ids: number[]
	adult: boolean
	video: boolean
	media_type?: 'movie' | 'tv'
	origin_country?: string[]
	original_language?: string
}

export interface MovieDetails extends Movie {
	genres: Genre[]
	runtime?: number
	episode_run_time?: number[]
	number_of_seasons?: number
	number_of_episodes?: number
	status: string
	tagline: string
	budget?: number
	revenue?: number
	production_companies: ProductionCompany[]
	production_countries: ProductionCountry[]
	spoken_languages: SpokenLanguage[]
	credits?: Credits
	videos?: Videos
	similar?: {
		results: Movie[]
	}
	recommendations?: {
		results: Movie[]
	}
}

export interface Genre {
	id: number
	name: string
}

export interface ProductionCompany {
	id: number
	logo_path: string | null
	name: string
	origin_country: string
}

export interface ProductionCountry {
	iso_3166_1: string
	name: string
}

export interface SpokenLanguage {
	english_name: string
	iso_639_1: string
	name: string
}

export interface Cast {
	id: number
	name: string
	character: string
	profile_path: string | null
	order: number
}

export interface Crew {
	id: number
	name: string
	job: string
	department: string
	profile_path: string | null
}

export interface Credits {
	cast: Cast[]
	crew: Crew[]
}

export interface Video {
	id: string
	key: string
	name: string
	site: string
	type: string
	official: boolean
}

export interface Videos {
	results: Video[]
}

export interface TMDBResponse<T> {
	page: number
	results: T[]
	total_pages: number
	total_results: number
}

// User & Auth Types
export interface User {
	uid: string
	email: string | null
	displayName: string | null
	photoURL: string | null
	emailVerified: boolean
	bio?: string | null
}

export interface AuthState {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	login: (email: string, password: string) => Promise<void>
	register: (
		email: string,
		password: string,
		displayName: string,
	) => Promise<void>
	loginWithGoogle: () => Promise<void>
	logout: () => Promise<void>
	updateProfile: (data: Partial<User>) => Promise<void>
}

// Watchlist Types
export interface WatchlistItem {
	id: number
	mediaType: 'movie' | 'tv'
	addedAt: number
}

export interface WatchlistState {
	items: WatchlistItem[]
	addToWatchlist: (id: number, mediaType: 'movie' | 'tv') => void
	removeFromWatchlist: (id: number) => void
	isInWatchlist: (id: number) => boolean
}

// Language Types (ВИПРАВЛЕНО: додано 'ru')
export type Language = 'en' | 'uk' | 'ru' | 'pl' | 'de' | 'fr' | 'es'

export interface LanguageState {
	language: Language
	setLanguage: (lang: Language) => void
}

// App State Types
export interface AppState extends AuthState, WatchlistState, LanguageState {
	searchHistory: string[]
	addToSearchHistory: (query: string) => void
	clearSearchHistory: () => void
}

// UI Component Props
export interface MovieCardProps {
	movie: Movie
	mediaType?: 'movie' | 'tv'
}

export interface SectionRowProps {
	title: string
	movies: Movie[]
	mediaType?: 'movie' | 'tv'
	isLoading?: boolean
}

export interface HeroProps {
	movie?: MovieDetails
	isLoading?: boolean
}

// Filter Types
export interface SearchFilters {
	year?: string
	genre?: string
	sortBy?: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc'
}

// Navigation Types
export interface NavLink {
	label: string
	href: string
}
