"use client";

import { useState } from "react";

type UploadFolder = "brand-logo" | "car-image";

type UploadedAsset = {
  url: string;
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes: number;
  originalFilename?: string;
  resourceType: string;
};

type UploadSingleParams = {
  file: File;
  folder: UploadFolder;
  carSlug?: string;
};

type UploadMultipleParams = {
  files: File[];
  folder: UploadFolder;
  carSlug?: string;
};

export function useUploadFiles() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadSingle({
    file,
    folder,
    carSlug,
  }: UploadSingleParams): Promise<UploadedAsset> {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("folder", folder);
      formData.append("files", file);

      if (carSlug) {
        formData.append("carSlug", carSlug);
      }

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      return result.data as UploadedAsset;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown upload error";
      setError(message);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }

  async function uploadMultiple({
    files,
    folder,
    carSlug,
  }: UploadMultipleParams): Promise<UploadedAsset[]> {
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("folder", folder);

      if (carSlug) {
        formData.append("carSlug", carSlug);
      }

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      return result.data as UploadedAsset[];
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown upload error";
      setError(message);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }
  return {
    uploadSingle,
    uploadMultiple,
    isUploading,
    error,
  };
}
