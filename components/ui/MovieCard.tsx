'use client'

import { motion } from 'framer-motion'
import { Plus, Check } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { MovieCardProps } from '@/types'
import { getImageUrl } from '@/lib/tmdb'
import { useStore } from '@/store/useStore'
import { getTranslation } from '@/lib/i18n'
import { useState } from 'react'

export default function MovieCard({
	movie,
	mediaType = 'movie',
}: MovieCardProps) {
	const [imageError, setImageError] = useState(false)
	const {
		language,
		addToWatchlist,
		removeFromWatchlist,
		isInWatchlist,
		isAuthenticated,
		notifications,
	} = useStore()
	const t = getTranslation(language)

	const title =
		movie.title ||
		movie.name ||
		movie.original_title ||
		movie.original_name ||
		'Untitled'
	const year = (movie.release_date || movie.first_air_date || '').split('-')[0]
	const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'
	const inWatchlist = isInWatchlist(movie.id)

	const toastStyle = {
		background: '#18181b',
		color: '#fff',
		border: '1px solid #333',
	}

	const handleWatchlistToggle = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		if (inWatchlist) {
			removeFromWatchlist(movie.id)
			if (notifications) {
				toast.error(t.hero.removedFromWatchlist, { style: toastStyle })
			}
		} else {
			addToWatchlist(movie.id, mediaType)
			if (notifications) {
				toast.success(t.hero.addedToWatchlist, { style: toastStyle })
			}
		}
	}

	const posterUrl = imageError
		? '/placeholder-movie.jpg'
		: getImageUrl(movie.poster_path, 'w500')

	return (
		<Link href={`/${mediaType}/${movie.id}`}>
			<motion.div
				className='group relative cursor-pointer'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				whileHover={{ scale: 1.02, zIndex: 10 }}
				transition={{ duration: 0.3, ease: 'easeOut' }}
			>
				{/* FIX: Добавлен style с WebkitMaskImage. 
           Это "ядерное" решение, которое заставляет браузер уважать border-radius 
           даже при трансформации scale.
        */}
				<div
					className='relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-800 shadow-lg isolate'
					style={{
						transform: 'translateZ(0)',
						WebkitMaskImage: '-webkit-radial-gradient(white, black)',
					}}
				>
					<img
						src={posterUrl}
						alt={title}
						className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
						onError={() => setImageError(true)}
						loading='lazy'
					/>

					{/* Затемнение фона при наведении */}
					<div className='absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

					{/* Кнопка действий (только если авторизован) */}
					{isAuthenticated && (
						<div className='absolute inset-0 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto'>
							<motion.button
								className='flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 hover:bg-white/40 transition-all shadow-xl scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
								style={{ transitionDuration: '200ms' }}
								whileTap={{ scale: 0.9 }}
								onClick={handleWatchlistToggle}
							>
								{inWatchlist ? (
									<Check className='h-6 w-6' />
								) : (
									<Plus className='h-6 w-6' />
								)}
							</motion.button>
						</div>
					)}

					{/* Рейтинг справа сверху */}
					<div className='absolute right-2 top-2 z-20 rounded-md bg-black/70 px-2 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10'>
						⭐ {rating}
					</div>
				</div>

				{/* Текст под карточкой */}
				<div className='mt-3 space-y-1 px-1'>
					<h3 className='line-clamp-1 text-base font-medium text-white transition-colors group-hover:text-blue-500'>
						{title}
					</h3>
					<p className='text-sm text-gray-400'>{year}</p>
				</div>
			</motion.div>
		</Link>
	)
}
