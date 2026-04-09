'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';

type ImageHeroProps = {
  displayDate: Date;
  imgAnimKey: number;
};

export default function ImageHero({ displayDate, imgAnimKey }: ImageHeroProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const candidates = ['/notion1.webp', '/notion2.webp'];
  const [currentSrc, setCurrentSrc] = React.useState(candidates[displayDate.getMonth() % 2]);
  const monthLabel = displayDate.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const yearLabel = displayDate.getFullYear();

  useEffect(() => {
    setCurrentSrc(candidates[displayDate.getMonth() % 2]);
  }, [displayDate]);

  useEffect(() => {
    // Reveal image on mount
    gsap.fromTo(imageRef.current, 
      { scale: 1.1, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 1.8, ease: 'power3.out' }
    );
  }, []);

  return (
    <div className="relative w-full h-full min-h-[42vh] sm:min-h-[48vh] md:min-h-full overflow-hidden bg-white">
      <div className="absolute inset-0 z-0">
        <Image 
          key={imgAnimKey}
          ref={imageRef}
          src={currentSrc}
          alt="Calendar Hero"
          fill
          className="object-cover img-fade-in"
          sizes="(min-width: 1280px) 40vw, (min-width: 768px) 50vw, 100vw"
          quality={100}
          priority
          onError={() => setCurrentSrc('/notion1.webp')}
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div className="absolute top-6 left-6 z-10 text-white drop-shadow-md">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
          {yearLabel}<br/>
          <span className="font-semibold">{monthLabel}</span>
        </h2>
      </div>
    </div>
  );
}
