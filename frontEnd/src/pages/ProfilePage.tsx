import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, UserProfile } from '../services/user.service';
import { ResponseDisplay } from '../components/ResponseDisplay';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | undefined>();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    bio: '',
    avatar: '',
  });

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await userService.getMyProfile();
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        phoneNumber: response.data.phoneNumber || '',
        dateOfBirth: response.data.dateOfBirth || '',
        bio: response.data.bio || '',
        avatar: response.data.avatar || '',
      });
      setResponseTime(Date.now() - startTime);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleGetOrCreate = async () => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await userService.getOrCreateProfile();
      setProfile(response.data);
      setResponseTime(Date.now() - startTime);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to get or create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await userService.createProfile(formData);
      setProfile(response.data);
      setIsEditing(false);
      setResponseTime(Date.now() - startTime);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await userService.updateProfile(formData);
      setProfile(response.data);
      setIsEditing(false);
      setResponseTime(Date.now() - startTime);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile?')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      await userService.deleteProfile();
      setProfile(null);
      setResponseTime(Date.now() - startTime);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h1>User Profile Management</h1>
      <p style={{ color: '#666' }}>Logged in as: {user?.email}</p>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={loadProfile}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          Get Profile
        </button>
        <button
          onClick={handleGetOrCreate}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#388e3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          Get or Create Profile
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f57c00',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
        {profile && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            Delete Profile
          </button>
        )}
      </div>

      {isEditing && (
        <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>{profile ? 'Update Profile' : 'Create Profile'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Avatar URL</label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <button
              onClick={profile ? handleUpdate : handleCreate}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {profile ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </div>
      )}

      <ResponseDisplay
        title="Profile Response"
        data={profile}
        error={error}
        isLoading={isLoading}
        responseTime={responseTime}
      />
    </div>
  );
};

