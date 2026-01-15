"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from 'sonner';

interface ImageUploadProps {
    value: string | null;
    onChange: (url: string | null) => void;
    label?: string;
    onUploadStart?: () => void;
    onUploadEnd?: () => void;
}

export const ImageUpload = ({
    value,
    onChange,
    label = "Upload Image",
    onUploadStart,
    onUploadEnd
}: ImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        try {
            setIsUploading(true);
            onUploadStart?.();

            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/uploadimages', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await res.json();
            onChange(data.url);
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload image');
            console.error(error);
        } finally {
            setIsUploading(false);
            onUploadEnd?.();
        }
    };

    const handleRemove = () => {
        onChange(null);
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {!value ? (
                <div className="flex items-center gap-2">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                        id={`image-upload-${label}`}
                        disabled={isUploading}
                    />
                    <Label
                        htmlFor={`image-upload-${label}`}
                        className={`
                            flex items-center justify-center gap-2 w-full h-10 px-4 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer
                            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                <span>Select Image</span>
                            </>
                        )}
                    </Label>
                </div>
            ) : (
                <div className="relative border rounded-lg p-2 flex items-center gap-3">
                    <div className="w-10 h-10 relative bg-muted rounded overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate" title={value}>
                            {value}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                        onClick={handleRemove}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};
