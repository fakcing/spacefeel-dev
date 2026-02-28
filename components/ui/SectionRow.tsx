'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MovieCard from './MovieCard'
import type { SectionRowProps } from '@/types'

export default function SectionRow({
	title,
	movies,
	mediaType = 'movie',
	isLoading = false,
}: SectionRowProps) {
	const scrollRef = useRef<HTMLDivElement>(null)

	const scroll = (direction: 'left' | 'right') => {
		if (scrollRef.current) {
			const scrollAmount = scrollRef.current.clientWidth * 0.8
			scrollRef.current.scrollBy({
				left: direction === 'left' ? -scrollAmount : scrollAmount,
				behavior: 'smooth',
			})
		}
	}

	if (isLoading) {
		return (
			<section className='space-y-4 py-8'>
				<div className='px-4 md:px-8'>
					<div className='skeleton h-8 w-48 rounded-lg' />
				</div>
				<div className='relative px-4 md:px-8'>
					<div className='flex gap-4 overflow-hidden'>
						{[...Array(6)].map((_, i) => (
							<div
								key={i}
								className='w-[160px] flex-shrink-0 space-y-3 md:w-[200px]'
							>
								<div className='skeleton aspect-[2/3] w-full rounded-xl' />
								<div className='skeleton h-4 w-3/4 rounded' />
								<div className='skeleton h-3 w-1/2 rounded' />
							</div>
						))}
					</div>
				</div>
			</section>
		)
	}

	if (!movies || movies.length === 0) {
		return null
	}

	return (
		<section className='group/section relative py-2'>
			<div className='px-4 md:px-8'>
				<h2 className='text-2xl font-bold text-white md:text-3xl'>{title}</h2>
			</div>

			<div className='relative'>
				{/* Left fade gradient */}
				<div className='absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-primary to-transparent pointer-events-none md:w-16' />

				{/* Right fade gradient */}
				<div className='absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-primary to-transparent pointer-events-none md:w-16' />

				{/* Left navigation button */}
				<button
					className='absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-xl opacity-0 transition-all duration-300 hover:bg-black/80 hover:scale-110 active:scale-95 group-hover/section:opacity-100 md:flex'
					onClick={() => scroll('left')}
				>
					<ChevronLeft className='h-6 w-6 text-white' />
				</button>

				{/* Right navigation button */}
				<button
					className='absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-xl opacity-0 transition-all duration-300 hover:bg-black/80 hover:scale-110 active:scale-95 group-hover/section:opacity-100 md:flex'
					onClick={() => scroll('right')}
				>
					<ChevronRight className='h-6 w-6 text-white' />
				</button>

				<div
					ref={scrollRef}
					className='scrollbar-hide flex gap-4 overflow-x-auto px-4 py-10 md:px-8'
					style={{
						scrollbarWidth: 'none',
						msOverflowStyle: 'none',
					}}
				>
					{movies.map(movie => (
						<div
							key={movie.id}
							className='w-[160px] flex-shrink-0 md:w-[200px]'
						>
							<MovieCard movie={movie} mediaType={mediaType} />
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
