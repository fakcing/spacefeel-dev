'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit2, Save, X, Mail, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import AuthModal from '@/components/AuthModal';
import MovieCard from '@/components/ui/MovieCard';
import { getMediaDetails } from '@/lib/tmdb';
import type { Movie } from '@/types';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail as firebaseUpdateEmail } from 'firebase/auth';

export default function ProfilePage() {
  const { language, isAuthenticated, user, updateProfile, items, notifications } = useStore();
  const t = getTranslation(language);

  const toastStyle = {
    background: '#18181b',
    color: '#fff',
    border: '1px solid #333',
  };

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Re-authentication modal state
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [reauthError, setReauthError] = useState<string | null>(null);
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [pendingEmailUpdate, setPendingEmailUpdate] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setDisplayName(user?.displayName || '');
      setEmail(user?.email || '');
      setBio(user?.bio || '');
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchWatchlistMovies = async () => {
      if (items.length === 0) {
        setWatchlistMovies([]);
        return;
      }

      setIsLoading(true);
      try {
        const moviePromises = items.map(async (item) => {
          const details = await getMediaDetails(item.id, item.mediaType, language);
          return details;
        });

        const movies = await Promise.all(moviePromises);
        setWatchlistMovies(movies.filter((m): m is Movie => m !== null));
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchWatchlistMovies();
    }
  }, [items, language, isAuthenticated]);

  const handleStartEditing = () => {
    setDisplayName(user?.displayName || '');
    setEmail(user?.email || '');
    setBio(user?.bio || '');
    setError(null);
    setSuccess(null);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setDisplayName(user?.displayName || '');
    setEmail(user?.email || '');
    setBio(user?.bio || '');
    setError(null);
    setIsEditing(false);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle re-authentication for Firebase
  const handleReauthenticate = async () => {
    if (!reauthPassword.trim()) {
      setReauthError(t.errors.emailRequired);
      return;
    }

    setIsReauthenticating(true);
    setReauthError(null);

    try {
      const auth = getFirebaseAuth();

      // If Firebase is not configured, just update the store
      if (!auth || !isFirebaseConfigured()) {
        if (pendingEmailUpdate) {
          await updateProfile({ email: pendingEmailUpdate });
          if (notifications) {
            toast.success(t.profile.profileUpdated, { style: toastStyle });
          }
        }
        setShowReauthModal(false);
        setReauthPassword('');
        setPendingEmailUpdate(null);
        setIsEditing(false);
        return;
      }

      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        throw new Error('No user is currently signed in');
      }

      // Create credential with current email and provided password
      const credential = EmailAuthProvider.credential(currentUser.email, reauthPassword);

      // Re-authenticate the user
      await reauthenticateWithCredential(currentUser, credential);

      // Now update the email
      if (pendingEmailUpdate) {
        await firebaseUpdateEmail(currentUser, pendingEmailUpdate);

        // Update the store as well
        await updateProfile({ email: pendingEmailUpdate });

        if (notifications) {
          toast.success(t.profile.profileUpdated, { style: toastStyle });
        }
      }

      // Close modal and reset state
      setShowReauthModal(false);
      setReauthPassword('');
      setPendingEmailUpdate(null);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Re-authentication error:', error);

      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setReauthError(t.errors.incorrectPassword);
      } else if (error.code === 'auth/too-many-requests') {
        setReauthError(t.errors.tooManyAttempts);
      } else if (error.code === 'auth/email-already-in-use') {
        setReauthError(t.errors.emailInUse);
      } else {
        setReauthError(error.message || t.errors.reauthFailed);
      }
    } finally {
      setIsReauthenticating(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      setError(t.errors.displayNameRequired);
      return;
    }

    if (!email.trim()) {
      setError(t.errors.emailRequired);
      return;
    }

    if (!validateEmail(email.trim())) {
      setError(t.errors.invalidEmail);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updates: { displayName?: string; email?: string; photoURL?: string; bio?: string } = {};
      let hasNameChange = false;
      let hasEmailChange = false;
      let hasBioChange = false;

      // Check if display name changed
      if (displayName.trim() !== user?.displayName) {
        updates.displayName = displayName.trim();
        // Update avatar URL with new name
        updates.photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName.trim())}&background=3b82f6&color=fff`;
        hasNameChange = true;
      }

      // Check if bio changed
      if (bio.trim() !== (user?.bio || '')) {
        updates.bio = bio.trim();
        hasBioChange = true;
      }

      // Check if email changed
      if (email.trim() !== user?.email) {
        hasEmailChange = true;
      }

      // Update display name and bio first (doesn't require re-auth)
      if (hasNameChange || hasBioChange) {
        await updateProfile(updates);
      }

      // Handle email change with Firebase
      if (hasEmailChange) {
        const auth = getFirebaseAuth();
        const currentUser = auth?.currentUser;

        if (auth && currentUser && isFirebaseConfigured()) {
          try {
            // Try to update email directly
            await firebaseUpdateEmail(currentUser, email.trim());
            await updateProfile({ email: email.trim() });
            if (notifications) {
              toast.success(t.profile.profileUpdated, { style: toastStyle });
            }
            setIsEditing(false);
          } catch (emailError: any) {
            // Check if re-authentication is required
            if (emailError.code === 'auth/requires-recent-login') {
              // Store pending email and show re-auth modal
              setPendingEmailUpdate(email.trim());
              setShowReauthModal(true);
              setIsSaving(false);

              // If name was updated, show partial success
              if (hasNameChange || hasBioChange) {
                if (notifications) {
                  toast.success(t.errors.nameUpdatedVerifyEmail, { style: toastStyle });
                }
              }
              return;
            } else if (emailError.code === 'auth/email-already-in-use') {
              setError(t.errors.emailInUse);
            } else if (emailError.code === 'auth/invalid-email') {
              setError(t.errors.invalidEmail);
            } else {
              setError(emailError.message || t.errors.updateFailed);
            }
            setIsSaving(false);
            return;
          }
        } else {
          // No Firebase user, just update the store (for mock auth)
          await updateProfile({ email: email.trim() });
          if (notifications) {
            toast.success(t.profile.profileUpdated, { style: toastStyle });
          }
          setIsEditing(false);
        }
      } else if (hasNameChange || hasBioChange) {
        if (notifications) {
          toast.success(t.profile.profileUpdated, { style: toastStyle });
        }
        setIsEditing(false);
      } else {
        // No changes
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || t.errors.updateFailed);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-white">{t.auth.pleaseLogin}</h1>
            <p className="text-gray-400">{t.auth.needLoginToView}</p>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <section className="glass-navbar border-b border-white/10 py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-accent">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-16 w-16 text-white" />
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  {/* Display Name Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">{t.auth.displayName}</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50 max-w-md"
                      placeholder={t.auth.displayName}
                    />
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t.auth.email}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50 max-w-md"
                      placeholder={t.auth.email}
                    />
                    <p className="text-xs text-gray-500">
                      {t.profile.emailChangeNote}
                    </p>
                  </div>

                  {/* Bio Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">{t.profile.bio}</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50 max-w-md resize-none"
                      placeholder={t.profile.bioPlaceholder}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-400 text-sm"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 md:flex-row">
                    <motion.button
                      className="btn-primary flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                      {t.profile.save}
                    </motion.button>
                    <motion.button
                      className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-gray-300 hover:bg-white/5"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancelEditing}
                      disabled={isSaving}
                    >
                      <X className="h-5 w-5" />
                      {t.profile.cancel}
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col items-center gap-3 md:flex-row">
                    <h1 className="text-4xl font-bold text-white">{user?.displayName}</h1>
                    <motion.button
                      className="flex items-center gap-2 text-accent hover:text-accent-hover"
                      whileHover={{ scale: 1.05 }}
                      onClick={handleStartEditing}
                    >
                      <Edit2 className="h-5 w-5" />
                      {t.profile.editProfile}
                    </motion.button>
                  </div>
                  <p className="flex items-center justify-center gap-2 text-gray-400 md:justify-start">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </p>
                  {user?.bio && (
                    <p className="text-gray-300 mt-2 max-w-lg text-center md:text-left">
                      {user.bio}
                    </p>
                  )}

                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-green-400 text-sm"
                    >
                      {success}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:px-8">
        <h2 className="mb-8 text-3xl font-bold text-white">{t.profile.myList}</h2>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton aspect-[2/3] w-full rounded-xl" />
                <div className="skeleton h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
        ) : watchlistMovies.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-xl text-gray-400">{t.profile.emptyWatchlist}</p>
            <p className="mt-2 text-sm text-gray-500">
              {t.profile.emptyWatchlistHint}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {watchlistMovies.map((movie) => {
              const item = items.find((i) => i.id === movie.id);
              return (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  mediaType={item?.mediaType || 'movie'}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Re-authentication Modal */}
      <AnimatePresence>
        {showReauthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => {
              setShowReauthModal(false);
              setReauthPassword('');
              setReauthError(null);
              setPendingEmailUpdate(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                  <Lock className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t.profile.verifyIdentity}</h3>
                <p className="mt-2 text-sm text-gray-400">
                  {t.profile.verifyIdentityDesc}
                </p>
              </div>

              <div className="space-y-4">
                {/* Current Email Display */}
                <div className="rounded-lg bg-white/5 px-4 py-3">
                  <p className="text-xs text-gray-500 mb-1">{t.profile.currentEmail}</p>
                  <p className="text-sm text-white">{user?.email}</p>
                </div>

                {/* New Email Display */}
                <div className="rounded-lg bg-accent/10 border border-accent/30 px-4 py-3">
                  <p className="text-xs text-accent mb-1">{t.profile.newEmail}</p>
                  <p className="text-sm text-white">{pendingEmailUpdate}</p>
                </div>

                {/* Password Input */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={reauthPassword}
                    onChange={(e) => setReauthPassword(e.target.value)}
                    placeholder={t.profile.enterPassword}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleReauthenticate();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Error Message */}
                {reauthError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-400 text-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {reauthError}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowReauthModal(false);
                      setReauthPassword('');
                      setReauthError(null);
                      setPendingEmailUpdate(null);
                    }}
                    className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-white transition-colors hover:bg-white/5"
                    disabled={isReauthenticating}
                  >
                    {t.profile.cancel}
                  </button>
                  <motion.button
                    onClick={handleReauthenticate}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isReauthenticating}
                  >
                    {isReauthenticating ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    {t.profile.verifyAndUpdate}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
