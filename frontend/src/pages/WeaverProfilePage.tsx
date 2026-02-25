import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import LogoUpload from "../components/LogoUpload";
import { useGetCallerProfile, useCreateOrUpdateWeaverProfile } from "../hooks/useQueries";
import { ExternalBlob } from "../backend";

export default function WeaverProfilePage() {
  const { data: profile, isLoading: profileLoading } = useGetCallerProfile();
  const updateProfileMutation = useCreateOrUpdateWeaverProfile();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState<ExternalBlob | null>(null);

  // Populate form when profile data is loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setAddress(profile.address || "");
      setLogo(profile.logo || null);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let logoToSave = logo;

    // If no logo is set, use a placeholder empty blob
    if (!logoToSave) {
      logoToSave = ExternalBlob.fromBytes(new Uint8Array(0));
    }

    await updateProfileMutation.mutateAsync({
      name,
      logo: logoToSave,
      address,
    });
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="font-serif text-3xl font-bold mb-6">Business Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo */}
            <div className="space-y-2">
              <Label>Business Logo</Label>
              <LogoUpload
                currentLogo={logo}
                onLogoChange={setLogo}
              />
              <p className="text-xs text-muted-foreground">
                Upload your business logo. It will appear on your catalogue pages.
              </p>
            </div>

            {/* Business Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your business name"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your business address"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
