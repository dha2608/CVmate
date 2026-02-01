import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Camera, Save, X, Loader2, Shield, AlertCircle, CheckCircle2, Upload, Link as LinkIcon, Crown, CreditCard } from 'lucide-react';
import { api } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import PayPalButton from '@/components/PayPalButton';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
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
  const [avatarMethod, setAvatarMethod] = useState<'url' | 'upload'>('url');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Check if form has changes
  const hasChanges = formData.name !== originalData.name || formData.avatar !== originalData.avatar;

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
      setAvatarPreview(user.avatar || '');
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
      setStatus({ type: 'error', message: error.message || 'Failed to create checkout session' });
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setStatus({ type: 'error', message: t('profile.selectImageFile') });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: t('profile.imageTooLarge') });
      return;
    }

    setUploading(true);
    setStatus({ type: null, message: '' });

    try {
      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append('avatar', file);

      // Get auth token
      const userData = localStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : null;

      // Upload to server
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/upload/avatar`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        // Update avatar URL
        const avatarUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${data.data.url}`;
        setFormData({ ...formData, avatar: avatarUrl });
        setAvatarPreview(avatarUrl);
        setStatus({ type: 'success', message: t('profile.avatarUploaded') });
      } else {
        throw new Error(data.message || t('profile.uploadFailed'));
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || t('profile.uploadFailed') });
    } finally {
      setUploading(false);
      // Reset file input
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
      setAvatarPreview(originalData.avatar);
    }
    setStatus({ type: null, message: '' });
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsLoading(true);
    setStatus({ type: null, message: '' });

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
      setStatus({ type: 'success', message: t('profile.profileUpdated') });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || t('profile.updateFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover / Header Background */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
             <div className="absolute -bottom-12 left-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden relative group">
                    {formData.avatar ? (
                      <img 
                        src={formData.avatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-4xl font-bold text-gray-400">
                        {formData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg border border-gray-100 text-gray-600 cursor-pointer hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                      title={t('profile.chooseImage')}
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                </div>
             </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                  <Shield size={14} />
                  <span className="capitalize">{user.role}</span>
                </p>
              </div>
              
              {hasChanges && (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleCancel} disabled={isLoading}>
                    <X size={16} className="mr-2" /> {t('common.cancel')}
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                    {t('profile.saveChanges')}
                  </Button>
                </div>
              )}
            </div>

            {status.message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm ${
                status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {status.message}
              </div>
            )}

            {/* Subscription Status */}
            <div className="mb-6 p-4 rounded-lg border-2 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${subscription?.plan === 'premium' ? 'bg-yellow-400' : 'bg-gray-300'}`}>
                    <Crown size={20} className={subscription?.plan === 'premium' ? 'text-yellow-900' : 'text-gray-600'} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {subscription?.plan === 'premium' ? t('profile.premiumMember') : t('profile.freePlan')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {subscription?.plan === 'premium' 
                        ? subscription.endDate 
                          ? `${t('profile.expiresOn')} ${new Date(subscription.endDate).toLocaleDateString()}`
                          : t('profile.activeSubscription')
                        : t('profile.upgradeToUnlock')}
                    </p>
                  </div>
                </div>
                {subscription?.plan !== 'premium' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('stripe')}
                        className="text-xs"
                      >
                        Stripe
                      </Button>
                      <Button
                        variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('paypal')}
                        className="text-xs"
                      >
                        PayPal
                      </Button>
                    </div>
                    {paymentMethod === 'stripe' ? (
                      <Button
                        onClick={handleUpgradeToPremium}
                        disabled={loadingSubscription}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold"
                      >
                        {loadingSubscription ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <CreditCard size={16} className="mr-2" />
                            {t('profile.upgradeToPremium')}
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="min-w-[200px]">
                        <PayPalButton
                          onSuccess={() => {
                            setStatus({ type: 'success', message: t('profile.profileUpdated') });
                            fetchSubscriptionStatus();
                          }}
                          onError={(error) => {
                            setStatus({ type: 'error', message: error });
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User size={16} /> {t('profile.fullName')}
                  </label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="h-11"
                    placeholder={t('profile.fullName')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail size={16} /> {t('profile.email')}
                  </label>
                  <Input 
                    value={formData.email} 
                    disabled
                    className="bg-gray-50 text-gray-500 h-11 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 pl-1">{t('profile.emailCannotChange')}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Camera size={16} /> {t('profile.profilePicture')}
                  </label>
                  
                  {/* Avatar Preview */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                          {formData.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      {/* Method Toggle */}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={avatarMethod === 'upload' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAvatarMethod('upload')}
                          className="flex-1"
                        >
                          <Upload size={14} className="mr-1" />
                          {t('common.upload')}
                        </Button>
                        <Button
                          type="button"
                          variant={avatarMethod === 'url' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAvatarMethod('url')}
                          className="flex-1"
                        >
                          <LinkIcon size={14} className="mr-1" />
                          URL
                        </Button>
                      </div>

                      {/* Upload Method */}
                      {avatarMethod === 'upload' && (
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="avatar-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="w-full"
                          >
                            {uploading ? (
                              <>
                                <Loader2 size={14} className="mr-1 animate-spin" />
                                {t('common.loading')}
                              </>
                            ) : (
                              <>
                                <Upload size={14} className="mr-1" />
                                {t('profile.chooseImage')}
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-gray-400 mt-1">{t('profile.maxFileSize')}</p>
                        </div>
                      )}

                      {/* URL Method */}
                      {avatarMethod === 'url' && (
                        <div>
                          <Input 
                            value={formData.avatar} 
                            onChange={(e) => {
                              setFormData({...formData, avatar: e.target.value});
                              setAvatarPreview(e.target.value);
                            }} 
                            placeholder="https://example.com/avatar.jpg"
                            className="h-9 text-sm"
                          />
                          <p className="text-xs text-gray-400 mt-1">{t('profile.pasteImageUrl')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Shield size={16} /> {t('profile.accountRole')}
                  </label>
                   <div className="h-11 w-full px-3 flex items-center bg-gray-50 border border-gray-200 rounded-md text-gray-500 capitalize">
                      {formData.role}
                   </div>
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