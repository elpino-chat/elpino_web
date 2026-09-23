"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, ArrowRight, Building2, Globe2 } from "lucide-react";

type Office = {
  city: string;
  country: string;
  address: string[];
  rolesCount: number;
  highlight: string;
  vibe: string;
};

const offices: Office[] = [
  {
    city: "San Francisco",
    country: "USA (HQ)",
    address: ["55 2nd Street, 4th Floor", "San Francisco, CA 94105"],
    rolesCount: 3,
    highlight: "Core AI & Executive Strategy Hub",
    vibe: "SoMa sunbeams, floor-to-ceiling glass, continuous whiteboarding",
  },
  {
    city: "London",
    country: "United Kingdom",
    address: ["9th Floor, The Warehouse", "211 Old St, London, EC1V 9NR"],
    rolesCount: 2,
    highlight: "European Engineering & Infra Hub",
    vibe: "Historic brick loft in Shoreditch, artisanal roaster downstairs",
  },
  {
    city: "Dublin",
    country: "Ireland",
    address: ["124 St Stephen's Green", "Dublin 2, D02 C628"],
    rolesCount: 2,
    highlight: "Security & Trust Operations",
    vibe: "Overlooking the park, tea on tap, world-class compliance crew",
  },
  {
    city: "Berlin",
    country: "Germany",
    address: ["Zimmerstrasse 78, Floor 7", "10117 Berlin"],
    rolesCount: 1,
    highlight: "Forward Deployed & Enterprise Solutions",
    vibe: "Kreuzberg industrial loft, high-speed fiber, club mate fridge",
  },
  {
    city: "Chicago",
    country: "USA",
    address: ["1330 W. Fulton Market, Suite 750", "Chicago, IL 60607"],
    rolesCount: 1,
    highlight: "Customer Success & GTM Operations",
    vibe: "Fulton Market design district, rooftop terrace, coffee labs",
  },
  {
    city: "Sydney",
    country: "Australia",
    address: ["285A Crown St, 1st Floor", "Surry Hills, NSW 2010"],
    rolesCount: 1,
    highlight: "APAC Realtime Support & Solutions",
    vibe: "Crown Street buzz, surf gear in the lobby, morning flat whites",
  },
];

export function CareersOffices({ onSelectLocation }: { onSelectLocation?: (loc: string) => void }) {
  const [activeCity, setActiveCity] = useState<string>("San Francisco");

  function handleFilter(city: string) {
    setActiveCity(city);
    if (onSelectLocation) {
      onSelectLocation(city);
    }
    const el = document.getElementById("open-roles");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative w-full border-t border-black/10 bg-[#faf9f6] py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-12 sm:flex-row sm:items-end sm:pb-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Global Presence
            </span>
            <h2 className="mt-3 text-[clamp(2.5rem,5vw,5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-[#0c1017]">
              Six international offices. One global team.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-black/65 sm:text-lg">
            Work from our beautiful physical hubs, or choose to work 100% remotely with a
            global co-working pass.
          </p>
        </div>

        {/* Global Remote Banner */}
        <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-3xl border border-black/10 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#ff5600]/10 text-[#ff5600]">
              <Globe2 size={24} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-black">Remote Anywhere (Global)</h4>
              <p className="text-sm text-black/60">
                All engineering, research, and design roles are 100% remote-compatible worldwide.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleFilter("Remote")}
            className="cursor-pointer rounded-full bg-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#ff5600]"
          >
            See Remote Roles
          </button>
        </div>

        {/* 6 Office Cards Grid matching fin.ai */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((office) => {
            const isSelected = activeCity === office.city;
            return (
              <div
                key={office.city}
                onClick={() => setActiveCity(office.city)}
                className={`group flex flex-col justify-between rounded-3xl border p-8 transition-all duration-300 ${
                  isSelected
                    ? "border-black bg-white shadow-lg"
                    : "border-black/10 bg-white/70 hover:border-black/30 hover:bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#ff5600]">
                      {office.country}
                    </span>
                    <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-black/70">
                      {office.rolesCount} {office.rolesCount === 1 ? "role" : "roles"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-3xl font-normal text-black">
                    {office.city}
                  </h3>

                  <div className="mt-4 space-y-1 text-sm text-black/60">
                    {office.address.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>

                  <div className="mt-6 rounded-xl bg-[#faf9f6] p-3 text-xs text-black/70">
                    <span className="font-semibold text-black">Hub Focus:</span> {office.highlight}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-black/5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFilter(office.city);
                    }}
                    className="group/btn inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black transition hover:text-[#ff5600]"
                  >
                    <span>View {office.city} roles</span>
                    <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
