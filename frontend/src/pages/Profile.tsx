import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Camera, Save, X, Loader2, Shield, Crown, CreditCard, MapPin, Briefcase, Linkedin, Github, Globe2 } from 'lucide-react';
import { api } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import PayPalButton from '@/components/PayPalButton';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { t } = useI18n();
  const toast = useToastStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    coverPhoto: '',
    email: '',
    role: '',
    bio: '',
    headline: '',
    location: '',
    yearsOfExperience: '' as string | '',
    currentRole: '',
    industries: '',
    skills: '',
    linkedin: '',
    github: '',
    portfolio: '',
    isPublicProfile: true,
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    avatar: '',
    coverPhoto: '',
    email: '',
    role: '',
    bio: '',
    headline: '',
    location: '',
    yearsOfExperience: '' as string | '',
    currentRole: '',
    industries: '',
    skills: '',
    linkedin: '',
    github: '',
    portfolio: '',
    isPublicProfile: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Check if form has changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  // Get current avatar for display - prioritize formData (latest upload) then user data
  const currentAvatar = (formData.avatar?.trim() || user?.avatar?.trim() || '').trim();

  useEffect(() => {
    if (user) {
      const initialData = {
        name: user.name || '',
        avatar: user.avatar || '',
        coverPhoto: (user as any).coverPhoto || '',
        email: user.email || '',
        role: user.role || 'user',
        bio: user.bio || '',
        headline: user.headline || '',
        location: user.location || '',
        yearsOfExperience: user.yearsOfExperience != null ? String(user.yearsOfExperience) : '',
        currentRole: user.currentRole || '',
        industries: (user.industries || []).join(', '),
        skills: (user.skills || []).join(', '),
        linkedin: user.socialLinks?.linkedin || '',
        github: user.socialLinks?.github || '',
        portfolio: user.socialLinks?.portfolio || '',
        isPublicProfile: user.isPublicProfile !== false,
      };
      setFormData(initialData);
      setOriginalData(initialData);
      if (user.subscription) {
        setSubscription(user.subscription);
      }
    }
    fetchSubscriptionStatus();
  }, [user]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.getSubscriptionStatus();
      if (response.success) {
        setSubscription(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    }
  };

  const handleUpgradeToPremium = async () => {
    setLoadingSubscription(true);
    try {
      const response = await api.createCheckoutSession();
      if (response.success && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      toast.error(error.message || t('toast.somethingWentWrong'));
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.selectImageFile'));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageTooLarge'));
      return;
    }

    // Use setTimeout to avoid blocking UI
    setUploading(true);
    setTimeout(() => {
      handleAvatarUpload(file);
    }, 0);
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('avatar', file);

      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      // Get API base URL - handle both cases: with and without /api
      let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      // Remove trailing /api if present to avoid duplication
      if (apiBaseUrl.endsWith('/api')) {
        apiBaseUrl = apiBaseUrl.slice(0, -4);
      }
      
      const response = await fetch(`${apiBaseUrl}/api/upload/avatar`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type - browser will set it automatically with boundary for FormData
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Upload failed' };
        }
        throw new Error(errorData.message || errorData.error || t('profile.uploadFailed'));
      }

      const data = await response.json();

      if (data.success && data.data?.url) {
        // Construct full URL - data.data.url is like "/uploads/avatar-xxx.jpg"
        let avatarUrl = data.data.url;
        
        // If URL doesn't start with http, prepend API base URL
        if (!avatarUrl.startsWith('http')) {
          // Remove trailing slash from apiBaseUrl if present
          const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
          // Ensure url starts with /
          const urlPath = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
          avatarUrl = `${baseUrl}${urlPath}`;
        }
        
        // Update form data immediately with timestamp to force re-render
        const avatarUrlWithTimestamp = avatarUrl + (avatarUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
        const updatedFormData = { ...formData, avatar: avatarUrlWithTimestamp };
        setFormData(updatedFormData);
        setOriginalData({ ...updatedFormData, avatar: avatarUrl }); // Store without timestamp in originalData
        
        // Also update user in store immediately for instant display
        if (user) {
          setUser({ ...user, avatar: avatarUrl });
        }
        
        toast.success(t('profile.avatarUploaded'));
      } else {
        throw new Error(data.message || data.error || t('profile.uploadFailed'));
      }
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || t('profile.uploadFailed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCoverPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.selectImageFile'));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageTooLarge'));
      return;
    }

    // Use setTimeout to avoid blocking UI
    setUploadingCover(true);
    setTimeout(() => {
      handleCoverPhotoUpload(file);
    }, 0);
  };

  const handleCoverPhotoUpload = async (file: File) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('coverPhoto', file);

      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      // Get API base URL - handle both cases: with and without /api
      let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      // Remove trailing /api if present to avoid duplication
      if (apiBaseUrl.endsWith('/api')) {
        apiBaseUrl = apiBaseUrl.slice(0, -4);
      }
      
      const response = await fetch(`${apiBaseUrl}/api/upload/cover-photo`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Upload failed' };
        }
        throw new Error(errorData.message || errorData.error || t('profile.uploadFailed'));
      }

      const data = await response.json();

      if (data.success && data.data?.url) {
        // Construct full URL
        let coverPhotoUrl = data.data.url;
        
        if (!coverPhotoUrl.startsWith('http')) {
          const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
          const urlPath = coverPhotoUrl.startsWith('/') ? coverPhotoUrl : `/${coverPhotoUrl}`;
          coverPhotoUrl = `${baseUrl}${urlPath}`;
        }
        
        // Update form data immediately
        const updatedFormData = { ...formData, coverPhoto: coverPhotoUrl };
        setFormData(updatedFormData);
        setOriginalData(updatedFormData);
        
        // Also update user in store
        if (user) {
          setUser({ ...user, coverPhoto: coverPhotoUrl } as any);
        }
        
        toast.success('Ảnh bìa đã được tải lên');
      } else {
        throw new Error(data.message || data.error || t('profile.uploadFailed'));
      }
    } catch (error: any) {
      console.error('Cover photo upload error:', error);
      toast.error(error.message || t('profile.uploadFailed'));
    } finally {
      setUploadingCover(false);
      if (coverPhotoInputRef.current) {
        coverPhotoInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData(originalData);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsLoading(true);

    try {
      const industriesArray = formData.industries
        ? formData.industries.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const skillsArray = formData.skills
        ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const response = await api.updateProfile({
        name: formData.name,
        avatar: formData.avatar?.trim() || undefined,
        coverPhoto: formData.coverPhoto?.trim() || undefined,
        bio: formData.bio,
        headline: formData.headline,
        location: formData.location,
        yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
        currentRole: formData.currentRole,
        industries: industriesArray,
        skills: skillsArray,
        socialLinks: {
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
          portfolio: formData.portfolio || undefined,
        },
        isPublicProfile: formData.isPublicProfile,
      });

      if (!response.success) {
        throw new Error((response as any).message || t('profile.updateFailed'));
      }

      // Update user in store with new data including avatar
      const updatedUser = response.data;
      setUser(updatedUser);
      
      // Update originalData to include new avatar
      setOriginalData({ ...formData, avatar: updatedUser.avatar || formData.avatar });
      
      toast.success(t('toast.profileUpdated'));
    } catch (error: any) {
      toast.error(error.message || t('toast.profileUpdateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-6">
        <div className="glass-card bg-white/90 dark:bg-gray-800/90 rounded-xl sm:rounded-2xl overflow-hidden">
          {/* Cover / Header Background */}
          <div 
            className="h-32 sm:h-36 lg:h-40 bg-gradient-to-r from-indigo-500 to-purple-600 relative group/cover overflow-visible"
            style={{
              backgroundImage: formData.coverPhoto ? `url(${formData.coverPhoto}?t=${Date.now()})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {formData.coverPhoto && (
              <div className="absolute inset-0 bg-black/20" />
            )}
            <button
              onClick={() => coverPhotoInputRef.current?.click()}
              disabled={uploadingCover}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2.5 sm:p-3 shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-800 transition-all disabled:opacity-50 z-10"
              title="Change cover photo"
              aria-label="Change cover photo"
            >
              {uploadingCover ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </button>
            <input
              ref={coverPhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoSelect}
              className="hidden"
              id="cover-photo-upload"
            />
            {/* Avatar - positioned to overlap cover photo */}
            <div className="absolute -bottom-8 sm:-bottom-10 lg:-bottom-12 left-4 sm:left-6 lg:left-8 z-30">
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-3 sm:border-4 lg:border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 shadow-xl overflow-hidden flex items-center justify-center relative">
                  {currentAvatar && currentAvatar.trim() ? (
                    <img 
                      key={currentAvatar.split('?')[0]} 
                      src={currentAvatar}
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        // Hide image and show fallback
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const fallback = img.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                      onLoad={(e) => {
                        // Hide fallback when image loads successfully
                        const fallback = (e.target as HTMLImageElement).parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'none';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`avatar-fallback w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-600 dark:text-indigo-300 ${currentAvatar && currentAvatar.trim() ? 'hidden' : ''}`}
                  >
                    {formData.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1.5 sm:p-2 lg:p-2.5 shadow-lg border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all disabled:opacity-50 z-40"
                  title={t('profile.chooseImage')}
                  aria-label={t('profile.chooseImage')}
                >
                  {uploading ? (
                    <Loader2 size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px] animate-spin" />
                  ) : (
                    <Camera size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="avatar-upload"
                />
                </div>
             </div>
          </div>

          <div className="pt-12 sm:pt-14 lg:pt-16 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
            {/* Header with Save/Cancel */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{formData.name || user.name}</h1>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <Shield size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="capitalize">{formData.role}</span>
                </p>
              </div>
              
              {hasChanges && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="ghost" onClick={handleCancel} disabled={isLoading} className="flex-1 sm:flex-initial text-sm">
                    <X size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" /> {t('common.cancel')}
                    </Button>
                  <Button onClick={handleSave} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 sm:flex-initial text-sm">
                    {isLoading ? <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin mr-1 sm:mr-2" /> : <Save size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                    {t('profile.saveChanges')}
                  </Button>
                </div>
                )}
            </div>

            {/* Subscription Status */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${subscription?.plan === 'premium' ? 'bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <Crown size={16} className={`sm:w-5 sm:h-5 ${subscription?.plan === 'premium' ? 'text-yellow-900' : 'text-gray-600 dark:text-gray-300'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                      {subscription?.plan === 'premium' ? t('profile.premiumMember') : t('profile.freePlan')}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {subscription?.plan === 'premium' 
                        ? subscription.endDate 
                          ? `${t('profile.expiresOn')} ${new Date(subscription.endDate).toLocaleDateString()}`
                          : t('profile.activeSubscription')
                        : t('profile.upgradeToUnlock')}
                    </p>
                  </div>
                </div>
                {subscription?.plan !== 'premium' && (
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <div className="flex gap-2">
                      <Button
                        variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('stripe')}
                        className="text-xs flex-1 sm:flex-initial"
                      >
                        Stripe
                      </Button>
                      <Button
                        variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('paypal')}
                        className="text-xs flex-1 sm:flex-initial"
                      >
                        PayPal
                      </Button>
                    </div>
                    {paymentMethod === 'stripe' ? (
                      <Button
                        onClick={handleUpgradeToPremium}
                        disabled={loadingSubscription}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold w-full sm:w-auto text-xs sm:text-sm"
                        size="sm"
                      >
                        {loadingSubscription ? (
                          <>
                            <Loader2 size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                            {t('common.loading')}
                          </>
                        ) : (
                          <>
                            <CreditCard size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            {t('profile.upgradeToPremium')}
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="w-full sm:min-w-[200px]">
                        <PayPalButton
                          onSuccess={() => {
                            toast.success(t('toast.profileUpdated'));
                            fetchSubscriptionStatus();
                          }}
                          onError={(error) => {
                            toast.error(error || t('toast.somethingWentWrong'));
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User size={14} className="sm:w-4 sm:h-4" /> {t('profile.fullName')}
                  </label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="h-10 sm:h-11 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600"
                  placeholder={t('profile.fullName')}
                  />
                </div>

                <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail size={14} className="sm:w-4 sm:h-4" /> {t('profile.email')}
                  </label>
                  <Input 
                    value={formData.email} 
                    disabled
                  className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 h-10 sm:h-11 text-sm sm:text-base cursor-not-allowed"
                />
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 pl-1">{t('profile.emailCannotChange')}</p>
                </div>

                <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Shield size={14} className="sm:w-4 sm:h-4" /> {t('profile.accountRole')}
                  </label>
                <div className="h-10 sm:h-11 w-full px-3 flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm sm:text-base text-gray-500 dark:text-gray-400 capitalize">
                      {formData.role}
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Briefcase size={14} className="sm:w-4 sm:h-4" /> Headline
                </label>
                <Input
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="h-10 sm:h-11 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Ví dụ: Senior Frontend Engineer • React | TypeScript | UX"
                />
              </div>

              {/* Location & years */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <MapPin size={14} className="sm:w-4 sm:h-4" /> Location
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="h-10 sm:h-11 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Thành phố, Quốc gia"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Briefcase size={14} className="sm:w-4 sm:h-4" /> Years of Experience
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    className="h-10 sm:h-11 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Ví dụ: 3"
                  />
                </div>
              </div>

              {/* Current role */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Briefcase size={14} className="sm:w-4 sm:h-4" /> Current Role
                </label>
                <Input
                  value={formData.currentRole}
                  onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                  className="h-10 sm:h-11 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Ví dụ: Frontend Engineer tại Công ty X"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User size={14} className="sm:w-4 sm:h-4" /> Bio
                </label>
                <textarea
                  className="w-full min-h-[96px] border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm p-3"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Giới thiệu ngắn gọn về bản thân, mục tiêu nghề nghiệp, thế mạnh..."
                />
              </div>

              {/* Industries & skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Industries (phân tách bằng dấu phẩy)
                  </label>
                  <textarea
                    className="w-full min-h-[64px] border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm p-2"
                    value={formData.industries}
                    onChange={(e) => setFormData({ ...formData, industries: e.target.value })}
                    placeholder="VD: Software, Fintech, E-commerce"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Skills (phân tách bằng dấu phẩy)
                  </label>
                  <textarea
                    className="w-full min-h-[64px] border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm p-2"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="VD: React, TypeScript, Node.js, UI/UX"
                  />
                </div>
              </div>

              {/* Social links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </label>
                  <Input
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="h-9 text-xs sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                    placeholder="https://www.linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Github className="w-4 h-4" /> GitHub
                  </label>
                  <Input
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="h-9 text-xs sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Globe2 className="w-4 h-4" /> Portfolio
                  </label>
                  <Input
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    className="h-9 text-xs sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                    placeholder="https://your-portfolio.com"
                  />
                </div>
              </div>

              {/* Public profile toggle */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 mt-2">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Public profile
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Cho phép người khác xem trang hồ sơ của bạn tại đường dẫn /u/&lt;id&gt;.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isPublicProfile}
                  onClick={() => setFormData((f) => ({ ...f, isPublicProfile: !f.isPublicProfile }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    formData.isPublicProfile ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                      formData.isPublicProfile ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
