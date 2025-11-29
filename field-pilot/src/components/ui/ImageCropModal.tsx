'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, RotateCw, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import Button from './Button';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob) => void;
}

interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (location: Point) => {
    setCrop(location);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onRotationChange = (rotation: number) => {
    setRotation(rotation);
  };

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      onCropComplete(croppedImage);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl transform transition-all w-full max-w-3xl z-[201] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-5 py-3.5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-5 h-5 text-white" />
              <h3 className="text-lg font-bold text-white">
                Crop & Adjust Photo
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-white/90 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Crop Area */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex-shrink-0" style={{ height: '380px' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={true}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropCompleteCallback}
            style={{
              containerStyle: {
                background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
              },
            }}
          />
          
          {/* Helpful overlay text */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <p className="text-white text-xs font-medium flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5" />
              Drag to move • Scroll to zoom
            </p>
          </div>
        </div>

        {/* Controls - Scrollable if needed */}
        <div className="bg-gradient-to-b from-gray-50 to-white px-5 py-4 space-y-4 overflow-y-auto flex-1">
            {/* Zoom Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <ZoomIn className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  Zoom
                </label>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer slider-emerald"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${((zoom - 1) / 2) * 100}%, #e5e7eb ${((zoom - 1) / 2) * 100}%, #e5e7eb 100%)`,
                }}
              />
            </div>

            {/* Rotation Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <RotateCw className="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                  Rotation
                </label>
                <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
                  {rotation}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer slider-cyan"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(rotation / 360) * 100}%, #e5e7eb ${(rotation / 360) * 100}%, #e5e7eb 100%)`,
                }}
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Left</span>
              </button>
              <button
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCw className="w-4 h-4" />
                <span>Right</span>
              </button>
              <button
                onClick={() => setZoom(zoom < 3 ? zoom + 0.5 : zoom)}
                disabled={isProcessing || zoom >= 3}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ZoomIn className="w-4 h-4" />
                <span>In</span>
              </button>
              <button
                onClick={() => setZoom(zoom > 1 ? zoom - 0.5 : zoom)}
                disabled={isProcessing || zoom <= 1}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ZoomOut className="w-4 h-4" />
                <span>Out</span>
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setZoom(1);
                setRotation(0);
                setCrop({ x: 0, y: 0 });
              }}
              disabled={isProcessing}
              className="w-full px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset All
            </button>
          </div>

        {/* Footer with action buttons */}
        <div className="bg-gray-100 px-5 py-3 flex gap-3 border-t border-gray-200 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            loading={isProcessing}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {isProcessing ? 'Processing...' : 'Save & Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
}
