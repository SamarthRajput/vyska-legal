'use client'
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save, X, User, Mail, Calendar, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
}

const UserProfileManagement = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    profilePicture: ''
  });

  // Fetch user profile from your database
  useEffect(() => {
    if (clerkUser) {
      fetchUserProfile();
    }
  }, [clerkUser]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        setFormData({
          name: profile.name,
          profilePicture: profile.profilePicture || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: userProfile?.name || '',
      profilePicture: userProfile?.profilePicture || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: userProfile?.name || '',
      profilePicture: userProfile?.profilePicture || ''
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          profilePicture: formData.profilePicture || null
        })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        {!isEditing ? (
          <Button 
            onClick={handleEdit} 
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="h-5 w-5 flex-shrink-0" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0">
              <AvatarImage src={userProfile.profilePicture || clerkUser?.imageUrl} />
              <AvatarFallback className="text-lg sm:text-xl">
                {userProfile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium">Profile Picture</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isEditing ? 'Enter image URL below' : 'Managed through your account settings'}
              </p>
            </div>
          </div>

          {/* Profile Picture URL Field (only shown when editing) */}
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="profilePicture" className="text-sm sm:text-base">
                Profile Picture URL
              </Label>
              <Input
                id="profilePicture"
                type="url"
                value={formData.profilePicture}
                onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Enter a valid image URL or leave empty to use default
              </p>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm sm:text-base">
              <User className="h-4 w-4 flex-shrink-0" />
              Full Name
            </Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                required
                className="w-full"
              />
            ) : (
              <p className="text-base sm:text-lg font-medium break-words">{userProfile.name}</p>
            )}
          </div>

          {/* Email Field (Read-only) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm sm:text-base">
              <Mail className="h-4 w-4 flex-shrink-0" />
              Email Address
            </Label>
            <p className="text-base sm:text-lg break-all">{userProfile.email}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Email cannot be changed here. Use your account settings to modify email.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Shield className="h-5 w-5 flex-shrink-0" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm sm:text-base">
                <Shield className="h-4 w-4 flex-shrink-0" />
                Role
              </Label>
              <Badge 
                variant={userProfile.role === 'ADMIN' ? 'default' : 'secondary'} 
                className="capitalize text-xs sm:text-sm"
              >
                {userProfile.role.toLowerCase()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm sm:text-base">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                Member Since
              </Label>
              <p className="text-sm">
                {new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Last Updated</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {new Date(userProfile.updatedAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileManagement;
