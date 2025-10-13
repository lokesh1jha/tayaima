"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Banner {
  id: string;
  imageUrl: string;
  title?: string | null;
  description?: string | null;
  link?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return (
      <div className="w-full aspect-[21/8] sm:aspect-[21/4] bg-gray-200 dark:bg-gray-800 animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return null; // Don't show anything if no banners
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full aspect-[21/8] sm:aspect-[21/4] bg-gray-200 dark:bg-gray-800 overflow-hidden group">
      {/* Banner Images with Sliding Effect */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => {
          const isCurrentBanner = index === currentIndex;
          const BannerImageContent = (
            <>
              <Image
                src={banner.imageUrl}
                alt={banner.title || "Banner"}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1400px"
              />
              
              {/* Overlay with text (if title or description exists) */}
              {(banner.title || banner.description) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
                  <div className="w-full p-4 sm:p-6 md:p-8 lg:p-12">
                    {banner.title && (
                      <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
                        {banner.title}
                      </h2>
                    )}
                    {banner.description && (
                      <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl drop-shadow-lg max-w-2xl">
                        {banner.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          );

          const hasLink = banner.link && banner.link.trim() !== '';

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
                isCurrentBanner ? 'translate-x-0' : index < currentIndex ? '-translate-x-full' : 'translate-x-full'
              }`}
            >
              {hasLink ? (
                <a href={banner.link!} className="relative block w-full h-full">
                  {BannerImageContent}
                </a>
              ) : (
                <div className="relative w-full h-full">
                  {BannerImageContent}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (only show if multiple banners) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 p-2 sm:p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous banner"
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 p-2 sm:p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next banner"
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator (only show if multiple banners) */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-6 sm:w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

