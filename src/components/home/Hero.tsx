import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { CtaPair } from "@/components/layout/CtaPair";
import { Photo } from "@/components/media/Photo";
import { useI18n } from "@/lib/i18n/provider";

type ExtraVideoAttrs = {
  "webkit-playsinline"?: string;
  "x5-playsinline"?: string;
  "x5-video-player-type"?: string;
};

function armVideo(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.autoplay = true;
  video.playsInline = true;
  video.loop = true;
  video.setAttribute("muted", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.setAttribute("x5-playsinline", "true");
  video.setAttribute("x5-video-player-type", "h5");
}

function tryPlay(video: HTMLVideoElement) {
  armVideo(video);
  if (!video.paused && !video.ended && video.currentTime > 0) return;
  const play = video.play();
  if (play) void play.catch(() => undefined);
}

export function Hero() {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liveRef = useRef(false);
  const [videoLive, setVideoLive] = useState(false);
  const [useMotionImage, setUseMotionImage] = useState(false);
  const { copy } = useI18n();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduce) {
      video.pause();
      return;
    }

    armVideo(video);
    if (video.readyState === 0) video.load();
    tryPlay(video);

    const onReady = () => tryPlay(video);
    const onPlaying = () => {
      liveRef.current = true;
      setVideoLive(true);
      setUseMotionImage(false);
    };

    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("canplaythrough", onReady);
    video.addEventListener("playing", onPlaying);

    const poll = window.setInterval(() => tryPlay(video), 350);
    const stopPollOnPlay = () => window.clearInterval(poll);
    video.addEventListener("playing", stopPollOnPlay);

    const giveUp = window.setTimeout(() => window.clearInterval(poll), 8000);
    // Show the animated WebP only when autoplay is blocked (data loaded, yet
    // paused — e.g. iOS Low Power Mode). On a slow connection the video simply
    // hasn't buffered; fetching a second 860 KB file then only slows it more.
    const fallbackTimer = window.setInterval(() => {
      if (liveRef.current) return window.clearInterval(fallbackTimer);
      if (video.readyState >= 2 && video.paused) {
        setUseMotionImage(true);
        window.clearInterval(fallbackTimer);
      }
    }, 700);

    const onVis = () => {
      if (!document.hidden) tryPlay(video);
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", onReady);
    window.addEventListener("focus", onReady);

    const unlock = () => tryPlay(video);
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("click", unlock);

    return () => {
      window.clearInterval(poll);
      window.clearTimeout(giveUp);
      window.clearInterval(fallbackTimer);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("canplaythrough", onReady);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("playing", stopPollOnPlay);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", onReady);
      window.removeEventListener("focus", onReady);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("click", unlock);
    };
  }, [reduce]);

  const extraVideoAttrs: ExtraVideoAttrs = {
    "webkit-playsinline": "true",
    "x5-playsinline": "true",
    "x5-video-player-type": "h5",
  };

  return (
    <section className="relative isolate flex min-h-svh items-end overflow-hidden bg-bg">
      <Photo
        src="/images/hero-poster.jpg"
        alt=""
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-[center_62%]"
        aria-hidden
      />
      {!reduce ? (
        <>
          {useMotionImage && !videoLive ? (
            <img
              src="/videos/hero.webp"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[center_62%]"
              aria-hidden
            />
          ) : null}
          <video
            ref={(el) => {
              videoRef.current = el;
              if (el) {
                armVideo(el);
                tryPlay(el);
              }
            }}
            className="absolute inset-0 h-full w-full object-cover object-[center_62%] transition-opacity duration-200"
            src="/videos/hero.mp4"
            poster="/images/hero-poster-800.webp"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            width={960}
            height={710}
            aria-hidden
            style={{ opacity: useMotionImage && !videoLive ? 0 : 1 }}
            {...extraVideoAttrs}
          />
        </>
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-bg via-bg/55 to-bg/25" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-bg/85 to-transparent" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pt-36 pb-14 md:px-8 md:pb-24">
        <p
          className="rise text-xs font-medium tracking-[0.22em] text-fg-muted uppercase"
          style={{ "--rise-y": "10px" } as CSSProperties}
        >
          {copy.hero.eyebrow}
        </p>
        <h1
          className="rise mt-4 max-w-5xl font-display text-display text-fg italic"
          style={{ "--rise-y": "18px", "--rise-delay": "60ms" } as CSSProperties}
        >
          {copy.hero.title}
        </h1>
        <p
          className="rise mt-5 max-w-lg text-lead leading-relaxed text-fg-muted"
          style={{ "--rise-y": "14px", "--rise-delay": "140ms" } as CSSProperties}
        >
          {copy.hero.lede}
        </p>
        <div className="rise mt-9" style={{ "--rise-delay": "220ms" } as CSSProperties}>
          <CtaPair />
        </div>
      </div>
    </section>
  );
}
