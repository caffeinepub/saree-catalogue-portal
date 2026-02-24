import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { X } from 'lucide-react';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await saveProfile.mutateAsync({ name: name.trim() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-foreground">Welcome!</h2>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Please enter your name to complete your profile setup.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={saveProfile.isPending || !name.trim()}
            className="w-full bg-gradient-to-r from-[#E07A5F] to-[#C1403D] hover:from-[#C1403D] hover:to-[#E07A5F] text-white font-medium py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveProfile.isPending ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
