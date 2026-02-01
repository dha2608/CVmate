import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/store/i18nStore';
import { useToastStore } from '@/store/toastStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/utils';

const Register = () => {
  const { t } = useI18n();
  const toast = useToastStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      const errorMsg = t('register.passwordTooShort');
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    try {
      const data = await api.register(name, email, password);
      if (data.success) {
        setUser(data.data);
        toast.success(t('toast.registerSuccess'));
        navigate('/dashboard');
      } else {
        const errorMsg = data.message || t('toast.registerFailed');
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || t('toast.registerFailed');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-10 space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-crimson-red rounded-xl text-white font-black text-2xl mb-4">
            CV
          </div>
          <h1 className="text-4xl font-black text-jet-black mb-2">{t('register.createAccount')}</h1>
          <p className="text-gray-600">{t('register.startBuilding')}</p>
        </div>

        {error && (
          <div className="p-4 text-sm text-crimson-red bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-jet-black">{t('auth.name')}</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              autoComplete="name"
              className="h-12 border-2 border-gray-200 focus:border-crimson-red"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-jet-black">{t('auth.email')}</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
              className="h-12 border-2 border-gray-200 focus:border-crimson-red"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-jet-black">{t('auth.password')}</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('register.passwordTooShort')}
              autoComplete="new-password"
              className="h-12 border-2 border-gray-200 focus:border-crimson-red"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-crimson-red hover:bg-fire-red text-white font-semibold text-lg rounded-lg"
          >
            {loading ? t('register.creatingAccount') : t('register.createAccount')}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">{t('login.orContinueWith')}</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full h-12 border-2 border-gray-200 hover:bg-gray-50 font-semibold"
          onClick={() => {
            // Redirect to Google OAuth
            window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`;
          }}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('register.signUpWithGoogle')}
        </Button>

        <div className="text-center text-sm text-gray-600">
          {t('register.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-semibold text-crimson-red hover:underline">
            {t('register.signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
