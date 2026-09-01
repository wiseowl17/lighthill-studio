import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CtaPair } from "@/components/layout/CtaPair";

export function Hero() {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduce) return;

    const play = () => {
      void video.play().catch(() => undefined);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) play();
        else video.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(video);

    const onVis = () => {
      if (document.hidden) video.pause();
      else play();
    };
    document.addEventListener("visibilitychange", onVis);
    play();

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduce]);

  return (
    <section className="relative isolate flex min-h-svh items-end overflow-hidden bg-bg">
      {reduce ? (
        <img
          src="/images/hero-poster.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_62%]"
        />
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-[center_62%]"
          poster="/images/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      )}

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-bg via-bg/55 to-bg/25" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-bg/85 to-transparent" />

      <div className="relative mx-auto w-full max-w-7xl px-5 pt-36 pb-14 md:px-8 md:pb-24">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs font-medium tracking-[0.22em] text-fg-muted uppercase"
        >
          In-house photography
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 max-w-5xl font-display text-display text-fg italic"
        >
          A studio made of light.
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-lg text-lead leading-relaxed text-fg-muted"
        >
          Directed sessions on the cyclorama — maternity, newborns, families,
          brands, headshots, celebrations. Or take the room yourself.
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9"
        >
          <CtaPair />
        </motion.div>
      </div>
    </section>
  );
}
