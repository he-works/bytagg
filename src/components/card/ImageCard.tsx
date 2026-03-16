"use client";

import { useState, useRef, useEffect } from "react";
import type { Card, CardLink, CardImage } from "@prisma/client";

type CardWithLinksAndImages = Card & { links: CardLink[]; images: CardImage[] };

const platformIcons: Record<string, string> = {
  instagram: "📷",
  linkedin: "💼",
  github: "💻",
  twitter: "🐦",
  youtube: "🎬",
  website: "🌐",
  facebook: "👥",
  tiktok: "🎵",
};

export default function ImageCard({ card }: { card: CardWithLinksAndImages }) {
  const accentColor = card.accentColor || "#0066FF";
  const images = card.images?.sort((a, b) => a.sortOrder - b.sortOrder) || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // 스크롤 위치에 따라 현재 슬라이드 인디케이터 업데이트
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const slideWidth = carousel.offsetWidth;
      const index = Math.round(scrollLeft / slideWidth);
      setCurrentSlide(index);
    };

    carousel.addEventListener("scroll", handleScroll);
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, []);

  // 5초 간격 자동 슬라이딩
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % images.length;
        goToSlide(next);
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  // 특정 슬라이드로 스크롤 이동
  function goToSlide(index: number) {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const slideWidth = carousel.offsetWidth;
    carousel.scrollTo({ left: slideWidth * index, behavior: "smooth" });
  }

  // 이전/다음 슬라이드
  function prevSlide() {
    const prev = currentSlide <= 0 ? images.length - 1 : currentSlide - 1;
    setCurrentSlide(prev);
    goToSlide(prev);
  }

  function nextSlide() {
    const next = (currentSlide + 1) % images.length;
    setCurrentSlide(next);
    goToSlide(next);
  }

  return (
    <div className="image-card-page min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-xl">
        {/* 히어로 이미지 캐러셀 */}
        {images.length > 0 ? (
          <div className="relative">
            <div
              ref={carouselRef}
              className="image-card-carousel overflow-x-auto snap-x snap-mandatory flex scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {images.map((img) => (
                <div key={img.id} className="snap-center shrink-0 w-full">
                  <div className="relative h-[70vh]">
                    <img
                      src={img.url}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                    {/* 그라데이션 오버레이 */}
                    <div className="image-card-overlay absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                </div>
              ))}
            </div>

            {/* 오버레이 텍스트: 이름, 직함/회사 */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                {card.name}
              </h1>
              {card.nameEn && (
                <p className="text-white/80 text-sm mt-1">{card.nameEn}</p>
              )}
              {(card.title || card.company) && (
                <p className="text-white/90 mt-1">
                  {card.title}
                  {card.title && card.company && " · "}
                  {card.company}
                </p>
              )}
            </div>

            {/* 슬라이드 인디케이터 + 좌우 화살표 */}
            {images.length > 1 && (
              <>
                {/* 인디케이터 점 */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setCurrentSlide(i); goToSlide(i); }}
                      className={`image-card-indicator w-2 h-2 rounded-full transition-all duration-300 ${
                        i === currentSlide
                          ? "bg-white w-4"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                {/* 우측 하단 좌우 화살표 */}
                <div className="absolute bottom-4 right-4 flex gap-1.5 z-20">
                  <button
                    onClick={prevSlide}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    aria-label="이전 사진"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    aria-label="다음 사진"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* 이미지가 없을 경우 프로필 사진 또는 이니셜 표시 */
          <div
            className="h-[40vh] flex items-center justify-center"
            style={{ backgroundColor: accentColor }}
          >
            {card.photo ? (
              <img
                src={card.photo}
                alt={card.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-6xl font-bold">
                {card.name.charAt(0)}
              </span>
            )}
          </div>
        )}

        {/* 하단 정보 영역 */}
        <div className="px-6 py-6 space-y-5">
          {/* 소개글 */}
          {card.bio && (
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {card.bio}
            </p>
          )}

          {/* 연락처 */}
          <div className="space-y-3">
            {card.phone && (
              <a
                href={`tel:${card.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-lg">📱</span>
                <span className="text-gray-700 dark:text-gray-200">
                  {card.phone}
                </span>
              </a>
            )}
            {card.email && (
              <a
                href={`mailto:${card.email}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-lg">✉️</span>
                <span className="text-gray-700 dark:text-gray-200">
                  {card.email}
                </span>
              </a>
            )}
          </div>

          {/* SNS 링크 */}
          {card.links.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {card.links
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-200"
                  >
                    <span>{platformIcons[link.platform] || "🔗"}</span>
                    <span className="capitalize">{link.platform}</span>
                  </a>
                ))}
            </div>
          )}

          {/* 연락처 저장 버튼 */}
          <a
            href={`/api/vcard/${card.slug}`}
            className="block w-full text-center py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            연락처 저장
          </a>
        </div>
      </div>
    </div>
  );
}
