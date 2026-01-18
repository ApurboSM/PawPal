import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaBell } from 'react-icons/fa';

interface Tab {
  id: string;
  label: string;
  component: React.ReactNode;
}

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) {
    return <div>Loading...</div>;
  }

  const tabs: Tab[] = [
    {
      id: 'account',
      label: 'Account Info',
      component: <AccountInfo user={user} />,
    },
    {
      id: 'settings',
      label: 'Profile Settings',
      component: <ProfileSettings user={user} />,
    },
    {
      id: 'adoptions',
      label: 'Adoption History',
      component: <AdoptionHistory user={user} />,
    },
    {
      id: 'favorites',
      label: 'Favorites',
      component: <Favorites user={user} />,
    },
    {
      id: 'timeline',
      label: 'Activity Timeline',
      component: <ActivityTimeline user={user} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6 flex items-center justify-between">
            <div className="flex items-center">
              <img
                className="h-16 w-16 rounded-full"
                src={user.profileImage || 'https://via.placeholder.com/150'}
                alt=""
              />
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications Bell */}
              <div className="relative">
                <button
                  className="text-gray-500 hover:text-indigo-600 focus:outline-none"
                  onClick={() => setShowNotifications((v) => !v)}
                >
                  <FaBell size={22} />
                  {/* Notification badge (mock) */}
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">3</span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-10">
                    <div className="p-4 border-b font-bold">Notifications</div>
                    <ul className="max-h-60 overflow-y-auto">
                      {/* Mock notifications */}
                      <li className="p-4 border-b hover:bg-gray-50">Your adoption request was approved!</li>
                      <li className="p-4 border-b hover:bg-gray-50">New pet added to your favorites.</li>
                      <li className="p-4 hover:bg-gray-50">Welcome to PawPal!</li>
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {tabs.find((tab) => tab.id === activeTab)?.component}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountInfo({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <div className="mt-1 text-sm text-gray-900">{user.username}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 text-sm text-gray-900">{user.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <div className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <div className="mt-1 text-sm text-gray-900 capitalize">{user.role}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <div className="mt-1 text-sm text-gray-900">{user.bio || 'No bio yet.'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Visibility</label>
            <div className="mt-1 text-sm text-gray-900">{user.publicProfile ? 'Public' : 'Private'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ user }: { user: any }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    username: user.username,
    bio: user.bio || '',
    phone: user.phone || '',
    profileImage: user.profileImage || '',
    publicProfile: user.publicProfile || false,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Cloudinary upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'YOUR_CLOUDINARY_UPLOAD_PRESET'); // Replace with your preset
      const res = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUDINARY_CLOUD_NAME/image/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (result.secure_url) {
        setFormData((prev) => ({ ...prev, profileImage: result.secure_url }));
      } else {
        setUploadError('Upload failed');
      }
    } catch (err) {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, publicProfile: !prev.publicProfile }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      setSuccess('Profile updated!');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Form validation (simple example)
  const isValid = formData.username.length > 2 && (!formData.phone || /^\+?\d{7,15}$/.test(formData.phone));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Edit Profile</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              minLength={3}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              pattern="^\\+?\\d{7,15}$"
              placeholder="e.g. +1234567890"
            />
          </div>
          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
              Profile Image
            </label>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {uploading && <div className="text-xs text-gray-500 mt-1">Uploading...</div>}
            {uploadError && <div className="text-xs text-red-500 mt-1">{uploadError}</div>}
            {formData.profileImage && (
              <img src={formData.profileImage} alt="Profile" className="h-12 w-12 rounded-full mt-2" />
            )}
          </div>
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="publicProfile"
              checked={formData.publicProfile}
              onChange={handleToggle}
              className="mr-2"
            />
            <label htmlFor="publicProfile" className="text-sm font-medium text-gray-700">
              Public Profile
            </label>
          </div>
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={!isValid || saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

function AdoptionHistory({ user }: { user: any }) {
  // TODO: Fetch real adoption history from backend
  const mockAdoptions = [
    { id: 1, name: 'Buddy', species: 'Dog', date: '2023-01-10' },
    { id: 2, name: 'Mittens', species: 'Cat', date: '2022-11-05' },
  ];
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Adoption History</h3>
      <ul className="mt-4 space-y-2">
        {mockAdoptions.length === 0 ? (
          <li className="text-gray-500">No adoption history yet.</li>
        ) : (
          mockAdoptions.map((pet) => (
            <li key={pet.id} className="bg-gray-50 p-4 rounded shadow flex justify-between items-center">
              <span>{pet.name} ({pet.species})</span>
              <span className="text-xs text-gray-400">{pet.date}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function Favorites({ user }: { user: any }) {
  // TODO: Fetch real favorites from backend
  const mockFavorites = [
    { id: 1, name: 'Charlie', species: 'Dog' },
    { id: 2, name: 'Luna', species: 'Cat' },
  ];
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Favorite Pets</h3>
      <ul className="mt-4 space-y-2">
        {mockFavorites.length === 0 ? (
          <li className="text-gray-500">No favorite pets yet.</li>
        ) : (
          mockFavorites.map((pet) => (
            <li key={pet.id} className="bg-gray-50 p-4 rounded shadow flex justify-between items-center">
              <span>{pet.name} ({pet.species})</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function ActivityTimeline({ user }: { user: any }) {
  // TODO: Fetch real activity timeline from backend
  const mockTimeline = [
    { id: 1, action: 'Signed up', date: '2023-01-01' },
    { id: 2, action: 'Adopted Buddy', date: '2023-01-10' },
    { id: 3, action: 'Favorited Luna', date: '2023-02-15' },
  ];
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Activity Timeline</h3>
      <ul className="mt-4 space-y-2">
        {mockTimeline.length === 0 ? (
          <li className="text-gray-500">No activity yet.</li>
        ) : (
          mockTimeline.map((item) => (
            <li key={item.id} className="bg-gray-50 p-4 rounded shadow flex justify-between items-center">
              <span>{item.action}</span>
              <span className="text-xs text-gray-400">{item.date}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
} 