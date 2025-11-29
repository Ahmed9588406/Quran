/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useRef, useState, DragEvent } from "react";
import Image from "next/image";

export default function QRScanModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // invalid upload state (show red error card)
  const [invalidFileName, setInvalidFileName] = useState<string | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isValid, setIsValid] = useState(false);

  const ACCEPTED = ["image/png", "image/jpeg", "image/jpg"];

  const handleFiles = (file?: File) => {
    setError(null);
    setIsInvalid(false);
    setIsValid(false);
    setInvalidFileName(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      // keep the invalid filename so we can show a red error card with actions
      setInvalidFileName(file.name);
      setIsInvalid(true);
      setError("Invalid file type. Accepted: .jpg .png .jpeg");
      // clear any previous valid preview
      setFileName(null);
      setPreviewUrl(null);
      return;
    }
    setFileName(file.name);
    setIsValid(true);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
    // TODO: send file to backend / scan service
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFiles(f);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFiles(f);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const clearFile = () => {
    setFileName(null);
    setPreviewUrl(null);
    setError(null);
    setInvalidFileName(null);
    setIsInvalid(false);
    setIsValid(false);
    if (inputRef.current) inputRef.current.value = "";
  };

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

        {/* thin maroon divider like in the image */}
        <div className="h-px bg-[#7a1233] w-full my-4" />

        <div className="border-t border-transparent pt-0">
          {/* File status card - shown when valid or invalid file */}
          {(isValid || isInvalid) && (
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
                      {isValid ? fileName : invalidFileName}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Formats accepted are .jpg, .png and .jpeg
                    </div>
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
            </div>
          )}

          {/* INITIAL STATE: large dashed upload panel when NO file selected */}
          {!isValid && !isInvalid && !fileName && (
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

              {/* formats text left under the panel to match the screenshot */}
              <div className="mt-2 text-sm text-gray-500">
                Formats accepted are .jpg, .png and .jpeg
              </div>
            </div>
          )}

          {/* Drag and Drop Text (centered row below, preserved to match screenshot) */}
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
              onClick={() => alert("Open camera - integrate later")}
              className="px-8 py-3 bg-[#7a1233] text-white rounded-md hover:bg-[#8a2243] transition-colors font-medium"
            >
              Open Your Camera
            </button>
          </div>

          {/* Hidden drag-and-drop fullscreen catcher (keeps drag events working) */}
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