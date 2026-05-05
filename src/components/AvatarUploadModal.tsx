import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AvatarUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpload: (file: File) => Promise<void>;
    isLoading?: boolean;
}

const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
    open,
    onOpenChange,
    onUpload,
    isLoading = false,
}) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadStep, setUploadStep] = useState<"select" | "crop">("select");

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError("Kích thước ảnh không được vượt quá 2MB");
            return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Vui lòng chọn một file ảnh");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setUploadStep("crop");
            setZoom(1);
            setCrop({ x: 0, y: 0 });
            setCroppedAreaPixels(null);
        };
        reader.onerror = () => {
            setError("Lỗi khi đọc file");
        };
        reader.readAsDataURL(file);

        // Reset file input
        event.target.value = "";
    };

    const onCropComplete = useCallback(
        (croppedArea: unknown, croppedAreaPixels: unknown) => {
            setCroppedAreaPixels(croppedAreaPixels as any);
        },
        []
    );

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (err) => reject(err));
            image.setAttribute("crossOrigin", "anonymous");
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: any
    ): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("no 2d context");
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                }
            }, "image/jpeg");
        });
    };

    const handleCropAndUpload = async () => {
        if (!imageSrc || !croppedAreaPixels) {
            setError("Vui lòng cắt ảnh trước khi tải lên");
            return;
        }

        try {
            setError(null);
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const file = new File([croppedImageBlob], "avatar.jpg", {
                type: "image/jpeg",
            });

            await onUpload(file);
            handleClose();
        } catch (err) {
            setError("Lỗi khi xử lý ảnh");
            console.error(err);
        }
    };

    const handleClose = () => {
        setImageSrc(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setError(null);
        setUploadStep("select");
        onOpenChange(false);
    };

    const handleBack = () => {
        setImageSrc(null);
        setUploadStep("select");
        setError(null);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-full max-w-md">
                <DialogHeader>
                    <DialogTitle>Cập nhật ảnh đại diện</DialogTitle>
                    <DialogDescription>
                        Chọn ảnh, cắt theo tỷ lệ 1:1 và tải lên
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {uploadStep === "select" ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div className="text-center">
                                <p className="font-medium">Chọn ảnh</p>
                                <p className="text-sm text-muted-foreground">
                                    Tối đa 2MB, định dạng JPG, PNG
                                </p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                disabled={isLoading}
                                className="hidden"
                                id="avatar-file-input"
                            />
                            <Button
                                asChild
                                variant="outline"
                                disabled={isLoading}
                                size="sm"
                            >
                                <label htmlFor="avatar-file-input" className="cursor-pointer">
                                    Chọn file
                                </label>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="relative h-80 w-full overflow-hidden rounded-lg bg-muted">
                            <Cropper
                                image={imageSrc || ""}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Thu phóng
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                Quay lại
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCropAndUpload}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? "Đang tải..." : "Cập nhật"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AvatarUploadModal;
