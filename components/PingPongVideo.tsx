'use client';

import { useEffect, useRef } from 'react';

interface PingPongVideoProps {
  src: string;
  className?: string;
}

const STEP = 1 / 24;          // reverse step per frame (~24 fps)
const END_THRESHOLD = 0.08;   // start reversing this many seconds before the end

export default function PingPongVideo({ src, className }: PingPongVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let reversing = false;

    const v = video as HTMLVideoElement & { fastSeek?: (t: number) => void };
    const seek = (t: number) => {
      if (v.fastSeek) {
        v.fastSeek(t);
      } else {
        v.currentTime = t;
      }
    };

    const reverseStep = () => {
      const next = video.currentTime - STEP;
      if (next <= 0) {
        seek(0);
        video.addEventListener('seeked', () => {
          reversing = false;
          video.play().catch(() => {});
        }, { once: true });
      } else {
        seek(next);
        video.addEventListener('seeked', () => {
          if (reversing) reverseStep();
        }, { once: true });
      }
    };

    const handleTimeUpdate = () => {
      if (reversing || !video.duration) return;
      if (video.currentTime >= video.duration - END_THRESHOLD) {
        video.pause();
        reversing = true;
        reverseStep();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      reversing = false;
    };
  }, []);

  return (
    <video ref={videoRef} autoPlay muted playsInline className={className}>
      <source src={src} type="video/mp4" />
    </video>
  );
}
