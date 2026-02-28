'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	Settings,
	User,
	Bell,
	Globe,
	ChevronRight,
	AlertCircle,
	Trash2,
	Download,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getTranslation } from '@/lib/i18n'
import { useRouter } from 'next/navigation'
import type { Language } from '@/types'

export default function SettingsPage() {
	const router = useRouter()

	// Берем тільки те, що лишилося
	const {
		language,
		setLanguage,
		isAuthenticated,
		user,
		notifications,
		setNotifications,
	} = useStore()

	const t = getTranslation(language)
	const [activeSection, setActiveSection] = useState<
		'account' | 'notifications'
	>('account')

	const [showLanguageModal, setShowLanguageModal] = useState(false)
	const [showDeleteModal, setShowDeleteModal] = useState(false)

	useEffect(() => {
		if (!isAuthenticated) router.push('/profile')
	}, [isAuthenticated, router])

	const languages: {
		code: Language
		label: string
		flag: string
		nativeName: string
	}[] = [
		{ code: 'uk', label: 'Ukrainian', flag: '🇺🇦', nativeName: 'Українська' },
		{ code: 'ru', label: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
		{ code: 'en', label: 'English', flag: '🇺🇸', nativeName: 'English' },
		{ code: 'pl', label: 'Polish', flag: '🇵🇱', nativeName: 'Polski' },
		{ code: 'de', label: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
		{ code: 'fr', label: 'French', flag: '🇫🇷', nativeName: 'Français' },
		{ code: 'es', label: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
	]

	const handleLanguageChange = (lang: Language) => {
		setLanguage(lang)
		setShowLanguageModal(false)
	}

	const AnimatedToggleSwitch = ({
		enabled,
		onChange,
	}: {
		enabled: boolean
		onChange: (v: boolean) => void
	}) => (
		<motion.button
			onClick={() => onChange(!enabled)}
			className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
				enabled ? 'bg-accent' : 'bg-zinc-700'
			}`}
			whileTap={{ scale: 0.95 }}
		>
			<motion.span
				className='inline-block h-5 w-5 rounded-full bg-white shadow-lg'
				animate={{ x: enabled ? 26 : 4 }}
				transition={{ type: 'spring', stiffness: 500, damping: 30 }}
			/>
		</motion.button>
	)

	const sidebarItems = [
		{ id: 'account', label: t.settings.account, icon: User },
		{ id: 'notifications', label: t.settings.notifications, icon: Bell },
	] as const

	const currentLanguage = languages.find(l => l.code === language)

	if (!isAuthenticated) return null

	return (
		<div className='min-h-screen pb-16 pt-24 bg-[#09090b] text-white'>
			<div className='container mx-auto px-4 md:px-8'>
				<div className='mb-8'>
					<h1 className='flex items-center gap-3 text-4xl font-bold'>
						<Settings className='h-10 w-10 text-accent' />
						{t.profile.settings}
					</h1>
				</div>

				<div className='flex flex-col gap-8 lg:flex-row'>
					{/* Sidebar */}
					<aside className='w-full lg:w-64 shrink-0'>
						<div className='overflow-hidden rounded-xl border border-white/10 bg-white/5'>
							{sidebarItems.map(item => (
								<button
									key={item.id}
									onClick={() => setActiveSection(item.id)}
									className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
										activeSection === item.id
											? 'bg-accent text-white'
											: 'text-gray-300 hover:bg-white/5'
									}`}
								>
									<item.icon className='h-5 w-5' />
									<span className='text-sm font-medium'>{item.label}</span>
								</button>
							))}
						</div>
					</aside>

					{/* Main Content */}
					<main className='flex-1'>
						{activeSection === 'account' && (
							<div className='space-y-6'>
								<div className='p-6 rounded-xl border border-white/10 bg-white/5'>
									<h2 className='mb-6 text-xl font-semibold flex items-center gap-2'>
										<User className='text-accent' size={20} />{' '}
										{t.settings.account}
									</h2>

									{/* Language */}
									<div className='flex justify-between items-center'>
										<div>
											<p className='font-medium text-white'>{t.settings.language}</p>
											<p className='text-sm text-zinc-400'>{t.settings.systemLanguage}</p>
										</div>
										<button
											onClick={() => setShowLanguageModal(true)}
											className='flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-lg border border-white/10'
										>
											<span>{currentLanguage?.flag}</span>
											<span>{currentLanguage?.nativeName}</span>
											<ChevronRight className='h-4 w-4' />
										</button>
									</div>
								</div>

								{/* Delete Account Zone */}
								<div className='p-6 rounded-xl border border-red-500/20 bg-red-900/10'>
									<h2 className='mb-6 text-xl font-semibold flex items-center gap-2'>
										<Download className='text-red-500' size={20} /> {t.settings.dataZone}
									</h2>
									<button
										onClick={() => setShowDeleteModal(true)}
										className='w-full flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-black/20 hover:bg-red-500/10 text-red-400 transition-colors'
									>
										<div className='flex items-center gap-3'>
											<Trash2 size={20} />
											<div className='text-left'>
												<p className='font-medium'>{t.settings.deleteAccount}</p>
												<p className='text-xs opacity-70'>
													{t.settings.deleteAccountDesc}
												</p>
											</div>
										</div>
										<ChevronRight />
									</button>
								</div>
							</div>
						)}

						{/* NOTIFICATIONS */}
						{activeSection === 'notifications' && (
							<div className='p-6 rounded-xl border border-white/10 bg-white/5'>
								<h2 className='mb-6 text-xl font-semibold flex items-center gap-2'>
									<Bell className='text-accent' size={20} />{' '}
									{t.settings.notifications}
								</h2>
								<div className='flex justify-between items-center'>
									<div>
										<p className='font-medium text-white'>
											{t.settings.popupNotifications}
										</p>
										<p className='text-sm text-zinc-400'>
											{t.settings.popupNotificationsDesc}
										</p>
									</div>
									<AnimatedToggleSwitch
										enabled={notifications}
										onChange={setNotifications}
									/>
								</div>
							</div>
						)}
					</main>
				</div>
			</div>

			{/* Modals */}
			<AnimatePresence>
				{showLanguageModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'
						onClick={() => setShowLanguageModal(false)}
					>
						<motion.div
							initial={{ scale: 0.95 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.95 }}
							className='w-full max-w-sm rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-2xl'
							onClick={e => e.stopPropagation()}
						>
							<h3 className='mb-4 text-xl font-bold text-white text-center'>
								{t.profile.language}
							</h3>
							<div className='space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar'>
								{languages.map(lang => (
									<button
										key={lang.code}
										onClick={() => handleLanguageChange(lang.code)}
										className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-all ${
											language === lang.code
												? 'bg-accent text-white shadow-lg'
												: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
										}`}
									>
										<span className='text-2xl'>{lang.flag}</span>
										<span className='flex-1 text-left font-medium'>
											{lang.nativeName}
										</span>
									</button>
								))}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{showDeleteModal && (
					<motion.div
						className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'
						onClick={() => setShowDeleteModal(false)}
					>
						<div className='bg-zinc-900 border border-red-900 p-6 rounded-xl text-center'>
							<h3 className='text-white text-xl font-bold'>{t.settings.deleteAccount}?</h3>
							<p className='text-gray-400 my-4'>
								{t.settings.featureDisabled}
							</p>
							<button
								onClick={() => setShowDeleteModal(false)}
								className='bg-zinc-800 text-white px-4 py-2 rounded'
							>
								{t.settings.close}
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
