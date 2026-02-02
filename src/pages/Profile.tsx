import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Camera, Save, X, Loader2, Shield, Crown, CreditCard } from 'lucide-react';
import { api } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import PayPalButton from '@/components/PayPalButton';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { t } = useI18n();
  const toast = useToastStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<{ plan: string; status: string; endDate?: string } | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    email: '',
    role: ''
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    avatar: '',
    email: '',
    role: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Check if form has changes
  const hasChanges = formData.name !== originalData.name || formData.avatar !== originalData.avatar;

  // Get current avatar for display
  const currentAvatar = formData.avatar || user?.avatar || '';

  useEffect(() => {
    if (user) {
      const initialData = {
        name: user.name || '',
        avatar: user.avatar || '',
        email: user.email || '',
        role: user.role || 'user'
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true);

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
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || errorData.error || t('profile.uploadFailed'));
      }

      const data = await response.json();

      if (data.success && data.data?.url) {
        // Construct full URL - data.data.url is like "/uploads/avatar-xxx.jpg"
        const avatarUrl = `${apiBaseUrl}${data.data.url}`;
        setFormData({ ...formData, avatar: avatarUrl });
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

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: originalData.name,
        avatar: originalData.avatar,
        email: originalData.email,
        role: originalData.role
      });
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsLoading(true);

    try {
      const response = await api.updateProfile({
        name: formData.name,
        avatar: formData.avatar,
      });

      if (!response.success) {
        throw new Error((response as any).message || t('profile.updateFailed'));
      }

      setUser(response.data);
      setOriginalData({
        name: formData.name,
        avatar: formData.avatar,
        email: formData.email,
        role: formData.role
      });
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
      <div className="max-w-3xl mx-auto py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cover / Header Background */}
          <div className="h-32 sm:h-36 lg:h-40 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
            <div className="absolute -bottom-12 sm:-bottom-14 lg:-bottom-16 left-4 sm:left-6 lg:left-8">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-2 sm:border-3 lg:border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 shadow-lg overflow-hidden flex items-center justify-center">
                  {currentAvatar ? (
                      <img 
                      src={currentAvatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                  ) : null}
                  <div 
                    className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-600 dark:text-indigo-300 ${currentAvatar ? 'hidden' : ''}`}
                  >
                        {formData.name.charAt(0).toUpperCase()}
                  </div>
                    </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1.5 sm:p-2 lg:p-2.5 shadow-lg border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  title={t('profile.chooseImage')}
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

          <div className="pt-16 sm:pt-18 lg:pt-20 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
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
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
