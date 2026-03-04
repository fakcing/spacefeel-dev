'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	List,
	Film,
	Tv,
	Trash2,
	Clock,
	Star,
	Filter,
	SortAsc,
	SortDesc,
	Grid,
	LayoutList,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getTranslation } from '@/lib/i18n'
import { useRouter } from 'next/navigation'
import MovieCard from '@/components/ui/MovieCard'
import { getMediaDetails } from '@/lib/tmdb'
import type { Movie } from '@/types'

// Алиасы для motion-компонентов
const MotionDiv = motion.div
const MotionP = motion.p
const MotionButton = motion.button

type SortOption = 'added' | 'title' | 'rating' | 'year'
type FilterOption = 'all' | 'movie' | 'tv'
type ViewMode = 'grid' | 'list'

// Расширенный тип для элементов списка
type WatchlistMovie = Movie & {
	addedAt: number
	mediaType: 'movie' | 'tv'
}

export default function MyListPage() {
	const router = useRouter()
	const { language, isAuthenticated, items, removeFromWatchlist } = useStore()
	const t = getTranslation(language)

	const [watchlistMovies, setWatchlistMovies] = useState<WatchlistMovie[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [sortBy, setSortBy] = useState<SortOption>('added')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
	const [filterBy, setFilterBy] = useState<FilterOption>('all')
	const [viewMode, setViewMode] = useState<ViewMode>('grid')
	const [showRemoveConfirm, setShowRemoveConfirm] = useState<number | null>(
		null,
	)

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/profile')
		}
	}, [isAuthenticated, router])

	useEffect(() => {
		const fetchWatchlistMovies = async () => {
			if (items.length === 0) {
				setWatchlistMovies([])
				setIsLoading(false)
				return
			}

			setIsLoading(true)
			try {
				const moviePromises = items.map(async item => {
					const details = await getMediaDetails(
						item.id,
						item.mediaType,
						language,
					)
					if (details) {
						return {
							...details,
							addedAt: item.addedAt,
							mediaType: item.mediaType,
						}
					}
					return null
				})

				const results = await Promise.all(moviePromises)

				// Исправленная фильтрация с явным приведением типа
				const validMovies = results.filter(m => m !== null) as WatchlistMovie[]
				setWatchlistMovies(validMovies)
			} catch (error) {
				console.error('Error fetching watchlist:', error)
			} finally {
				setIsLoading(false)
			}
		}

		if (isAuthenticated) {
			fetchWatchlistMovies()
		}
	}, [items, language, isAuthenticated])

	// Filter and sort movies
	const filteredAndSortedMovies = watchlistMovies
		.filter(movie => {
			if (filterBy === 'all') return true
			return movie.mediaType === filterBy
		})
		.sort((a, b) => {
			let comparison = 0
			switch (sortBy) {
				case 'added':
					comparison = (a.addedAt || 0) - (b.addedAt || 0)
					break
				case 'title':
					const aTitle = a.title || a.name || ''
					const bTitle = b.title || b.name || ''
					comparison = aTitle.localeCompare(bTitle)
					break
				case 'rating':
					comparison = (a.vote_average || 0) - (b.vote_average || 0)
					break
				case 'year':
					const aYear =
						new Date(a.release_date || a.first_air_date || '').getFullYear() ||
						0
					const bYear =
						new Date(b.release_date || b.first_air_date || '').getFullYear() ||
						0
					comparison = aYear - bYear
					break
			}
			return sortOrder === 'asc' ? comparison : -comparison
		})

	const handleRemoveItem = (id: number) => {
		removeFromWatchlist(id)
		setShowRemoveConfirm(null)
	}

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.05 },
		},
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	}

	const stats = {
		total: items.length,
		movies: items.filter(i => i.mediaType === 'movie').length,
		tvShows: items.filter(i => i.mediaType === 'tv').length,
	}

	if (!isAuthenticated) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='text-center'>
					<h1 className='mb-4 text-4xl font-bold text-white'>
						{t.auth.pleaseLogin}
					</h1>
					<p className='text-gray-400'>{t.auth.needLoginToView}</p>
				</div>
			</div>
		)
	}

	return (
		<MotionDiv
			className='min-h-screen pb-16 pt-24'
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.4 }}
		>
			<div className='container mx-auto px-4 md:px-8'>
				{/* Header */}
				<MotionDiv
					initial={{ opacity: 0, y: -30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
					className='mb-8'
				>
					<h1 className='flex items-center gap-3 text-4xl font-bold text-white'>
						<MotionDiv
							initial={{ scale: 0, rotate: -180 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{
								duration: 0.5,
								delay: 0.2,
								type: 'spring',
								stiffness: 200,
							}}
						>
							<List className='h-10 w-10 text-accent' />
						</MotionDiv>
						{t.profile.myList}
					</h1>
					<MotionP
						className='mt-2 text-gray-400'
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3 }}
					>
						{t.profile.savedContent}
					</MotionP>
				</MotionDiv>

				{/* Stats Cards */}
				<div className='mb-8 grid grid-cols-3 gap-4'>
					{[
						{
							icon: List,
							color: 'accent',
							bgColor: 'bg-accent/20',
							value: stats.total,
							label: t.profile.totalItems,
						},
						{
							icon: Film,
							color: 'blue-400',
							bgColor: 'bg-blue-500/20',
							value: stats.movies,
							label: t.profile.moviesCount,
						},
						{
							icon: Tv,
							color: 'purple-400',
							bgColor: 'bg-purple-500/20',
							value: stats.tvShows,
							label: t.profile.tvShowsCount,
						},
					].map((stat, index) => {
						const Icon = stat.icon
						return (
							<MotionDiv
								key={stat.label}
								initial={{ opacity: 0, y: 30, scale: 0.9 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								transition={{
									delay: 0.1 + index * 0.1,
									duration: 0.4,
									ease: [0.4, 0, 0.2, 1],
								}}
								whileHover={{ scale: 1.02, y: -2 }}
								className='glass-card flex items-center gap-4 p-4 cursor-default'
							>
								<div
									className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bgColor}`}
								>
									<Icon className={`h-6 w-6 text-${stat.color}`} />
								</div>
								<div>
									<MotionP
										className='text-2xl font-bold text-white'
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.3 + index * 0.1 }}
									>
										{stat.value}
									</MotionP>
									<p className='text-sm text-gray-400'>{stat.label}</p>
								</div>
							</MotionDiv>
						)
					})}
				</div>

				{/* Filters and Sort Controls */}
				<MotionDiv
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className='mb-6 space-y-4'
				>
					{/* Filter Chips */}
					<div className='flex flex-wrap items-center gap-2'>
						<span className='text-sm text-gray-500 mr-1'>
							{t.search.category}:
						</span>
						{[
							{
								value: 'all' as FilterOption,
								label: t.profile.all,
								icon: List,
							},
							{
								value: 'movie' as FilterOption,
								label: t.nav.movies,
								icon: Film,
							},
							{ value: 'tv' as FilterOption, label: t.nav.series, icon: Tv },
						].map(option => {
							const Icon = option.icon
							return (
								<button
									key={option.value}
									onClick={() => setFilterBy(option.value)}
									className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
										filterBy === option.value
											? 'bg-accent text-white shadow-lg shadow-accent/25'
											: 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
									}`}
								>
									<Icon className='h-4 w-4' />
									{option.label}
								</button>
							)
						})}
					</div>

					{/* Sort and View Controls */}
					<div className='flex flex-wrap items-center justify-between gap-4'>
						<div className='flex flex-wrap items-center gap-2'>
							<span className='text-sm text-gray-500 mr-1'>
								{t.search.sortBy}:
							</span>
							{[
											{
									value: 'added' as SortOption,
									label: t.profile.sortByDate,
									icon: Clock,
								},
								{ value: 'title' as SortOption, label: t.profile.sortByName },
								{
									value: 'rating' as SortOption,
									label: t.profile.sortByRating,
									icon: Star,
								},
								{ value: 'year' as SortOption, label: t.common.year },
							].map(option => (
								<button
									key={option.value}
									onClick={() => setSortBy(option.value)}
									className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all duration-200 ${
										sortBy === option.value
											? 'bg-white/15 text-white'
											: 'text-gray-500 hover:text-white hover:bg-white/5'
									}`}
								>
									{option.label}
								</button>
							))}
							<button
								onClick={() =>
									setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
								}
								className='ml-1 rounded-lg bg-white/5 border border-white/10 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white'
							>
								{sortOrder === 'asc' ? (
									<SortAsc className='h-4 w-4' />
								) : (
									<SortDesc className='h-4 w-4' />
								)}
							</button>
						</div>

						{/* View Mode Toggle */}
						<div className='flex items-center gap-1 rounded-lg bg-white/5 p-1 border border-white/10'>
							<button
								onClick={() => setViewMode('grid')}
								className={`rounded-md p-2 transition-all duration-200 ${
									viewMode === 'grid'
										? 'bg-accent text-white shadow-sm'
										: 'text-gray-400 hover:text-white'
								}`}
							>
								<Grid className='h-4 w-4' />
							</button>
							<button
								onClick={() => setViewMode('list')}
								className={`rounded-md p-2 transition-all duration-200 ${
									viewMode === 'list'
										? 'bg-accent text-white shadow-sm'
										: 'text-gray-400 hover:text-white'
								}`}
							>
								<LayoutList className='h-4 w-4' />
							</button>
						</div>
					</div>
				</MotionDiv>

				{/* Content */}
				{isLoading ? (
					<div
						className={
							viewMode === 'grid'
								? 'grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5'
								: 'space-y-4'
						}
					>
						{[...Array(10)].map((_, i) => (
							<div
								key={i}
								className={
									viewMode === 'grid'
										? 'space-y-3'
										: 'flex gap-4 glass-card p-4'
								}
							>
								<div
									className={`skeleton rounded-xl ${viewMode === 'grid' ? 'aspect-[2/3] w-full' : 'h-32 w-24 shrink-0'}`}
								/>
								{viewMode === 'list' && (
									<div className='flex-1 space-y-2'>
										<div className='skeleton h-6 w-3/4 rounded' />
										<div className='skeleton h-4 w-1/2 rounded' />
										<div className='skeleton h-4 w-full rounded' />
									</div>
								)}
								{viewMode === 'grid' && (
									<div className='skeleton h-4 w-3/4 rounded' />
								)}
							</div>
						))}
					</div>
				) : filteredAndSortedMovies.length === 0 ? (
					<MotionDiv
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className='glass-card p-12 text-center'
					>
						<List className='mx-auto h-16 w-16 text-gray-600 mb-4' />
						<p className='text-xl text-gray-400'>
							{filterBy !== 'all'
								? filterBy === 'movie'
									? t.profile.noMoviesInList
									: t.profile.noTvInList
								: t.profile.emptyWatchlist}
						</p>
						<p className='mt-2 text-sm text-gray-500'>
							{t.profile.emptyWatchlistHint}
						</p>
						<MotionButton
							className='mt-6 btn-primary'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => router.push('/movies')}
						>
							{t.nav.movies}
						</MotionButton>
					</MotionDiv>
				) : viewMode === 'grid' ? (
					<MotionDiv
						variants={containerVariants}
						initial='hidden'
						animate='visible'
						className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5'
					>
						{filteredAndSortedMovies.map(movie => {
							return (
								<MotionDiv
									key={movie.id}
									variants={itemVariants}
									className='relative group'
								>
									<MovieCard movie={movie} mediaType={movie.mediaType} />
									{/* Remove button overlay */}
									<button
										onClick={e => {
											e.stopPropagation()
											setShowRemoveConfirm(movie.id)
										}}
										className='absolute top-2 right-2 rounded-full bg-red-500/80 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500'
									>
										<Trash2 className='h-4 w-4 text-white' />
									</button>
								</MotionDiv>
							)
						})}
					</MotionDiv>
				) : (
					<MotionDiv
						variants={containerVariants}
						initial='hidden'
						animate='visible'
						className='space-y-4'
					>
						{filteredAndSortedMovies.map(movie => {
							const year = new Date(
								movie.release_date || movie.first_air_date || '',
							).getFullYear()
							return (
								<MotionDiv
									key={movie.id}
									variants={itemVariants}
									className='glass-card flex gap-4 p-4 group cursor-pointer hover:bg-white/5 transition-colors'
									onClick={() => router.push(`/${movie.mediaType}/${movie.id}`)}
								>
									<div className='h-32 w-24 shrink-0 overflow-hidden rounded-lg'>
										{movie.poster_path ? (
											<img
												src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
												alt={movie.title || movie.name}
												className='h-full w-full object-cover'
											/>
										) : (
											<div className='flex h-full w-full items-center justify-center bg-zinc-800'>
												<Film className='h-8 w-8 text-gray-600' />
											</div>
										)}
									</div>
									<div className='flex-1'>
										<div className='flex items-start justify-between'>
											<div>
												<h3 className='text-lg font-semibold text-white'>
													{movie.title || movie.name}
												</h3>
												<div className='mt-1 flex items-center gap-3 text-sm text-gray-400'>
													<span className='flex items-center gap-1'>
														{movie.mediaType === 'movie' ? (
															<Film className='h-4 w-4' />
														) : (
															<Tv className='h-4 w-4' />
														)}
{movie.mediaType === 'movie' ? t.profile.movie : t.profile.tvShow}
													</span>
													{year > 0 && <span>{year}</span>}
													<span className='flex items-center gap-1'>
														<Star className='h-4 w-4 text-yellow-500' />
														{movie.vote_average?.toFixed(1)}
													</span>
												</div>
											</div>
											<button
												onClick={e => {
													e.stopPropagation()
													setShowRemoveConfirm(movie.id)
												}}
												className='rounded-lg p-2 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400'
											>
												<Trash2 className='h-5 w-5' />
											</button>
										</div>
										<p className='mt-2 line-clamp-2 text-sm text-gray-400'>
											{movie.overview}
										</p>
										<div className='mt-2 flex items-center gap-2 text-xs text-gray-500'>
											<Clock className='h-3 w-3' />
{t.profile.added} {new Date(movie.addedAt).toLocaleDateString()}
										</div>
									</div>
								</MotionDiv>
							)
						})}
					</MotionDiv>
				)}

				{/* Remove Confirmation Modal */}
				<AnimatePresence>
					{showRemoveConfirm !== null && (
						<MotionDiv
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'
							onClick={() => setShowRemoveConfirm(null)}
						>
							<MotionDiv
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.9, opacity: 0 }}
								className='glass-card max-w-sm p-6 text-center'
								onClick={e => e.stopPropagation()}
							>
								<Trash2 className='mx-auto h-12 w-12 text-red-400 mb-4' />
								<h3 className='text-xl font-semibold text-white mb-2'>
									{t.profile.confirmRemove}
								</h3>
								<p className='text-gray-400 mb-6'>
									{t.profile.confirmRemoveDesc}
								</p>
								<div className='flex gap-3'>
									<button
										onClick={() => setShowRemoveConfirm(null)}
										className='flex-1 rounded-lg border border-white/10 px-4 py-2 text-white transition-colors hover:bg-white/5'
									>
										{t.profile.cancel}
									</button>
									<button
										onClick={() => handleRemoveItem(showRemoveConfirm)}
										className='flex-1 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600'
									>
										{t.profile.remove}
									</button>
								</div>
							</MotionDiv>
						</MotionDiv>
					)}
				</AnimatePresence>
			</div>
		</MotionDiv>
	)
}
