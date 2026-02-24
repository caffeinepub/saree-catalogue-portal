import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerProfile, useCreateOrUpdateWeaverProfile } from '../hooks/useQueries';
import { Save, ArrowLeft } from 'lucide-react';
import LogoUpload from '../components/LogoUpload';
import { ExternalBlob } from '../backend';

export default function WeaverProfilePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerProfile();
  const updateProfile = useCreateOrUpdateWeaverProfile();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState<ExternalBlob | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAddress(profile.address);
      setLogo(profile.logo);
    }
  }, [profile]);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Please login to manage your profile</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!logo) {
      alert('Please upload a logo');
      return;
    }

    try {
      await updateProfile.mutateAsync({ name, logo, address });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Business Profile</h1>
        <p className="text-muted-foreground mb-8">
          Customize your business information that will be displayed on your public catalog
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <LogoUpload currentLogo={logo || undefined} onLogoChange={setLogo} />

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Business Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your business name"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
              Business Address
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your business address"
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#E07A5F] to-[#C1403D] hover:from-[#C1403D] hover:to-[#E07A5F] text-white font-medium py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
