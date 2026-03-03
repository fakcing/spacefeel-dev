'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
	Search,
	User,
	LogOut,
	Menu,
	X,
	Globe,
	List,
	Settings,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getTranslation, translations } from '@/lib/i18n'
import type { Language } from '@/types'

function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)
		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])
	return debouncedValue
}

export default function Navbar() {
	const pathname = usePathname()
	const router = useRouter()
	const searchParams = useSearchParams()
	const { language, setLanguage, isAuthenticated, user, logout } = useStore()

	const t = getTranslation(language as any) || translations['en']

	const [scrolled, setScrolled] = useState(false)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const [searchOpen, setSearchOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	// Стейт для запоминания, откуда мы пришли
	const [previousPath, setPreviousPath] = useState<string | null>(null)

	const [langMenuOpen, setLangMenuOpen] = useState(false)
	const [userMenuOpen, setUserMenuOpen] = useState(false)

	const searchInputRef = useRef<HTMLInputElement>(null)
	const searchContainerRef = useRef<HTMLDivElement>(null)

	const debouncedSearchQuery = useDebounce(searchQuery, 400)
	const prevDebouncedQueryRef = useRef(debouncedSearchQuery)

	// 1. ЛОГИКА ОТКРЫТИЯ ПОИСКА
	const handleOpenSearch = () => {
		// Если мы НЕ на странице поиска, запоминаем текущий путь
		if (!pathname.startsWith('/search')) {
			setPreviousPath(pathname)
		}
		setSearchOpen(true)
	}

	// 2. СИНХРОНИЗАЦИЯ С URL (При загрузке страницы)
	useEffect(() => {
		if (pathname.startsWith('/search') && !searchOpen) {
			const query = searchParams.get('q') || ''
			if (query) {
				setSearchQuery(query)
				setSearchOpen(true)
			}
		}
	}, [searchParams, pathname]) // searchOpen убран намеренно

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 50)
		}
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	useEffect(() => {
		if (searchOpen && searchInputRef.current) {
			searchInputRef.current.focus()
		}
	}, [searchOpen])

	// 3. ГЛАВНАЯ ЛОГИКА (LIVE SEARCH + ВОЗВРАТ)
	useEffect(() => {
		if (!searchOpen) return

		const queryChanged = prevDebouncedQueryRef.current !== debouncedSearchQuery
		prevDebouncedQueryRef.current = debouncedSearchQuery

		// А. Если есть текст
		if (debouncedSearchQuery.trim()) {
			const url = `/search?q=${encodeURIComponent(debouncedSearchQuery.trim())}`
			if (queryChanged) {
				// Пользователь печатает -> переходим на поиск (или синхронизируем URL)
				router.push(url)
			}
			// Если queryChanged=false, значит pathname изменился (пользователь кликнул на фильм)
			// -> не перенаправляем обратно
		}
		// Б. Если текст удалили И мы сейчас на поиске -> возвращаемся назад
		else if (debouncedSearchQuery === '' && pathname.startsWith('/search')) {
			const targetPath =
				previousPath && !previousPath.startsWith('/search')
					? previousPath
					: '/'
			router.push(targetPath)
		}
	}, [debouncedSearchQuery, pathname, router, searchOpen, previousPath])

	// 4. Закрытие при клике вне
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement

			if (!target.closest('.dropdown-container')) {
				setLangMenuOpen(false)
				setUserMenuOpen(false)
			}

			if (
				searchOpen &&
				searchContainerRef.current &&
				!searchContainerRef.current.contains(target)
			) {
				// Если поле пустое - закрываем
				if (searchQuery.trim() === '') {
					setSearchOpen(false)
				}
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [searchOpen, searchQuery])

	const navLinks = [
		{ label: t.nav.home, href: '/' },
		{ label: t.nav.movies, href: '/movies' },
		{ label: t.nav.series, href: '/tv' },
		{ label: t.nav.anime, href: '/anime' },
		{ label: t.nav.cartoons, href: '/cartoons' },
	]

	const languages: { code: Language; label: string; flag: string }[] = [
		{ code: 'uk', label: 'Українська', flag: '🇺🇦' },
		{ code: 'ru', label: 'Русский', flag: '🇷🇺' },
		{ code: 'en', label: 'English', flag: '🇺🇸' },
		{ code: 'pl', label: 'Polski', flag: '🇵🇱' },
		{ code: 'de', label: 'Deutsch', flag: '🇩🇪' },
		{ code: 'fr', label: 'Français', flag: '🇫🇷' },
		{ code: 'es', label: 'Español', flag: '🇪🇸' },
	]

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value)
		// Убрали отсюда всю логику роутинга, всё делает useEffect выше
	}

	// 5. Очистка при переходе по вкладкам
	const clearSearchOnNavigate = () => {
		setSearchOpen(false) // Сразу закрываем поиск, чтобы useEffect перестал работать
		setMobileMenuOpen(false)

		// Очищаем текст с небольшой задержкой для красоты (не обязательно, но приятно)
		setTimeout(() => {
			setSearchQuery('')
		}, 300)
	}

	return (
		<motion.nav
			className={`glass-navbar fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className='container mx-auto px-4 md:px-8'>
				<div className='flex items-center justify-between'>
					<Link href='/' onClick={clearSearchOnNavigate}>
						<motion.div
							className='text-2xl font-bold text-white md:text-3xl'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							space<span className='text-accent'>feel</span>
						</motion.div>
					</Link>

					<div className='hidden items-center gap-8 md:flex'>
						{navLinks.map(link => (
							<Link
								key={link.href}
								href={link.href}
								onClick={clearSearchOnNavigate} // Клик по ссылке блокирует поиск
							>
								<motion.span
									className={`cursor-pointer text-sm font-medium transition-colors ${pathname === link.href ? 'text-accent' : 'text-gray-300 hover:text-white'}`}
									whileHover={{ scale: 1.05 }}
								>
									{link.label}
								</motion.span>
							</Link>
						))}
					</div>

					<div className='flex items-center gap-4'>
						<div
							ref={searchContainerRef}
							className='relative flex items-center justify-end h-9 w-9'
						>
							<AnimatePresence
								mode='popLayout'
								onExitComplete={() => {
									if (!pathname.startsWith('/search')) {
										setSearchQuery('')
									}
								}}
							>
								{searchOpen && (
									<motion.div
										key="search-input"
										initial={{ width: 0, opacity: 0, scale: 0.95 }}
										animate={{ width: 260, opacity: 1, scale: 1 }}
										exit={{ width: 0, opacity: 0, scale: 0.95 }}
										transition={{
											duration: 0.3,
											ease: [0.4, 0, 0.2, 1],
										}}
										className='absolute right-0 top-0 flex items-center gap-2 overflow-hidden bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-full px-3 h-9 whitespace-nowrap origin-right'
									>
										<Search className='h-4 w-4 text-gray-400 flex-shrink-0' />
										<input
											ref={searchInputRef}
											type='text'
											value={searchQuery}
											onChange={handleSearchChange}
											placeholder={t.search.placeholder}
											className='w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none min-w-[150px]'
										/>
									</motion.div>
								)}
							</AnimatePresence>

							<AnimatePresence mode='popLayout'>
								{!searchOpen && (
									<motion.button
										key="search-button"
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.8 }}
										transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
										onClick={handleOpenSearch}
										whileHover={{ scale: 1.1 }}
										className='text-white h-9 w-9 flex items-center justify-center'
									>
										<Search className='h-5 w-5' />
									</motion.button>
								)}
							</AnimatePresence>
						</div>

						<div className='dropdown-container relative hidden md:block'>
							<button
								className='h-9 w-9 flex items-center justify-center text-white hover:text-accent transition-colors'
								onClick={e => {
									e.preventDefault()
									e.stopPropagation()
									setLangMenuOpen(prev => !prev)
									setUserMenuOpen(false)
								}}
							>
								<Globe className='h-5 w-5 pointer-events-none' />
							</button>
							<AnimatePresence>
								{langMenuOpen && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 10 }}
										className='absolute right-0 top-full mt-4 w-44 bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl'
									>
										{languages.map(l => (
											<button
												key={l.code}
												onClick={() => {
													setLanguage(l.code)
													setLangMenuOpen(false)
												}}
												className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition ${
													language === l.code
														? 'bg-accent text-white'
														: 'text-gray-400 hover:bg-white/5'
												}`}
											>
												<span>{l.flag}</span> {l.label}
											</button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{isAuthenticated ? (
							<div className='dropdown-container relative'>
								<button
									onClick={e => {
										e.preventDefault()
										e.stopPropagation()
										setUserMenuOpen(prev => !prev)
										setLangMenuOpen(false)
									}}
									className='h-9 w-9 rounded-full bg-accent flex items-center justify-center overflow-hidden border border-white/10'
								>
									{user?.photoURL ? (
										<img
											src={user.photoURL}
											alt=''
											className='h-full w-full object-cover pointer-events-none'
										/>
									) : (
										<User className='h-5 w-5 text-white pointer-events-none' />
									)}
								</button>
								<AnimatePresence>
									{userMenuOpen && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											className='absolute right-0 top-full mt-4 w-48 bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl'
										>
											<Link
												href='/profile'
												className='flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition'
												onClick={() => {
													setUserMenuOpen(false)
													clearSearchOnNavigate()
												}}
											>
												<User size={16} /> {t.nav.profile}
											</Link>
											<Link
												href='/my-list'
												className='flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition'
												onClick={() => {
													setUserMenuOpen(false)
													clearSearchOnNavigate()
												}}
											>
												<List size={16} /> {t.profile.myList}
											</Link>
											<Link
												href='/settings'
												className='flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition'
												onClick={() => {
													setUserMenuOpen(false)
													clearSearchOnNavigate()
												}}
											>
												<Settings size={16} /> {t.profile.settings}
											</Link>
											<button
												onClick={() => {
													logout()
													setUserMenuOpen(false)
													clearSearchOnNavigate()
												}}
												className='w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 border-t border-white/5 transition'
											>
												<LogOut size={16} /> {t.nav.logout}
											</button>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						) : (
							<Link
								href='/profile'
								className='bg-accent hover:bg-accent/90 text-white text-xs font-bold px-5 py-2 rounded-full transition'
							>
								{t.auth.login}
							</Link>
						)}

						<button
							className='md:hidden text-white'
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Menu */}
			<AnimatePresence>
				{mobileMenuOpen && (
					<motion.div
						className='md:hidden bg-zinc-950 border-t border-white/10'
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
					>
						<div className='flex flex-col p-4 space-y-2'>
							{navLinks.map(link => (
								<Link
									key={link.href}
									href={link.href}
									onClick={clearSearchOnNavigate}
								>
									<div
										className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${pathname === link.href ? 'bg-accent text-white' : 'text-gray-300 hover:bg-white/10'}`}
									>
										{link.label}
									</div>
								</Link>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.nav>
	)
}
