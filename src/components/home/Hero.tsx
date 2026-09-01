import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { site } from "@data/site";
import { Button } from "@/components/ui/button";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.35]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-dvh items-end overflow-hidden bg-bg"
    >
      <motion.div style={{ y, opacity }} className="absolute inset-0 -z-10">
        <img
          src="/images/cyclorama.jpg"
          alt=""
          className="h-[120%] w-full object-cover object-[center_70%]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/50 to-bg/25" />
        <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-bg/80 to-transparent" />
        <div className="grain" />
      </motion.div>

      <div className="relative mx-auto w-full max-w-7xl px-5 pt-36 pb-16 md:px-8 md:pb-24">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs font-medium tracking-[0.22em] text-fg-muted uppercase"
        >
          {site.location}
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-5xl font-display text-display text-fg italic"
        >
          {site.tagline}
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-xl text-lead leading-relaxed text-fg-muted"
        >
          In-house photography for maternity, newborns, families, brands, and
          the days that matter — and a cyclorama you can rent when you want
          the space to yourself.
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Button variant="primary" size="lg" asChild>
            <Link to="/contact" search={{ type: "shoot" }}>
              Book a Shoot
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a
              href={site.peerspaceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Rent the Space
              <ArrowUpRight className="size-3.5" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
