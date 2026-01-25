import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const handleSave = () => {
    // In a real app, you would send this to the backend
    const updatedUser = { ...user!, name, avatar };
    setUser(updatedUser);
    setIsEditing(false);
    // TODO: Call API to update user profile in DB
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <Button variant="outline" onClick={() => isEditing ? handleSave() : setIsEditing(!isEditing)}>
                {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
        </div>

        <div className="space-y-6 max-w-md">
            <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md">
                    {avatar ? (
                        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                            {name.charAt(0)}
                        </div>
                    )}
                </div>
                {isEditing && (
                    <div className="w-full">
                        <label className="text-sm font-medium text-gray-700">Avatar URL</label>
                        <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        disabled={!isEditing} 
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input 
                        value={user.email} 
                        disabled 
                        className="bg-gray-50 text-gray-500"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500 capitalize">
                        {user.role}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
