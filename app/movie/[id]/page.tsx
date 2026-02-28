'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Check, Star, Calendar, Clock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import SectionRow from '@/components/ui/SectionRow'
import { useStore } from '@/store/useStore'
import { getMediaDetails, getImageUrl } from '@/lib/tmdb'
import type { MovieDetails } from '@/types'
import { getTranslation } from '@/lib/i18n'

export default function MovieDetailPage() {
	const params = useParams()
	// Достаем isAuthenticated, чтобы проверять вход
	const {
		language,
		addToWatchlist,
		removeFromWatchlist,
		isInWatchlist,
		isAuthenticated,
		notifications,
	} = useStore()
	const t = getTranslation(language)

	const [movie, setMovie] = useState<MovieDetails | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [imageError, setImageError] = useState(false)

	const movieId = parseInt(params.id as string)
	const inWatchlist = isInWatchlist(movieId)

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true)
			try {
				let details = await getMediaDetails(movieId, 'movie', language)
				if (!details) {
					details = await getMediaDetails(movieId, 'tv', language)
				}
				setMovie(details)
			} catch (error) {
				console.error('Error fetching movie details:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [movieId, language])

	if (isLoading) {
		return (
			<div className='min-h-screen pb-16'>
				<div className='skeleton h-[50vh] w-full' />
				<div className='container mx-auto px-4 py-8 md:px-8'>
					<div className='flex flex-col gap-8 md:flex-row'>
						<div className='skeleton h-[400px] w-[270px] rounded-xl' />
						<div className='flex-1 space-y-4'>
							<div className='skeleton h-12 w-3/4 rounded-lg' />
							<div className='skeleton h-6 w-1/2 rounded-lg' />
							<div className='skeleton h-32 w-full rounded-lg' />
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!movie) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='text-center'>
					<h1 className='mb-4 text-4xl font-bold text-white'>
						Movie Not Found
					</h1>
					<p className='text-gray-400'>
						The movie you're looking for doesn't exist.
					</p>
				</div>
			</div>
		)
	}

	const title =
		movie.title ||
		movie.name ||
		movie.original_title ||
		movie.original_name ||
		'Untitled'
	const backdropUrl = imageError
		? '/placeholder-movie.jpg'
		: getImageUrl(movie.backdrop_path, 'original')
	const posterUrl = getImageUrl(movie.poster_path, 'w500')
	const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'
	const year = (movie.release_date || movie.first_air_date || '').split('-')[0]
	const runtime =
		movie.runtime || (movie.episode_run_time && movie.episode_run_time[0]) || 0
	const mediaType = movie.title ? 'movie' : 'tv'

	const trailer = movie.videos?.results.find(
		video => video.type === 'Trailer' && video.site === 'YouTube',
	)

	const toastStyle = {
		background: '#18181b',
		color: '#fff',
		border: '1px solid #333',
	}

	const handleWatchlistToggle = () => {
		if (inWatchlist) {
			removeFromWatchlist(movieId)
			if (notifications) {
				toast.error(t.hero.removedFromWatchlist, { style: toastStyle })
			}
		} else {
			addToWatchlist(movieId, mediaType)
			if (notifications) {
				toast.success(t.hero.addedToWatchlist, { style: toastStyle })
			}
		}
	}

	return (
		<div className='min-h-screen pb-16'>
			{/* Backdrop Header */}
			<section className='relative h-[50vh] min-h-[400px] w-full overflow-hidden'>
				<div className='absolute inset-0'>
					<img
						src={backdropUrl}
						alt={title}
						className='h-full w-full object-cover'
						onError={() => setImageError(true)}
					/>
					<div className='absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/30' />
				</div>
			</section>

			{/* Main Content */}
			<section className='container mx-auto px-4 md:px-8'>
				<div className='relative -mt-32 z-10 flex flex-col gap-8 md:flex-row'>
					{/* Left Column - Poster */}
					<motion.div
						className='flex-shrink-0'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<div className='mx-auto w-[200px] md:sticky md:top-24 md:w-[270px]'>
							<img
								src={posterUrl}
								alt={title}
								className='w-full rounded-xl shadow-2xl'
							/>

							{/* ПРОВЕРКА: Показываем кнопку только если isAuthenticated === true */}
							{isAuthenticated && (
								<motion.button
									className='btn-primary mt-4 flex w-full items-center justify-center gap-2'
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={handleWatchlistToggle}
								>
									{inWatchlist ? (
										<>
											<Check className='h-5 w-5' />
											{t.hero.inList}
										</>
									) : (
										<>
											<Plus className='h-5 w-5' />
											{t.hero.addToList}
										</>
									)}
								</motion.button>
							)}
						</div>
					</motion.div>

					{/* Right Column - Info */}
					<motion.div
						className='flex-1 space-y-6'
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						{/* Title */}
						<h1 className='text-4xl font-bold text-white md:text-5xl'>
							{title}
						</h1>

						{/* Tagline */}
						{movie.tagline && (
							<p className='text-lg italic text-gray-400'>{movie.tagline}</p>
						)}

						{/* Metadata Row */}
						<div className='flex flex-wrap items-center gap-4 text-sm'>
							<span className='flex items-center gap-1.5 rounded-lg bg-yellow-500/20 px-3 py-1.5 font-semibold text-yellow-400'>
								<Star className='h-4 w-4 fill-yellow-400' />
								{rating}
							</span>
							<span className='flex items-center gap-1.5 text-gray-300'>
								<Calendar className='h-4 w-4' />
								{year}
							</span>
							{runtime > 0 && (
								<span className='flex items-center gap-1.5 text-gray-300'>
									<Clock className='h-4 w-4' />
									{runtime} min
								</span>
							)}
						</div>

						{/* Genres */}
						{movie.genres && movie.genres.length > 0 && (
							<div className='flex flex-wrap gap-2'>
								{movie.genres.map(genre => (
									<span
										key={genre.id}
										className='rounded-full bg-white/10 px-4 py-1.5 text-sm text-gray-200'
									>
										{genre.name}
									</span>
								))}
							</div>
						)}

						{/* Overview */}
						<div>
							<h2 className='mb-3 text-xl font-semibold text-white'>
								{t.common.overview}
							</h2>
							<p className='text-gray-300 leading-relaxed'>{movie.overview}</p>
						</div>

						{/* Details Grid */}
						<div className='grid grid-cols-2 gap-4 rounded-xl bg-white/5 p-5 md:grid-cols-4'>
							{movie.status && (
								<div>
									<p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
										Status
									</p>
									<p className='mt-1 text-sm text-white'>{movie.status}</p>
								</div>
							)}
							{movie.number_of_seasons && (
								<div>
									<p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
										{t.common.seasons}
									</p>
									<p className='mt-1 text-sm text-white'>
										{movie.number_of_seasons}
									</p>
								</div>
							)}
							{movie.number_of_episodes && (
								<div>
									<p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
										{t.common.episodes}
									</p>
									<p className='mt-1 text-sm text-white'>
										{movie.number_of_episodes}
									</p>
								</div>
							)}
							{movie.production_companies &&
								movie.production_companies.length > 0 && (
									<div>
										<p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
											Production
										</p>
										<p className='mt-1 text-sm text-white'>
											{movie.production_companies[0].name}
										</p>
									</div>
								)}
							{movie.budget && movie.budget > 0 && (
								<div>
									<p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
										Budget
									</p>
									<p className='mt-1 text-sm text-white'>
										${(movie.budget / 1000000).toFixed(0)}M
									</p>
								</div>
							)}
							{movie.revenue && movie.revenue > 0 && (
								<div>
									<p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
										Revenue
									</p>
									<p className='mt-1 text-sm text-white'>
										${(movie.revenue / 1000000).toFixed(0)}M
									</p>
								</div>
							)}
						</div>

						{/* Cast Section */}
						{movie.credits && movie.credits.cast.length > 0 && (
							<div>
								<h2 className='mb-4 text-xl font-semibold text-white'>
									{t.common.cast}
								</h2>
								<div className='scrollbar-hide flex gap-4 overflow-x-auto pb-2'>
									{movie.credits.cast.slice(0, 12).map(person => (
										<div
											key={person.id}
											className='flex-shrink-0 text-center'
											style={{ width: '80px' }}
										>
											<div className='mx-auto mb-2 h-20 w-20 overflow-hidden rounded-full bg-primary-light'>
												{person.profile_path ? (
													<img
														/* FIX: Изменили 'w185' на 'w500', чтобы TypeScript не ругался.
                               Размер 'w500' гарантированно есть в типах. */
														src={getImageUrl(person.profile_path, 'w500')}
														alt={person.name}
														className='h-full w-full object-cover'
													/>
												) : (
													<div className='flex h-full w-full items-center justify-center'>
														<User className='h-8 w-8 text-gray-600' />
													</div>
												)}
											</div>
											<p className='text-xs font-medium text-white line-clamp-1'>
												{person.name}
											</p>
											<p className='text-xs text-gray-500 line-clamp-1'>
												{person.character}
											</p>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Trailer */}
						{trailer && (
							<div>
								<h2 className='mb-4 text-xl font-semibold text-white'>
									{t.common.trailer}
								</h2>
								<div className='aspect-video overflow-hidden rounded-xl'>
									<iframe
										src={`https://www.youtube.com/embed/${trailer.key}`}
										title={trailer.name}
										className='h-full w-full'
										allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
										allowFullScreen
									/>
								</div>
							</div>
						)}
					</motion.div>
				</div>
			</section>

			{/* Similar Movies */}
			{movie.similar && movie.similar.results.length > 0 && (
				<div className='mt-12'>
					<SectionRow
						title={t.common.similar}
						movies={movie.similar.results}
						mediaType={mediaType}
					/>
				</div>
			)}
		</div>
	)
}
