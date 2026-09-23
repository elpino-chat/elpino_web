"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { roles } from "../roles";

export function CareersJobBoard() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return roles;
    return roles.filter(
      (role) =>
        role.title.toLowerCase().includes(query) ||
        role.tagline.toLowerCase().includes(query) ||
        role.category.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  return (
    <section id="open-roles" className="relative w-full border-t border-black/10 bg-white py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-12 sm:flex-row sm:items-end sm:pb-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2F8CF0]">
              Open Opportunities
            </span>
            <h2 className="mt-3 text-[clamp(2.5rem,5vw,5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-[#0c1017]">
              Find your next role.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-black/65 sm:text-lg">
            We are looking for exceptional craftspeople, systems thinkers, and AI pioneers.
            All roles offer tier-1 equity, top health care, and remote flexibility.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mt-10 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role title, skill, or keyword..."
            className="w-full rounded-2xl border border-black/15 bg-[#faf9f6] py-3.5 pl-12 pr-4 text-sm font-medium text-black placeholder:text-black/40 outline-none transition focus:border-black focus:bg-white"
          />
        </div>

        {/* Roles List matching fin.ai /careers */}
        <div className="mt-10 divide-y divide-black/10">
          {filteredRoles.length > 0 ? (
            filteredRoles.map((role) => (
              <Link
                key={role.slug}
                href={`/careers/${role.slug}`}
                className="group flex flex-col justify-between gap-4 py-8 transition-all hover:pl-2 sm:flex-row sm:items-center sm:gap-8"
              >
                <div className="max-w-3xl space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                    <span className="text-[#2F8CF0]">{role.category}</span>
                    <span className="text-black/30">·</span>
                    <span className="text-black/60 flex items-center gap-1">
                      <MapPin size={12} />
                      {role.location}
                    </span>
                    <span className="text-black/30">·</span>
                    <span className="text-black/50">{role.employmentType}</span>
                  </div>

                  <h3 className="text-2xl font-normal tracking-tight text-black transition group-hover:text-[#2F8CF0] sm:text-3xl">
                    {role.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-black/60 sm:text-base">
                    {role.tagline}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3 pt-2 sm:pt-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-black/60 group-hover:text-black hidden md:inline">
                    View & Apply
                  </span>
                  <span className="flex size-12 items-center justify-center rounded-full border border-black/15 bg-white text-black transition-all group-hover:scale-105 group-hover:border-black group-hover:bg-black group-hover:text-white">
                    <ArrowRight size={18} />
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-20 text-center text-black/50">
              <p className="text-lg">No open roles found matching your search.</p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-black underline underline-offset-4"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
