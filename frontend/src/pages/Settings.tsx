import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Sun, 
  Trash2, 
  Key, 
  Mail,
  Save,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { api } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

const Settings = () => {
  const { user, setUser } = useAuthStore();
  const { t, language, toggleLanguage } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const toast = useToastStore();
  const navigate = useNavigate();
  const confirmDialog = useConfirmDialog();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'privacy' | 'account'>('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    headline: user?.headline || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    communityUpdates: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    isPublicProfile: user?.isPublicProfile !== false,
    showEmail: false,
    showLocation: true,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        headline: user.headline || '',
      });
      setPrivacySettings({
        isPublicProfile: user.isPublicProfile !== false,
        showEmail: false,
        showLocation: true,
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await api.updateProfile({
        name: profileData.name,
        bio: profileData.bio,
        headline: profileData.headline,
      });
      if (response.success) {
        const userData = response.data as any;
        if (userData.token) {
          localStorage.setItem('token', userData.token);
        }
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success(t('settings.profileUpdated') || 'Profile updated successfully');
      }
    } catch (error: any) {
      toast.error(error.message || t('settings.updateFailed') || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('settings.passwordsDoNotMatch') || 'Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error(t('settings.passwordTooShort') || 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.updateProfile({
        password: passwordData.newPassword,
      });
      if (response.success) {
        toast.success(t('settings.passwordChanged') || 'Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      toast.error(error.message || t('settings.passwordChangeFailed') || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    setLoading(true);
    try {
      const response = await api.updateProfile({
        isPublicProfile: privacySettings.isPublicProfile,
      });
      if (response.success) {
        const userData = response.data as any;
        if (userData.token) {
          localStorage.setItem('token', userData.token);
        }
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success(t('settings.privacyUpdated') || 'Privacy settings updated');
      }
    } catch (error: any) {
      toast.error(error.message || t('settings.updateFailed') || 'Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t('settings.profile') || 'Profile', icon: User },
    { id: 'security', label: t('settings.security') || 'Security', icon: Shield },
    { id: 'notifications', label: t('settings.notifications') || 'Notifications', icon: Bell },
    { id: 'privacy', label: t('settings.privacy') || 'Privacy', icon: Lock },
    { id: 'account', label: t('settings.account') || 'Account', icon: User },
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {t('settings.title') || 'Settings'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-700 text-crimson-red dark:text-red-400 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {t('settings.profileSettings') || 'Profile Settings'}
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.name') || 'Name'}
                        </label>
                        <Input
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.email') || 'Email'}
                        </label>
                        <Input
                          value={profileData.email}
                          disabled
                          className="dark:bg-gray-700 dark:border-gray-600 opacity-60"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('settings.emailCannotChange') || 'Email cannot be changed'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.headline') || 'Headline'}
                        </label>
                        <Input
                          value={profileData.headline}
                          onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                          placeholder={t('settings.headlinePlaceholder') || 'e.g., Senior Software Engineer'}
                          className="dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.bio') || 'Bio'}
                        </label>
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-crimson-red"
                          placeholder={t('settings.bioPlaceholder') || 'Tell us about yourself...'}
                        />
                      </div>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="bg-crimson-red hover:bg-fire-red text-white"
                      >
                        <Save size={16} className="mr-2" />
                        {loading ? t('settings.saving') || 'Saving...' : t('settings.save') || 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {t('settings.securitySettings') || 'Security Settings'}
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.currentPassword') || 'Current Password'}
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="dark:bg-gray-700 dark:border-gray-600 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.newPassword') || 'New Password'}
                        </label>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="dark:bg-gray-700 dark:border-gray-600 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('settings.confirmPassword') || 'Confirm New Password'}
                        </label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="dark:bg-gray-700 dark:border-gray-600 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <Button
                        onClick={handleChangePassword}
                        disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="bg-crimson-red hover:bg-fire-red text-white"
                      >
                        <Key size={16} className="mr-2" />
                        {loading ? t('settings.changing') || 'Changing...' : t('settings.changePassword') || 'Change Password'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {t('settings.notificationSettings') || 'Notification Settings'}
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {t('settings.emailNotifications') || 'Email Notifications'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('settings.emailNotificationsDesc') || 'Receive email updates about your account'}
                          </p>
                        </div>
                        <button
                          onClick={() => setNotificationSettings({ ...notificationSettings, emailNotifications: !notificationSettings.emailNotifications })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.emailNotifications ? 'bg-crimson-red' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {t('settings.pushNotifications') || 'Push Notifications'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('settings.pushNotificationsDesc') || 'Receive browser push notifications'}
                          </p>
                        </div>
                        <button
                          onClick={() => setNotificationSettings({ ...notificationSettings, pushNotifications: !notificationSettings.pushNotifications })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.pushNotifications ? 'bg-crimson-red' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {t('settings.jobAlerts') || 'Job Alerts'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('settings.jobAlertsDesc') || 'Get notified about new job opportunities'}
                          </p>
                        </div>
                        <button
                          onClick={() => setNotificationSettings({ ...notificationSettings, jobAlerts: !notificationSettings.jobAlerts })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.jobAlerts ? 'bg-crimson-red' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.jobAlerts ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {t('settings.privacySettings') || 'Privacy Settings'}
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {t('settings.publicProfile') || 'Public Profile'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('settings.publicProfileDesc') || 'Allow others to view your profile'}
                          </p>
                        </div>
                        <button
                          onClick={() => setPrivacySettings({ ...privacySettings, isPublicProfile: !privacySettings.isPublicProfile })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            privacySettings.isPublicProfile ? 'bg-crimson-red' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              privacySettings.isPublicProfile ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <Button
                        onClick={handleSavePrivacy}
                        disabled={loading}
                        className="bg-crimson-red hover:bg-fire-red text-white"
                      >
                        <Save size={16} className="mr-2" />
                        {loading ? t('settings.saving') || 'Saving...' : t('settings.save') || 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {t('settings.accountSettings') || 'Account Settings'}
                    </h2>
                    <div className="space-y-6">
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          {t('settings.appearance') || 'Appearance'}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t('settings.theme') || 'Theme'}
                          </span>
                          <button
                            onClick={toggleTheme}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                            <span className="text-sm">{theme === 'dark' ? t('settings.dark') || 'Dark' : t('settings.light') || 'Light'}</span>
                          </button>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          {t('settings.language') || 'Language'}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t('settings.selectLanguage') || 'Select Language'}
                          </span>
                          <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Globe size={16} />
                            <span className="text-sm">{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                          </button>
                        </div>
                      </div>
                      <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <h3 className="font-medium text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
                          <Trash2 size={18} />
                          {t('settings.dangerZone') || 'Danger Zone'}
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                          {t('settings.deleteAccountWarning') || 'Once you delete your account, there is no going back. Please be certain.'}
                        </p>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            const confirmed = await confirmDialog({
                              title: t('settings.deleteAccount') || 'Delete Account',
                              message: t('settings.confirmDeleteAccount') || 'Are you sure you want to delete your account? This action cannot be undone.',
                              confirmText: t('settings.delete') || 'Delete',
                              cancelText: t('settings.cancel') || 'Cancel',
                            });
                            if (confirmed) {
                              toast.error(t('settings.deleteAccountNotImplemented') || 'Account deletion is not yet implemented');
                            }
                          }}
                        >
                          <Trash2 size={16} className="mr-2" />
                          {t('settings.deleteAccount') || 'Delete Account'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
