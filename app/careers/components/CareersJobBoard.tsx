"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, Briefcase, ArrowRight, Sparkles, Filter } from "lucide-react";
import { roles, type Role } from "../roles";

export function CareersJobBoard({ initialLocation }: { initialLocation?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || "All");

  const departments = useMemo(() => {
    const deps = new Set<string>();
    roles.forEach((r) => deps.add(r.department || r.category));
    return ["All", ...Array.from(deps)];
  }, []);

  const locations = useMemo(() => {
    return ["All", "Remote", "San Francisco", "London", "Dublin", "Berlin", "Chicago"];
  }, []);

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      // Search text filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        role.title.toLowerCase().includes(query) ||
        role.tagline.toLowerCase().includes(query) ||
        role.category.toLowerCase().includes(query) ||
        (role.location && role.location.toLowerCase().includes(query));

      // Department filter
      const matchesDep =
        selectedDepartment === "All" ||
        role.department === selectedDepartment ||
        role.category === selectedDepartment;

      // Location filter
      const matchesLoc =
        selectedLocation === "All" ||
        (role.location && role.location.toLowerCase().includes(selectedLocation.toLowerCase()));

      return matchesSearch && matchesDep && matchesLoc;
    });
  }, [searchQuery, selectedDepartment, selectedLocation]);

  return (
    <section id="open-roles" className="relative w-full border-t border-black/10 bg-white py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-12 sm:flex-row sm:items-end sm:pb-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Open Opportunities
            </span>
            <h2 className="mt-3 font-serif text-[clamp(2.5rem,5vw,5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-[#0c1017]">
              Find your next role.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-black/65 sm:text-lg">
            We are looking for exceptional craftspeople, systems thinkers, and AI pioneers.
            All roles offer tier-1 equity, top health care, and remote flexibility.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-10 space-y-6">
          {/* Search bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role title, skill, or keyword..."
              className="w-full rounded-2xl border border-black/15 bg-[#faf9f6] py-3.5 pl-12 pr-4 text-sm font-medium text-black placeholder:text-black/40 outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          {/* Department Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-black/40 mr-2">
              Team:
            </span>
            {departments.map((dept) => {
              const active = selectedDepartment === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDepartment(dept)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold tracking-tight transition-all ${
                    active
                      ? "bg-black text-white"
                      : "bg-[#f4f3ec] text-black/70 hover:bg-black/10 hover:text-black"
                  }`}
                >
                  {dept}
                </button>
              );
            })}
          </div>

          {/* Location Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-black/40 mr-2">
              Location:
            </span>
            {locations.map((loc) => {
              const active = selectedLocation === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setSelectedLocation(loc)}
                  className={`cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                    active
                      ? "border-black bg-black text-white"
                      : "border border-black/10 bg-white text-black/70 hover:border-black"
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Count */}
        <div className="mt-8 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-black/50 border-b border-black/10 pb-4">
          <span>Showing {filteredRoles.length} open {filteredRoles.length === 1 ? "role" : "roles"}</span>
          {(searchQuery || selectedDepartment !== "All" || selectedLocation !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedDepartment("All");
                setSelectedLocation("All");
              }}
              className="text-[#ff5600] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Roles List matching fin.ai /careers */}
        <div className="mt-6 divide-y divide-black/10">
          {filteredRoles.length > 0 ? (
            filteredRoles.map((role) => (
              <Link
                key={role.slug}
                href={`/careers/${role.slug}`}
                className="group flex flex-col justify-between gap-4 py-8 transition-all hover:pl-2 sm:flex-row sm:items-center sm:gap-8"
              >
                <div className="max-w-3xl space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                    <span className="text-[#ff5600]">{role.category}</span>
                    <span className="text-black/30">·</span>
                    <span className="text-black/60 flex items-center gap-1">
                      <MapPin size={12} />
                      {role.location}
                    </span>
                    <span className="text-black/30">·</span>
                    <span className="text-black/50">{role.employmentType}</span>
                  </div>

                  <h3 className="font-serif text-2xl font-normal tracking-tight text-black transition group-hover:text-[#ff5600] sm:text-3xl">
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
              <p className="text-lg">No open roles found matching your filter criteria.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartment("All");
                  setSelectedLocation("All");
                }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-black underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
