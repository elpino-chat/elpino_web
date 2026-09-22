"use client";

import Image from "next/image";

type MarqueeItem = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  aspect: string;
};

const marqueeItems: MarqueeItem[] = [
  {
    src: "/images/about-sloth-crew.png",
    alt: "Elpino engineering crew in a deep design sprint",
    caption: "Deep focus & unyielding craft",
    width: 640,
    height: 360,
    aspect: "w-[300px] md:w-[380px]",
  },
  {
    src: "/about-remote-team.png",
    alt: "Remote-first global collaboration",
    caption: "Global team, asynchronous flow",
    width: 600,
    height: 400,
    aspect: "w-[280px] md:w-[360px]",
  },
  {
    src: "/images/community-sloths.png",
    alt: "Elpino community gathering and hackathon",
    caption: "Pioneer salons & builder meetups",
    width: 640,
    height: 400,
    aspect: "w-[310px] md:w-[400px]",
  },
  {
    src: "/images/founders-sloth.png",
    alt: "Founders aligning on product roadmap",
    caption: "Founder-led & high conviction",
    width: 620,
    height: 380,
    aspect: "w-[290px] md:w-[370px]",
  },
  {
    src: "/images/busy-teams-sloth.png",
    alt: "Cross-functional team shipping live AI workflows",
    caption: "Zero meetings, maximum velocity",
    width: 640,
    height: 390,
    aspect: "w-[300px] md:w-[390px]",
  },
  {
    src: "/images/blog/learning-sloth.png",
    alt: "AI Research group benchmarking reasoning accuracy",
    caption: "Frontier research & synthetic eval",
    width: 600,
    height: 420,
    aspect: "w-[270px] md:w-[340px]",
  },
  {
    src: "/images/trust-sloth.png",
    alt: "Security and trust engineering team",
    caption: "Enterprise trust by design",
    width: 620,
    height: 380,
    aspect: "w-[290px] md:w-[370px]",
  },
  {
    src: "/desk_avatar1.png",
    alt: "Pino at the workstation",
    caption: "Sloths don't rush bad code",
    width: 500,
    height: 350,
    aspect: "w-[250px] md:w-[320px]",
  },
];

export function CareersMarquee() {
  return (
    <section aria-label="Company gallery" className="w-full overflow-hidden bg-white py-4 md:py-8">
      <div className="group relative flex w-full overflow-hidden">
        {/* Track 1 */}
        <div className="flex shrink-0 animate-marquee items-center gap-4 group-hover:[animation-play-state:paused] md:gap-6">
          {marqueeItems.map((item, index) => (
            <div
              key={`item-1-${index}`}
              className={`relative shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-[#f4f3ec] transition-transform duration-300 hover:scale-[1.02] ${item.aspect}`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 768px) 400px, 300px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between border-t border-black/5 bg-white/90 px-4 py-2.5 backdrop-blur-xs">
                <span className="text-xs font-medium tracking-tight text-black/70">
                  {item.caption}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-black/40">
                  0{index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Track 2 (Duplicate for seamless loop) */}
        <div
          aria-hidden="true"
          className="flex shrink-0 animate-marquee items-center gap-4 group-hover:[animation-play-state:paused] md:gap-6"
        >
          {marqueeItems.map((item, index) => (
            <div
              key={`item-2-${index}`}
              className={`relative shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-[#f4f3ec] transition-transform duration-300 hover:scale-[1.02] ${item.aspect}`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 768px) 400px, 300px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between border-t border-black/5 bg-white/90 px-4 py-2.5 backdrop-blur-xs">
                <span className="text-xs font-medium tracking-tight text-black/70">
                  {item.caption}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-black/40">
                  0{index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
