"use client";
import React, { useRef, useState, DragEvent, useCallback } from "react";
import Image from "next/image";
import jsQR from "jsqr";

interface QRScanResult {
  roomId: number;
  liveStreamId: number;
  mosqueName?: string;
  preacherName?: string;
  url?: string;
}

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg"];

export default function QRScanModal({
  isOpen,
  onClose,
  onJoinStream,
}: {
  isOpen: boolean;
  onClose: () => void;
  onJoinStream?: (roomId: number, liveStreamId: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invalidFileName, setInvalidFileName] = useState<string | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);

  // Parse QR code data - supports multiple URL formats
  const parseQRData = useCallback((data: string): QRScanResult | null => {
    try {
      console.log("QR Data received:", data);
      
      // Format 1: JSON object { roomId, liveStreamId, ... }
      if (data.trim().startsWith("{")) {
        const parsed = JSON.parse(data);
        if (parsed.roomId || parsed.liveStreamId || parsed.room_id || parsed.stream_id) {
          return {
            roomId: parsed.roomId || parsed.room_id || parsed.liveStreamId || parsed.stream_id,
            liveStreamId: parsed.liveStreamId || parsed.stream_id || parsed.roomId || parsed.room_id,
            mosqueName: parsed.mosqueName || parsed.mosque || parsed.mosque_name,
            preacherName: parsed.preacherName || parsed.preacher || parsed.preacher_name,
            url: data,
          };
        }
      }

      // Format 2: URL - try to parse it
      if (data.includes("://") || data.startsWith("/")) {
        let url: URL;
        try {
          url = new URL(data);
        } catch {
          url = new URL(data, window.location.origin);
        }

        // Check for roomId/liveStreamId in query params
        const roomId = url.searchParams.get("roomId") || url.searchParams.get("room_id") || url.searchParams.get("room");
        const liveStreamId = url.searchParams.get("liveStreamId") || url.searchParams.get("stream_id") || url.searchParams.get("stream");
        
        if (roomId || liveStreamId) {
          return {
            roomId: parseInt(roomId || liveStreamId || "0"),
            liveStreamId: parseInt(liveStreamId || roomId || "0"),
            mosqueName: url.searchParams.get("mosque") || url.searchParams.get("mosqueName") || undefined,
            preacherName: url.searchParams.get("preacher") || url.searchParams.get("preacherName") || undefined,
            url: data,
          };
        }

        // Check for ID in URL path like /listen/123 or /room/456
        const pathMatch = url.pathname.match(/\/(?:listen|room|stream|qr)\/(\d+)/i);
        if (pathMatch) {
          const id = parseInt(pathMatch[1]);
          return {
            roomId: id,
            liveStreamId: id,
            url: data,
          };
        }

        // If it's a valid URL but no params, store it and extract any numbers
        const numbersInUrl = data.match(/\d+/g);
        if (numbersInUrl && numbersInUrl.length > 0) {
          const id = parseInt(numbersInUrl[numbersInUrl.length - 1]); // Take last number
          if (id > 0) {
            return {
              roomId: id,
              liveStreamId: id,
              url: data,
            };
          }
        }
      }

      // Format 3: Simple "roomId:liveStreamId" format
      if (data.includes(":") && !data.includes("://")) {
        const parts = data.split(":");
        if (parts.length >= 2) {
          const rid = parseInt(parts[0]);
          const lid = parseInt(parts[1]);
          if (!isNaN(rid) && !isNaN(lid) && rid > 0) {
            return { roomId: rid, liveStreamId: lid };
          }
        }
      }

      // Format 4: Just a number (roomId = liveStreamId)
      const num = parseInt(data.trim());
      if (!isNaN(num) && num > 0) {
        return { roomId: num, liveStreamId: num };
      }

      // Format 5: Any URL - just navigate to it directly
      if (data.includes("://")) {
        // Store the raw URL for direct navigation
        return {
          roomId: 0,
          liveStreamId: 0,
          url: data,
        };
      }

      return null;
    } catch (err) {
      console.error("Error parsing QR data:", err);
      return null;
    }
  }, []);

  // Decode QR code from image
  const decodeQRCode = useCallback(async (imageDataUrl: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          resolve(code.data);
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imageDataUrl;
    });
  }, []);

  const handleFiles = useCallback(async (file?: File) => {
    setError(null);
    setIsInvalid(false);
    setIsValid(false);
    setInvalidFileName(null);
    setScanResult(null);

    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      setInvalidFileName(file.name);
      setIsInvalid(true);
      setError("Invalid file type. Accepted: .jpg .png .jpeg");
      setFileName(null);
      setPreviewUrl(null);
      return;
    }

    setFileName(file.name);
    setIsScanning(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);

      // Decode QR code
      const qrData = await decodeQRCode(dataUrl);
      setIsScanning(false);

      if (qrData) {
        console.log("Decoded QR data:", qrData);
        const result = parseQRData(qrData);
        if (result) {
          setScanResult(result);
          setIsValid(true);
        } else {
          setIsInvalid(true);
          setError(`QR code data: "${qrData.substring(0, 100)}..." - Could not extract stream info`);
        }
      } else {
        setIsInvalid(true);
        setError("Could not detect a QR code in the image");
      }
    };
    reader.onerror = () => {
      setIsScanning(false);
      setIsInvalid(true);
      setError("Failed to read file");
    };
    reader.readAsDataURL(file);
  }, [decodeQRCode, parseQRData]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFiles(f);
  }, [handleFiles]);

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFiles(f);
  }, [handleFiles]);

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const clearFile = useCallback(() => {
    setFileName(null);
    setPreviewUrl(null);
    setError(null);
    setInvalidFileName(null);
    setIsInvalid(false);
    setIsValid(false);
    setScanResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const joinStream = useCallback(() => {
    if (scanResult) {
      // If we have a direct URL and no room IDs, navigate to the URL
      if (scanResult.url && scanResult.roomId === 0) {
        // Navigate to the URL directly
        window.location.href = scanResult.url;
      } else if (onJoinStream) {
        onJoinStream(scanResult.roomId, scanResult.liveStreamId);
      }
      onClose();
    }
  }, [scanResult, onJoinStream, onClose]);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* modal */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-center flex-1 text-[#7a1233] font-semibold text-lg">Scan QR</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-4 text-[#7a1233] p-1 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* thin maroon divider */}
        <div className="h-px bg-[#7a1233] w-full my-4" />

        <div className="border-t border-transparent pt-0">
          {/* Scanning indicator */}
          {isScanning && (
            <div className="rounded-lg p-4 mb-4 border-2 border-amber-300 bg-amber-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center bg-amber-100">
                  <svg className="w-5 h-5 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-amber-900">Scanning QR Code...</div>
                  <div className="text-sm text-gray-500">Please wait</div>
                </div>
              </div>
            </div>
          )}

          {/* File status card - shown when valid or invalid file */}
          {!isScanning && (isValid || isInvalid) && (
            <div
              className={`rounded-lg p-4 mb-4 border-2 ${
                isValid
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* File Icon */}
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 overflow-hidden ${
                      isValid ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <Image
                      src={isValid ? "/icons/qr/File success.svg" : "/icons/qr/File error.svg"}
                      alt={isValid ? "File success" : "File error"}
                      width={24}
                      height={24}
                      style={{ objectFit: "contain" }}
                    />
                  </div>

                  {/* File Info */}
                  <div>
                    <div
                      className={`font-medium ${
                        isValid ? "text-green-900" : "text-red-900"
                      }`}
                    >
                      {isValid ? fileName : invalidFileName || fileName}
                    </div>
                    {isValid && scanResult ? (
                      <div className="text-sm text-green-700 mt-1">
                        {scanResult.roomId > 0 && <div>Room ID: {scanResult.roomId}</div>}
                        {scanResult.mosqueName && <div>Mosque: {scanResult.mosqueName}</div>}
                        {scanResult.preacherName && <div>Preacher: {scanResult.preacherName}</div>}
                        {scanResult.url && scanResult.roomId === 0 && (
                          <div className="truncate max-w-xs">URL: {scanResult.url}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mt-1">
                        {error || "Formats accepted are .jpg, .png and .jpeg"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearFile}
                    className="p-2 hover:bg-white/50 rounded transition-colors"
                    title="Delete"
                  >
                    <Image
                      src="/icons/qr/Delete.png"
                      alt="Delete"
                      width={20}
                      height={20}
                    />
                  </button>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="p-2 hover:bg-white/50 rounded transition-colors"
                    title={isValid ? "Download" : "Retry"}
                  >
                    <Image
                      src={isValid ? "/icons/qr/Download.svg" : "/icons/qr/Retry.svg"}
                      alt={isValid ? "Download" : "Retry"}
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              </div>

              {/* Join Stream Button - only show when valid */}
              {isValid && scanResult && (
                <button
                  onClick={joinStream}
                  className="mt-4 w-full px-6 py-3 bg-[#7a1233] text-white rounded-md hover:bg-[#8a2243] transition-colors font-medium"
                >
                  🎧 Join Live Stream
                </button>
              )}
            </div>
          )}

          {/* INITIAL STATE: large dashed upload panel when NO file selected */}
          {!isScanning && !isValid && !isInvalid && !fileName && (
            <div className="mb-3">
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                className="rounded-lg border-2 border-dashed border-[#cfae94] bg-[#fbf0df] p-8 h-44 flex flex-col items-center justify-center cursor-pointer select-none"
              >
                <div className="mb-3">
                  <Image
                    src="/icons/qr/upload.png"
                    alt="Upload Icon"
                    width={36}
                    height={36}
                  />
                </div>

                <div className="text-gray-600 text-lg">Click or drag file to this area to upload</div>
              </div>

              {/* formats text left under the panel */}
              <div className="mt-2 text-sm text-gray-500">
                Formats accepted are .jpg, .png and .jpeg
              </div>
            </div>
          )}

          {/* Drag and Drop Text */}
          <div className="text-center mb-6">
            <p className="text-gray-600">
              <span className="text-[#7a1233]">Drag an image here</span> or{" "}
              <label className="text-[#B8860B] hover:text-[#8B6914] cursor-pointer">
                Upload a file
                <input
                  ref={inputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={onInputChange}
                />
              </label>
            </p>
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#7a1233]"></div>
            <span className="text-[#7a1233] font-medium">OR</span>
            <div className="flex-1 h-px bg-[#7a1233]"></div>
          </div>

          {/* Open Camera Button */}
          <div className="text-center">
            <button
              onClick={() => alert("Camera scanning coming soon!")}
              className="px-8 py-3 bg-[#7a1233] text-white rounded-md hover:bg-[#8a2243] transition-colors font-medium"
            >
              Open Your Camera
            </button>
          </div>

          {/* Hidden drag-and-drop fullscreen catcher */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className="fixed inset-0 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
