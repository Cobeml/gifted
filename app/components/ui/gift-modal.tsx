"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Upload } from "lucide-react";
import { TagInput } from "@/app/components/ui/tag-input";
import { Gift } from "@/utils/dynamodb-schema";

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  gift?: Gift;
}

interface GiftFormData {
  recipientName: string;
  occasion: string;
  dueDate: string;
  recipientStyle: string[];
  recipientInterests: string[];
  relationshipContext: string;
  aestheticImages: string[];
  additionalInfo: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

const defaultGiftData: GiftFormData = {
  recipientName: "",
  occasion: "",
  dueDate: "",
  recipientStyle: [],
  recipientInterests: [],
  relationshipContext: "",
  aestheticImages: [],
  additionalInfo: "",
  shippingAddress: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  },
};

const Icons = {
  spinner: Loader2,
};

export function GiftModal({ isOpen, onClose, onSuccess, gift }: GiftModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [giftData, setGiftData] = useState<GiftFormData>(defaultGiftData);
  const { toast } = useToast();

  useEffect(() => {
    if (gift) {
      setGiftData({
        recipientName: gift.recipientName,
        occasion: gift.occasion,
        dueDate: gift.dueDate,
        recipientStyle: gift.recipientStyle || [],
        recipientInterests: gift.recipientInterests || [],
        relationshipContext: gift.relationshipContext || "",
        aestheticImages: gift.aestheticImages || [],
        additionalInfo: gift.additionalInfo || "",
        shippingAddress: gift.shippingAddress || {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
      });
    } else {
      setGiftData(defaultGiftData);
    }
  }, [gift]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/gifts" + (gift ? `/${gift.id}` : ""), {
        method: gift ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(giftData),
      });

      if (!response.ok) {
        throw new Error(gift ? "Failed to update gift" : "Failed to create gift");
      }

      toast({
        title: "Success",
        description: gift ? "Gift has been updated successfully" : "Gift has been created successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      setGiftData(defaultGiftData);
    } catch (error) {
      console.error("Error saving gift:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save gift",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    // TODO: Implement image upload to S3 or similar
    // For now, we'll just store the file names
    const fileNames = Array.from(files).map(file => file.name);
    setGiftData(prev => ({
      ...prev,
      aestheticImages: [...prev.aestheticImages, ...fileNames]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-[#fafafa] border-2 border-black/10 rounded-2xl shadow-lg fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {gift ? "Edit Gift" : "Create New Gift"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <Label htmlFor="recipientName" className="text-base font-semibold">
              Recipient Name
            </Label>
            <Input
              id="recipientName"
              value={giftData.recipientName}
              onChange={(e) => setGiftData(prev => ({
                ...prev,
                recipientName: e.target.value
              }))}
              placeholder="Enter recipient&apos;s name"
              className="rounded-xl border-2 border-black/10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occasion" className="text-base font-semibold">
              Occasion
            </Label>
            <Input
              id="occasion"
              value={giftData.occasion}
              onChange={(e) => setGiftData(prev => ({
                ...prev,
                occasion: e.target.value
              }))}
              placeholder="e.g., Birthday, Anniversary, etc."
              className="rounded-xl border-2 border-black/10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-base font-semibold">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={giftData.dueDate}
              onChange={(e) => setGiftData(prev => ({
                ...prev,
                dueDate: e.target.value
              }))}
              className="rounded-xl border-2 border-black/10"
              required
            />
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Shipping Address</h3>
            <div className="space-y-2">
              <Label htmlFor="street" className="text-base font-semibold">
                Street Address
              </Label>
              <Input
                id="street"
                value={giftData.shippingAddress.street}
                onChange={(e) => setGiftData(prev => ({
                  ...prev,
                  shippingAddress: { ...prev.shippingAddress, street: e.target.value }
                }))}
                placeholder="Enter street address"
                className="rounded-xl border-2 border-black/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-base font-semibold">
                  City
                </Label>
                <Input
                  id="city"
                  value={giftData.shippingAddress.city}
                  onChange={(e) => setGiftData(prev => ({
                    ...prev,
                    shippingAddress: { ...prev.shippingAddress, city: e.target.value }
                  }))}
                  placeholder="Enter city"
                  className="rounded-xl border-2 border-black/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-base font-semibold">
                  State/Province
                </Label>
                <Input
                  id="state"
                  value={giftData.shippingAddress.state}
                  onChange={(e) => setGiftData(prev => ({
                    ...prev,
                    shippingAddress: { ...prev.shippingAddress, state: e.target.value }
                  }))}
                  placeholder="Enter state"
                  className="rounded-xl border-2 border-black/10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-base font-semibold">
                  Postal Code
                </Label>
                <Input
                  id="postalCode"
                  value={giftData.shippingAddress.postalCode}
                  onChange={(e) => setGiftData(prev => ({
                    ...prev,
                    shippingAddress: { ...prev.shippingAddress, postalCode: e.target.value }
                  }))}
                  placeholder="Enter postal code"
                  className="rounded-xl border-2 border-black/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-base font-semibold">
                  Country
                </Label>
                <Input
                  id="country"
                  value={giftData.shippingAddress.country}
                  onChange={(e) => setGiftData(prev => ({
                    ...prev,
                    shippingAddress: { ...prev.shippingAddress, country: e.target.value }
                  }))}
                  placeholder="Enter country"
                  className="rounded-xl border-2 border-black/10"
                />
              </div>
            </div>
          </div>

          {/* Recipient Style */}
          <div className="space-y-2">
            <Label htmlFor="style" className="text-base font-semibold">
              Recipient&apos;s Style (press Enter after each one)
            </Label>
            <TagInput
              id="style"
              tags={giftData.recipientStyle}
              setTags={(newTags) => setGiftData(prev => ({
                ...prev,
                recipientStyle: newTags
              }))}
              placeholder="Type a style preference and press Enter"
            />
          </div>

          {/* Recipient Interests */}
          <div className="space-y-2">
            <Label htmlFor="interests" className="text-base font-semibold">
              Recipient&apos;s Interests (press Enter after each one)
            </Label>
            <TagInput
              id="interests"
              tags={giftData.recipientInterests}
              setTags={(newTags) => setGiftData(prev => ({
                ...prev,
                recipientInterests: newTags
              }))}
              placeholder="Type an interest and press Enter"
            />
          </div>

          {/* Relationship Context */}
          <div className="space-y-2">
            <Label htmlFor="relationshipContext" className="text-base font-semibold">
              Relationship Context
            </Label>
            <Textarea
              id="relationshipContext"
              value={giftData.relationshipContext}
              onChange={(e) => setGiftData(prev => ({
                ...prev,
                relationshipContext: e.target.value
              }))}
              placeholder="Describe your relationship with the recipient..."
              className="rounded-xl border-2 border-black/10 min-h-[100px]"
            />
          </div>

          {/* Aesthetic Images */}
          <div className="space-y-2">
            <Label htmlFor="images" className="text-base font-semibold">
              Aesthetic Images (Optional)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="rounded-xl border-2 border-black/10"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => document.getElementById('images')?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {giftData.aestheticImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {giftData.aestheticImages.map((image, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {image}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo" className="text-base font-semibold">
              Additional Information (Optional)
            </Label>
            <Textarea
              id="additionalInfo"
              value={giftData.additionalInfo}
              onChange={(e) => setGiftData(prev => ({
                ...prev,
                additionalInfo: e.target.value
              }))}
              placeholder="Any additional notes or preferences..."
              className="rounded-xl border-2 border-black/10 min-h-[100px]"
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
              {gift ? "Update Gift" : "Create Gift"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 