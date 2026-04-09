'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canUseCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canUseCustomCursor) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;
    const hoverEls = document.querySelectorAll('a, button, [data-cursor]');
    const onEnter = () => document.body.classList.add('cursor-hover');
    const onLeave = () => document.body.classList.remove('cursor-hover');

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(dot, { x: mouseX, y: mouseY });
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      gsap.set(ring, { x: ringX, y: ringY });
    };

    window.addEventListener('mousemove', onMove);
    gsap.ticker.add(tick);
    document.body.classList.add('custom-cursor-active');
    document.body.style.cursor = 'none';

    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      gsap.ticker.remove(tick);
      document.body.classList.remove('custom-cursor-active');
      document.body.classList.remove('cursor-hover');
      document.body.style.cursor = '';
      hoverEls.forEach(el => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
