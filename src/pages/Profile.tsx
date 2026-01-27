import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Camera, Save, X, Loader2, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        avatar: user.avatar || '',
        email: user.email || '',
        role: user.role || 'user'
      });
    }
  }, [user]);

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        avatar: user.avatar || '',
        email: user.email || '',
        role: user.role || 'user'
      });
    }
    setIsEditing(false);
    setStatus({ type: null, message: '' });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/updatedetails`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          avatar: formData.avatar
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      if (data.success) {
        setUser(data.data);
        setStatus({ type: 'success', message: 'Profile updated successfully!' });
        setIsEditing(false);
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Something went wrong' });
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
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
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
                  </div>
                  {isEditing && (
                    <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg border border-gray-100 text-gray-600 cursor-pointer hover:text-indigo-600 transition-colors">
                      <Camera size={18} />
                    </div>
                  )}
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
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onClick={handleCancel} disabled={isLoading}>
                      <X size={16} className="mr-2" /> Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {status.message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm ${
                status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {status.message}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User size={16} /> Full Name
                  </label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    disabled={!isEditing}
                    className="h-11"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail size={16} /> Email Address
                  </label>
                  <Input 
                    value={formData.email} 
                    disabled
                    className="bg-gray-50 text-gray-500 h-11 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 pl-1">Email cannot be changed</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Camera size={16} /> Avatar URL
                  </label>
                  <Input 
                    value={formData.avatar} 
                    onChange={(e) => setFormData({...formData, avatar: e.target.value})} 
                    disabled={!isEditing}
                    placeholder="https://example.com/avatar.jpg"
                    className="h-11"
                  />
                  <p className="text-xs text-gray-400 pl-1">Paste a direct link to an image</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Shield size={16} /> Account Role
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