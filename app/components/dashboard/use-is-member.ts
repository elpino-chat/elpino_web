"use client";

import { useEffect, useState } from "react";

/** True when the signed-in user is a plain member (not the owner) of the selected workspace. False while loading. */
export function useIsMember(): boolean {
  const [isMember, setIsMember] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/organizations")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { organizations?: { id: string; role: string }[]; selectedOrganizationId?: string } | null) => {
        const organizations = data?.organizations ?? [];
        const selected = organizations.find((org) => org.id === data?.selectedOrganizationId) ?? organizations[0];
        if (!cancelled) setIsMember(selected?.role === "member");
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);
  return isMember;
}
