import { motion, useReducedMotion } from "motion/react";
import { CtaPair } from "@/components/layout/CtaPair";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-bg pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="relative overflow-hidden bg-bg-elevated">
          <img
            src="/images/cyclorama.jpg"
            alt="Lighthill Studio white cyclorama"
            className="mx-auto h-auto max-h-[58svh] w-full object-contain object-center md:max-h-[68svh]"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-bg/85 to-transparent" />
        </div>
        <div className="pt-8 pb-14 md:pt-12 md:pb-20">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl font-display text-display text-fg italic"
          >
            A studio made of light.
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-lead leading-relaxed text-fg-muted"
          >
            In-house photography for maternity, newborns, families, brands,
            headshots, and celebrations — and a cyclorama you can rent when
            you want the space to yourself.
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            <CtaPair />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
