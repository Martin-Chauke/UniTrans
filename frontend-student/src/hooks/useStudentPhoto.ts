"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "student_profile_photo";

export function useStudentPhoto() {
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPhoto(localStorage.getItem(STORAGE_KEY));
    }
  }, []);

  const savePhoto = useCallback((dataUrl: string) => {
    localStorage.setItem(STORAGE_KEY, dataUrl);
    setPhoto(dataUrl);
    // Notify other components on the same page via a custom event
    window.dispatchEvent(new CustomEvent("student-photo-updated", { detail: dataUrl }));
  }, []);

  const removePhoto = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPhoto(null);
    window.dispatchEvent(new CustomEvent("student-photo-updated", { detail: null }));
  }, []);

  // Listen for updates triggered by the profile page
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string | null>).detail;
      setPhoto(detail);
    };
    window.addEventListener("student-photo-updated", handler);
    return () => window.removeEventListener("student-photo-updated", handler);
  }, []);

  return { photo, savePhoto, removePhoto };
}
