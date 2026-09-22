"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function FaqHero({ total }: { total: number }) {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 22 } as const),
    animate: { opacity: 1, y: 0 } as const,
    transition: { duration: 0.65, delay, ease },
  });

  return (
    <section className="relative overflow-hidden border-b border-[#758269]/20 bg-[#e9eee3] px-6 pt-14 md:px-10 md:pt-20">
      <div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:radial-gradient(#9dac8c_1px,transparent_1px)] [background-size:24px_24px]" />
      <div aria-hidden="true" className="absolute -left-32 top-6 size-[26rem] rounded-full bg-[#d5e3c8]/70 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-24 bottom-0 size-[22rem] rounded-full bg-[#e4d8f3]/50 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-3 lg:grid-cols-[1fr_0.6fr]">
        <div className="pb-14 md:pb-20">
          <motion.p {...rise(0)} className="inline-flex items-center gap-2 rounded-full border border-[#758269]/35 bg-white/55 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#5d6d50]">
            <motion.span
              animate={reduce ? undefined : { scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-[#849d6d]"
            />
            Help center
          </motion.p>
          <motion.h1 {...rise(0.08)} className="mt-7 max-w-3xl text-5xl font-medium leading-[0.93] tracking-[-0.065em] sm:text-6xl">
            Answers, without the <span className="font-[family-name:var(--font-instrument-serif)] italic font-normal text-[#667b55]">runaround.</span>
          </motion.h1>
          <motion.p {...rise(0.16)} className="mt-6 max-w-xl text-sm leading-6 text-[#596353] md:text-base">
            Everything you&apos;d ask before putting an AI in front of your customers — {total} questions, straight answers.
          </motion.p>
        </div>
        <motion.div {...rise(0.2)} className="relative mx-auto w-full max-w-[300px] self-end">
          <motion.div
            animate={reduce ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/images/help-center-sloth.png"
              alt="Elpino's helpful sloth guide reading a handbook"
              width={1024}
              height={1536}
              priority
              sizes="(min-width: 1024px) 26vw, 0px"
              className="hidden h-auto w-full lg:block"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
