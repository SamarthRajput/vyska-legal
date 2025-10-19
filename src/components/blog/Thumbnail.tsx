import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Image, AlertCircle, Loader2, Upload, Check, X } from "lucide-react";
import { toast } from 'sonner';

interface ThumbnailSectionProps {
    thumbnailUrl: string | null;
    setThumbnailUrl: (url: string | null) => void;
}

const ThumbnailSection = ({ thumbnailUrl, setThumbnailUrl }: ThumbnailSectionProps) => {
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async () => {
        if (!selectedImage) {
            toast.error('No image selected');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedImage);

        setIsUploading(true);
        setError(null);

        try {
            const response = await fetch('/api/uploadimages', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload image');
            }

            const data = await response.json();
            setThumbnailUrl(data.url);
            setSelectedImage(null);
            toast.success('Thumbnail uploaded successfully!');
        } catch (error: any) {
            setError(error.message);
            toast.error('Upload failed', { description: error.message });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setThumbnailUrl(null);
        setSelectedImage(null);
        toast.success('Thumbnail removed');
    };

    return (
        <Card className="w-full border-sky-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border-b border-sky-100 dark:border-sky-800 p-4 sm:p-6">
                <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2 bg-sky-500 rounded-lg flex-shrink-0">
                        <Image className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg sm:text-xl font-bold text-sky-800 dark:text-sky-300 break-words">
                            Blog Thumbnail
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-sky-600 dark:text-sky-400 mt-1 leading-relaxed">
                            Upload a thumbnail image for your blog post
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="border-2 border-dashed border-sky-200 dark:border-sky-700 rounded-lg p-6 sm:p-8 hover:border-sky-400 dark:hover:border-sky-500 transition-colors bg-sky-50/30 dark:bg-sky-900/10">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setSelectedImage(file);
                            setError(null);
                        }}
                        className="hidden"
                        id="thumbnail-upload"
                    />
                    <label
                        htmlFor="thumbnail-upload"
                        className="flex flex-col items-center space-y-2 sm:space-y-3 cursor-pointer"
                    >
                        <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-sky-400 dark:text-sky-500" />
                        <span className="text-sky-700 dark:text-sky-300 font-medium text-sm sm:text-base lg:text-lg text-center">
                            Click to select image
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center px-2">
                            PNG, JPG, GIF up to 10MB
                        </span>
                    </label>
                </div>

                {selectedImage && (
                    <div className="p-3 sm:p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-100 dark:border-sky-800">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
                                <div className="p-1.5 sm:p-2 bg-sky-500 rounded-lg flex-shrink-0">
                                    <Image className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sky-800 dark:text-sky-300 truncate text-sm sm:text-base">
                                        {selectedImage.name}
                                    </p>
                                    <p className="text-xs sm:text-sm text-sky-600 dark:text-sky-400">
                                        {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleImageUpload}
                                disabled={isUploading}
                                className="bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 w-full sm:w-auto text-sm sm:text-base"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
                                        <span className="hidden sm:inline">Uploading...</span>
                                        <span className="sm:hidden">Upload...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                                        <span>Upload</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <AlertDescription className="text-sm break-words">{error}</AlertDescription>
                    </Alert>
                )}

                {thumbnailUrl && !error && (
                    <div className="space-y-2 sm:space-y-3">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            Preview
                        </Label>
                        <div className="relative w-full aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-sky-200 dark:border-sky-700">
                            <img
                                src={thumbnailUrl}
                                alt="Thumbnail preview"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 flex flex-col sm:flex-row gap-2">
                                <div className="bg-green-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1 shadow-lg">
                                    <Check className="w-3 h-3 flex-shrink-0" />
                                    <span>Selected</span>
                                </div>
                                <button
                                    onClick={handleRemoveImage}
                                    className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-colors shadow-lg active:scale-95"
                                    type="button"
                                >
                                    <X className="w-3 h-3 flex-shrink-0" />
                                    <span>Remove</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ThumbnailSection;
