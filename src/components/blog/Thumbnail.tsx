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
        <Card className="w-full border-sky-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-sky-500 rounded-lg">
                        <Image className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold text-sky-800">
                            Blog Thumbnail
                        </CardTitle>
                        <p className="text-sm text-sky-600 mt-1">
                            Upload a thumbnail image for your blog post
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-sky-200 rounded-lg p-8">
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
                        className="flex flex-col items-center space-y-3 cursor-pointer"
                    >
                        <Upload className="w-16 h-16 text-sky-400" />
                        <span className="text-sky-700 font-medium text-lg">
                            Click to select image
                        </span>
                        <span className="text-sm text-gray-500">
                            PNG, JPG, GIF up to 10MB
                        </span>
                    </label>
                </div>

                {/* Selected File Display */}
                {selectedImage && (
                    <div className="p-4 bg-sky-50 rounded-lg border border-sky-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-sky-500 rounded-lg">
                                    <Image className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sky-800 truncate">
                                        {selectedImage.name}
                                    </p>
                                    <p className="text-sm text-sky-600">
                                        {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleImageUpload}
                                disabled={isUploading}
                                className="bg-sky-500 hover:bg-sky-600"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive" className="border-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Preview */}
                {thumbnailUrl && !error && (
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Preview</Label>
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-sky-200">
                            <img
                                src={thumbnailUrl}
                                alt="Thumbnail preview"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 flex space-x-2">
                                <div className="bg-green-500 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1">
                                    <Check className="w-3 h-3" />
                                    <span>Selected</span>
                                </div>
                                <button
                                    onClick={handleRemoveImage}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1 transition-colors"
                                    type="button"
                                >
                                    <X className="w-3 h-3" />
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
