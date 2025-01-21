"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { TagInput } from "@/app/components/ui/tag-input";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GiftingPreferences {
  interests: string[];
  style: string[];
  avoidCategories?: string[];
  notes?: string;
}

const defaultPreferences: GiftingPreferences = {
  interests: [],
  style: [],
  avoidCategories: [],
  notes: "",
};

const Icons = {
  spinner: Loader2,
};

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<GiftingPreferences>(defaultPreferences);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Fetch user preferences
      fetch("/api/user/preferences")
        .then((res) => res.json())
        .then(({ preferences }) => {
          if (preferences) {
            setPreferences(preferences);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }

      toast({
        title: "Success",
        description: "Your preferences have been updated",
      });
      onClose();
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-[#fafafa] border-2 border-black/10 rounded-2xl shadow-lg fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Gifting Preferences
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Interests */}
          <div className="space-y-2">
            <Label htmlFor="interests" className="text-base font-semibold">
              Interests (press Enter after each one)
            </Label>
            <TagInput
              id="interests"
              tags={preferences.interests}
              setTags={(newTags) => setPreferences(prev => ({
                ...prev,
                interests: newTags
              }))}
              placeholder="Type an interest and press Enter"
            />
          </div>

          {/* Style */}
          <div className="space-y-2">
            <Label htmlFor="style" className="text-base font-semibold">
              Style Preferences (press Enter after each one)
            </Label>
            <TagInput
              id="style"
              tags={preferences.style}
              setTags={(newTags) => setPreferences(prev => ({
                ...prev,
                style: newTags
              }))}
              placeholder="Type a style preference and press Enter"
            />
          </div>

          {/* Categories to Avoid */}
          <div className="space-y-2">
            <Label htmlFor="avoid" className="text-base font-semibold">
              Categories to Avoid (press Enter after each one)
            </Label>
            <TagInput
              id="avoid"
              tags={preferences.avoidCategories || []}
              setTags={(newTags) => setPreferences(prev => ({
                ...prev,
                avoidCategories: newTags
              }))}
              placeholder="Type a category to avoid and press Enter"
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-semibold">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={preferences.notes || ""}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              placeholder="Any additional notes or preferences..."
              className="rounded-xl border-2 border-black/10 px-4 py-2 focus:border-primary focus:ring-0 min-h-[100px]"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Preferences
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 