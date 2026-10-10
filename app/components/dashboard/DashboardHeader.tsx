"use client";

import { fetchConversations } from "@/app/lib/fetch-conversations";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { connectPresenceSocket } from "@/lib/presence-socket";
import { clearUnseenMessages, countUnseenMessage, playAssignmentChime, playMessageChimeOnce, primeOnFirstInteraction } from "@/lib/notification-sound";
import { toast } from "sonner";
import { InvitePeopleDialog } from "./InvitePeopleDialog";
import { NotificationsBell } from "./NotificationsBell";
import { AssignmentToast } from "./AssignmentToast";
import { useMobileDrawer } from "./mobile-drawer-context";
import DashboardTour from "./DashboardTour";

const NOTIFICATIONS_MUTED_KEY = "elpino-notifications-muted";
import {
  Bell,
  BookOpen,
  Bot,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Gauge,
  Inbox,
  LogOut,
  Menu,
  MessageCircle,
  Palette,
  Pin,
  Plus,
  Rocket,
  Search,
  X,
  Settings,
  Users,
  UserPlus,
  VolumeX,
} from "lucide-react";

type Organization = { id: string; name: string; role: string };
type HeaderUser = { email: string; name?: string };
type SearchConversation = { id: string; name: string; preview: string; initials: string };
type SearchPerson = { id: string; email: string };

// Space's panel is a real drawer hidden below md (the Analytics reports use an
// in-page tab bar instead, so they have none), and the Contacts
// tools panel is one hidden below lg — none has any other way to reach it,
// so the hamburger opens whichever one the current route has, at that
// route's own breakpoint. The Team Inbox and AI Assist conversation lists
// went a different way (see HomePanel.tsx / ai-assist/page.tsx): on mobile
// they're the full-screen view by default, swapped for the open
// conversation on selection, WhatsApp-style — so they need no hamburger at
// all, on any route.
const SPACE_ROUTES = ["/dashboard", "/dashboard/notifications", "/dashboard/issues"];
const SETTINGS_ROUTE_PREFIX = "/dashboard/settings";

/** One row of the account menu: icon, label, and an optional trailing mark. Taller on phones, where the menu is a sheet. */
function AccountMenuItem({ icon: Icon, label, onClick, trailing }: { icon: typeof Bell; label: string; onClick: () => void; trailing?: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] hover:bg-[#f1f2f3] sm:h-10">
      <Icon size={18} className="text-[#686d73]" />
      <span className="flex-1 truncate">{label}</span>
      {trailing}
    </button>
  );
}

export default function DashboardHeader({ user }: { user: HeaderUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggle: toggleDrawer } = useMobileDrawer();
  const searchParams = useSearchParams();
  const isSpaceRoute = SPACE_ROUTES.includes(pathname);
  const isSettingsRoute = pathname === SETTINGS_ROUTE_PREFIX || pathname.startsWith(`${SETTINGS_ROUTE_PREFIX}/`);
  // Live notifications (unread activity, escalations, secure requests) plus
  // unresolved issues — both drop on their own as things get read/resolved,
  // so this stays accurate without a separate "seen it" flag to maintain.
  const [spaceBadgeCount, setSpaceBadgeCount] = useState(0);
  // The Inbox sidebar only fits beside the list and the open chat from xl up; below that it is a drawer.
  // On phones the Inbox is a stack of pages (menu, then a list, then a chat). The burger would open the same options as
  // the menu page, so it is hidden there; each page carries its own "Inbox" back row.
  const inInboxFlow = pathname === "/dashboard/inbox" || pathname === "/dashboard/tickets";
  const hamburgerBreakpoint =
    isSpaceRoute || isSettingsRoute ? "md:hidden" : inInboxFlow ? "max-lg:hidden xl:hidden" : null;
  // Back to the Inbox menu from one of its lists or from Tickets (phones only; the open chat has its own back arrow).
  const showInboxBack =
    pathname === "/dashboard/tickets" || (pathname === "/dashboard/inbox" && Boolean(searchParams.get("list")) && !searchParams.get("conversation"));
  // On wide screens the inbox has no top bar: only the avatar menu stays, in the corner of the icon
  // rail. The header itself stays mounted, because it owns presence, notification sounds and the
  // invite dialog.
  const compact = pathname === "/dashboard/inbox" || pathname === "/dashboard/tickets";
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selected, setSelected] = useState<Organization | null>(null);
  const [open, setOpen] = useState(false);
  const [creatingOrganization, setCreatingOrganization] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationSaving, setOrganizationSaving] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsMuted, setNotificationsMuted] = useState(false);
  // Read inside the presence socket's event handler instead of
  // `notificationsMuted` directly: the socket effect only re-runs when
  // `accountId` changes (reconnecting the socket every time someone toggles
  // mute would be wasteful), so the handler needs a ref to see the current
  // value rather than the one captured when it was first attached.
  const notificationsMutedRef = useRef(false);
  // Toast ids of the Join alerts on screen, per conversation.
  const alertToastsRef = useRef<Map<string, (string | number)[]>>(new Map());
  useEffect(() => {
    notificationsMutedRef.current = notificationsMuted;
  }, [notificationsMuted]);
  const switcherRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  // On phones the search bar is a row below the header that the search icon opens and the close icon puts away. From md up it is
  // always in the header, so this only matters below md.
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchLoaded, setSearchLoaded] = useState(false);
  const [searchConversations, setSearchConversations] = useState<SearchConversation[]>([]);
  const [searchPeople, setSearchPeople] = useState<SearchPerson[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [accountId, setAccountId] = useState("");
  const [presenceStatus, setPresenceStatus] = useState<"online" | "away" | "brb">("online");
  const [socketConnected, setSocketConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    try {
      setNotificationsMuted(window.localStorage.getItem(NOTIFICATIONS_MUTED_KEY) === "1");
    } catch {
      // Private browsing / storage disabled — badge just stays unmuted.
    }
  }, []);

  const refreshSpaceBadge = useCallback(() => {
    Promise.all([
      fetch("/api/notifications", { cache: "no-store" }).then((response) => (response.ok ? response.json() : { entries: [] })),
      fetch("/api/workspace/tickets", { cache: "no-store" }).then((response) => (response.ok ? response.json() : { tickets: [] })),
    ])
      .then(([notificationData, ticketData]: [{ entries?: unknown[] }, { tickets?: { resolved?: boolean }[] }]) => {
        const unresolvedIssues = (ticketData.tickets ?? []).filter((ticket) => !ticket.resolved).length;
        setSpaceBadgeCount((notificationData.entries?.length ?? 0) + unresolvedIssues);
      })
      .catch(() => setSpaceBadgeCount(0));
  }, []);

  // Refetched on arrival (not just on a poll) — reused hooks straight into
  // the notification socket connected below, the same live signal the
  // assignment toast already reacts to.
  useEffect(() => {
    refreshSpaceBadge();
  }, [refreshSpaceBadge, pathname]);

  function toggleNotificationsMuted() {
    const next = !notificationsMuted;
    setNotificationsMuted(next);
    try {
      window.localStorage.setItem(NOTIFICATIONS_MUTED_KEY, next ? "1" : "0");
    } catch {
      // Nothing to persist to here; the account still gets it below.
    }
    // Saved on the account so the switch follows the person to every browser. Put back if the save fails.
    void fetch("/api/account/notifications-muted", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ muted: next }),
    }).then((response) => {
      if (response.ok) return;
      setNotificationsMuted(!next);
      try { window.localStorage.setItem(NOTIFICATIONS_MUTED_KEY, !next ? "1" : "0"); } catch { /* ignore */ }
    }).catch(() => undefined);
  }

  useEffect(() => {
    fetch("/api/account")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { account?: { id: string; avatarUrl: string | null; presenceStatus?: string; notificationsMuted?: boolean } } | null) => {
        setAvatarUrl(data?.account?.avatarUrl ?? "");
        // The account is the source of truth, so the switch is the same in every browser; this browser's copy just follows it.
        if (typeof data?.account?.notificationsMuted === "boolean") {
          setNotificationsMuted(data.account.notificationsMuted);
          try { window.localStorage.setItem(NOTIFICATIONS_MUTED_KEY, data.account.notificationsMuted ? "1" : "0"); } catch { /* storage off: the account value still applies */ }
        }
        setAccountId(data?.account?.id ?? "");
        const status = data?.account?.presenceStatus;
        if (status === "online" || status === "away" || status === "brb") setPresenceStatus(status);
      })
      .catch(() => undefined);
    fetch("/api/workspace/conversations/my-status")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { busy?: boolean } | null) => setBusy(Boolean(data?.busy)))
      .catch(() => undefined);
  }, []);

  // One-time unlock so the chime below can actually play — see
  // lib/notification-sound.ts for why this has to wait for a real click.
  useEffect(() => {
    primeOnFirstInteraction();
    // The "(3) New messages" title has done its job once the tab is looked at.
    const onVisible = () => { if (!document.hidden) clearUnseenMessages(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Keeps presence real: the gateway marks this account online for as long
  // as this socket is connected, and offline once it (and every other open
  // tab) disconnects — replacing what used to be a purely manual status.
  // The same connection also carries real-time assignment pushes (see
  // PresenceGateway.notifyUser on the gateway) — one socket, two purposes,
  // rather than opening a second connection just for notifications.
  useEffect(() => {
    if (!accountId) return;
    const socket = connectPresenceSocket(accountId);
    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("presence:update", (payload: { userId?: string; status?: string }) => {
      if (payload.userId !== accountId) return;
      if (payload.status === "online" || payload.status === "away" || payload.status === "brb") {
        setPresenceStatus(payload.status);
      }
    });
    // Pushed whenever a conversation is assigned to, resolved for, or left
    // by this account — see ConversationsService.pushBusyStatus on the
    // backend. Replaces the one-time fetch on mount as the live source.
    socket.on("busy:update", (payload: { userId?: string; busy?: boolean }) => {
      if (payload.userId !== accountId) return;
      setBusy(Boolean(payload.busy));
    });
    socket.on("notification", (payload: { userId?: string; notification?: { id?: string; conversationId?: string; title?: string; detail?: string } }) => {
      if (payload.userId !== accountId) return;
      // Badge reflects real state regardless of whether the chime/toast is
      // muted — muting silences the alert, not the count.
      refreshSpaceBadge();
      if (notificationsMutedRef.current) return;
      const notification = payload.notification;
      if (!notification?.conversationId || !notification.title) return;
      playAssignmentChime();
      // "escalated:" alerts go to the whole team at once — see
      // ConversationsService.notifyTeamOfEscalation.
      const teamAlert = notification.id?.startsWith("escalated:") ?? false;
      const ticket = notification.id?.startsWith("ticket:") ?? false;
      // Remember which toast belongs to which conversation, so it can be
      // cleared for everyone the moment someone joins.
      const toastId = toast.custom(
        (id) => (
          <AssignmentToast
            notification={{ conversationId: notification.conversationId!, title: notification.title!, detail: notification.detail ?? "", teamAlert, ticket }}
            onDismiss={() => toast.dismiss(id)}
          />
        ),
        { position: "bottom-right", duration: teamAlert ? 90_000 : 45_000 },
      );
      const list = alertToastsRef.current.get(notification.conversationId) ?? [];
      alertToastsRef.current.set(notification.conversationId, [...list, toastId]);
    });
    // Someone pressed Join (or replied): take the alert away from everyone
    // else, tell them who has it, and let the inbox know.
    socket.on("conversation:joined", (payload: { joined?: { conversationId?: string; userId?: string; name?: string } }) => {
      const joined = payload.joined;
      if (!joined?.conversationId || !joined.userId) return;
      for (const id of alertToastsRef.current.get(joined.conversationId) ?? []) toast.dismiss(id);
      alertToastsRef.current.delete(joined.conversationId);
      if (joined.userId !== accountId) toast(`${joined.name || "A teammate"} joined this chat`, { duration: 4000 });
      window.dispatchEvent(new CustomEvent("elpino:conversation-joined", { detail: joined }));
    });
    // The AI's turn in a conversation, step by step as it happens: handed to the open inbox thread.
    socket.on("agent:progress", (payload: { progress?: { conversationId?: string } }) => {
      if (!payload.progress?.conversationId) return;
      window.dispatchEvent(new CustomEvent("elpino:ai-progress", { detail: payload.progress }));
    });
    // A customer wrote in a conversation this account is responsible for —
    // see WidgetService.postMessage. A sound and a tab-title count, never a
    // toast: a busy inbox would bury the screen in them.
    socket.on("message:new", (payload: { userIds?: string[]; message?: { conversationId?: string; messageId?: string } }) => {
      const message = payload.message;
      if (!message?.conversationId || !message.messageId) return;
      if (payload.userIds && !payload.userIds.includes(accountId)) return;
      // Already reading that exact thread in this tab: nothing to announce.
      const viewing = document.visibilityState === "visible"
        && window.location.pathname === "/dashboard/inbox"
        && new URLSearchParams(window.location.search).get("conversation") === message.conversationId;
      if (viewing) return;
      if (document.hidden) countUnseenMessage();
      if (notificationsMutedRef.current) return;
      void playMessageChimeOnce(message.messageId);
    });
    return () => {
      socket.disconnect();
    };
  }, [accountId, refreshSpaceBadge]);

  async function updateStatus(next: "online" | "away" | "brb") {
    setStatusSaving(true);
    try {
      const response = await fetch("/api/account/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (response.ok) {
        setPresenceStatus(next);
        setStatusOpen(false);
      }
    } finally {
      setStatusSaving(false);
    }
  }

  useEffect(() => {
    fetch("/api/organizations")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { organizations?: Organization[]; selectedOrganizationId?: string } | null) => {
        if (!data?.organizations?.length) return;
        setOrganizations(data.organizations);
        setSelected(
          data.organizations.find((organization) => organization.id === data.selectedOrganizationId) ??
            data.organizations[0],
        );
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    function closeDropdown(event: MouseEvent) {
      // Base UI popovers (e.g. the status picker) render their content in a
      // portal outside accountRef's DOM subtree, so a plain .contains()
      // check would treat clicks inside them as "outside" and close the
      // account menu before the popover's own click handler runs.
      const target = event.target as Node;
      if (target instanceof Element && target.closest('[data-slot="popover-content"], [data-slot="popover-trigger"]')) return;

      if (switcherRef.current && !switcherRef.current.contains(target)) setOpen(false);
      if (accountRef.current && !accountRef.current.contains(target)) setAccountOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) searchInputRef.current?.focus();
  }, [mobileSearchOpen]);

  function closeMobileSearch() {
    setMobileSearchOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }

  function loadSearchData() {
    if (searchLoaded) return;
    setSearchLoaded(true);
    fetchConversations()
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { conversations?: SearchConversation[] } | null) => setSearchConversations(data?.conversations ?? []))
      .catch(() => undefined);
    fetch("/api/invitations")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { invitations?: SearchPerson[] } | null) => setSearchPeople(data?.invitations ?? []))
      .catch(() => undefined);
  }

  function goToConversation(id: string) {
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setSearchQuery("");
    router.push(`/dashboard/inbox?conversation=${id}`);
  }

  function goToPeople() {
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setSearchQuery("");
    router.push("/dashboard/settings/people");
  }

  async function goToWorkspace(organization: Organization) {
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setSearchQuery("");
    await selectWorkspace(organization);
    router.push("/dashboard");
  }

  const searchTerm = searchQuery.trim().toLowerCase();
  const matchedConversations = searchTerm
    ? searchConversations.filter((c) => c.name.toLowerCase().includes(searchTerm) || c.preview.toLowerCase().includes(searchTerm)).slice(0, 5)
    : [];
  const matchedPeople = searchTerm ? searchPeople.filter((p) => p.email.toLowerCase().includes(searchTerm)).slice(0, 5) : [];
  const matchedWorkspaces = searchTerm ? organizations.filter((o) => o.name.toLowerCase().includes(searchTerm)).slice(0, 5) : [];
  const hasSearchResults = matchedConversations.length > 0 || matchedPeople.length > 0 || matchedWorkspaces.length > 0;

  async function selectWorkspace(organization: Organization) {
    setSelected(organization);
    setOpen(false);
    await fetch("/api/organizations/select", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationId: organization.id }),
    });
  }

  async function createOrganization() {
    const name = organizationName.trim();
    if (!name || organizationSaving) return;
    setOrganizationSaving(true);
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) return;

      const refreshResponse = await fetch("/api/organizations");
      if (refreshResponse.ok) {
        const data = (await refreshResponse.json()) as {
          organizations?: Organization[];
          selectedOrganizationId?: string;
        };
        const nextOrganizations = data.organizations ?? [];
        setOrganizations(nextOrganizations);
        setSelected(
          nextOrganizations.find((organization) => organization.id === data.selectedOrganizationId) ??
            nextOrganizations.at(-1) ??
            null,
        );
      }
      setOrganizationName("");
      setCreatingOrganization(false);
    } finally {
      setOrganizationSaving(false);
    }
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      posthog.reset();
      window.ElpinoTag?.logout?.();
      router.push("/login");
      router.refresh();
    }
  }

  const workspaceName = selected?.name || "Elpino";
  const displayName = user.name?.trim() || user.email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase() || "R";

  const statusOptions = [
    { value: "online" as const, label: "Online", dot: "bg-[#30b978]" },
    { value: "away" as const, label: "Away", dot: "bg-[#9aa1a6]" },
    { value: "brb" as const, label: "Be right back", dot: "bg-[#d89831]" },
  ];
  const displayStatus = !socketConnected
    ? { label: "Offline", dot: "bg-[#9aa1a6]" }
    : busy
      ? { label: "Busy — in a conversation", dot: "bg-[#e2574c]" }
      : statusOptions.find((option) => option.value === presenceStatus) ?? statusOptions[0];

  return (
    <header className={`relative z-50 mx-2 my-0.5 flex min-h-12 shrink-0 flex-wrap items-center gap-y-1 rounded-xl bg-transparent px-2.5 py-1 text-[#354052] md:h-12 md:flex-nowrap md:py-0 ${compact ? "dashboard-header-compact xl:fixed xl:bottom-[76px] xl:left-2 xl:z-[60] xl:m-0 xl:h-auto xl:min-h-0 xl:w-auto xl:p-0" : ""}`}>
      {hamburgerBreakpoint && (
        <button
          type="button"
          onClick={toggleDrawer}
          aria-label={spaceBadgeCount > 0 ? `Open menu — ${spaceBadgeCount} new` : "Open menu"}
          className={`relative mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/[0.07] ${hamburgerBreakpoint}`}
        >
          <Menu size={19} />
          {isSpaceRoute && spaceBadgeCount > 0 && (
            <span className="dashboard-header-badge absolute right-0.5 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border-2 border-[#262626] bg-[#e2574c] px-0.5 text-[7.5px] font-bold text-white">
              {spaceBadgeCount > 99 ? "99+" : spaceBadgeCount}
            </span>
          )}
        </button>
      )}
      {showInboxBack && (
        <Link
          href="/dashboard/inbox"
          aria-label="Back to Inbox"
          className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/[0.07] lg:hidden"
        >
          <ChevronLeft size={22} />
        </Link>
      )}
      <div ref={switcherRef} className="relative min-w-0 shrink">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="dashboard-workspace-switcher flex h-10 max-w-full items-center gap-1.5 rounded-md border border-transparent bg-transparent px-1.5 transition-colors hover:bg-black/5 sm:gap-2 sm:px-2.5"
          aria-expanded={open}
        >
          <span className="max-w-[18vw] truncate text-[15px] font-normal text-white sm:max-w-52">{workspaceName}&apos;s Workspace</span>
          <ChevronDown size={15} className={`text-white/70 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="dashboard-workspace-menu absolute left-0 top-11 w-64 rounded-md border border-black/10 bg-[#e8e8e8] p-1.5 text-[#1f2937] shadow-[0_14px_35px_rgba(10,18,30,0.16)]">
            <p className="px-3 py-2 text-[10px] font-normal uppercase tracking-[0.12em] text-[#737b86]">Workspaces</p>
            {(organizations.length ? organizations : selected ? [selected] : []).map((organization) => (
              <button
                key={organization.id}
                type="button"
                onClick={() => void selectWorkspace(organization)}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-black/5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1ebaae] text-xs font-normal text-white">
                  {organization.name.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-normal text-[#1f2937]">{organization.name}&apos;s Workspace</span>
                {organization.id === selected?.id && <Check size={15} className="text-[#5aa8ff]" />}
              </button>
            ))}
            <div className="mt-1 border-t border-black/10 pt-1">
              {creatingOrganization ? (
                <div className="flex items-center gap-1.5 p-1">
                  <input
                    autoFocus
                    value={organizationName}
                    onChange={(event) => setOrganizationName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void createOrganization();
                      if (event.key === "Escape") {
                        setCreatingOrganization(false);
                        setOrganizationName("");
                      }
                    }}
                    placeholder="Organization name"
                    className="h-9 min-w-0 flex-1 rounded-md border border-black/15 bg-white px-2.5 text-xs text-[#1f2937] outline-none focus:border-[#428ce5]"
                  />
                  <button
                    type="button"
                    disabled={!organizationName.trim() || organizationSaving}
                    onClick={() => void createOrganization()}
                    className="h-9 rounded-md bg-[#111827] px-3 text-xs font-normal text-white hover:bg-[#243044] disabled:opacity-50"
                  >
                    {organizationSaving ? "..." : "Add"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreatingOrganization(true)}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-normal text-[#1f2937] hover:bg-black/5"
                >
                  <Plus size={16} />
                  Create organization
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <DashboardTour userKey={user.email} />
      <div
        id="dashboard-global-search"
        ref={searchRef}
        className={`relative order-last w-full min-w-0 max-w-2xl basis-full pb-1.5 md:order-none md:mx-4 md:block md:w-auto md:flex-1 md:basis-auto md:pb-0 ${mobileSearchOpen ? "block" : "hidden"}`}
      >
        <div className="dashboard-header-search flex h-9 items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.045] px-3.5 transition focus-within:border-white/25 focus-within:bg-white/[0.07]">
          <Search size={15} className="shrink-0 text-white/45" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => { setSearchOpen(true); loadSearchData(); }}
            placeholder="Search people, chats, workspaces…"
            aria-label="Search"
            ref={searchInputRef}
            className="min-w-0 flex-1 bg-transparent text-[14px] font-normal text-white/90 outline-none placeholder:text-white/35"
          />
          <button type="button" onClick={closeMobileSearch} aria-label="Close search" className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"><X size={16} /></button>
        </div>

        {searchOpen && searchTerm && (
          <div className="dashboard-search-results absolute left-0 top-11 z-50 max-h-[420px] w-full overflow-y-auto md:w-[360px] rounded-xl border border-[#e1e5e9] bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
            {!hasSearchResults ? (
              <p className="px-3 py-4 text-center text-[12px] text-[#8a929c]">No results for &quot;{searchQuery.trim()}&quot;</p>
            ) : (
              <>
                {matchedConversations.length > 0 && (
                  <div className="mb-1">
                    <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#9aa2ac]">Chats</p>
                    {matchedConversations.map((conversation) => (
                      <button key={conversation.id} type="button" onClick={() => goToConversation(conversation.id)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[#f3f4f5]">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#172334] text-[10px] font-bold text-white">{conversation.initials}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-medium text-[#17253a]">{conversation.name}</span>
                          <span className="block truncate text-[11px] text-[#8a929c]">{conversation.preview}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {matchedPeople.length > 0 && (
                  <div className="mb-1">
                    <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#9aa2ac]">People</p>
                    {matchedPeople.map((person) => (
                      <button key={person.id} type="button" onClick={goToPeople} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[#f3f4f5]">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F1F3F4] text-[10px] font-bold text-[#4a5666]">{person.email.charAt(0).toUpperCase()}</span>
                        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[#17253a]">{person.email}</span>
                      </button>
                    ))}
                  </div>
                )}
                {matchedWorkspaces.length > 0 && (
                  <div>
                    <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#9aa2ac]">Workspaces</p>
                    {matchedWorkspaces.map((workspace) => (
                      <button key={workspace.id} type="button" onClick={() => void goToWorkspace(workspace)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[#f3f4f5]">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1ebaae] text-[10px] font-bold text-white">{workspace.name.charAt(0).toUpperCase()}</span>
                        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[#17253a]">{workspace.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
        {/* Usage is always one tap away (icon-only on phones). On phones the search icon opens the search bar as a row below the header.
            Invite team is hidden below sm to leave room; it is also on the Members page. */}
        <button type="button" onClick={() => setInviteOpen(true)} className="hidden h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-[13px] font-normal text-white/90 transition hover:bg-white/[0.07] hover:text-white sm:flex">
          <UserPlus size={17} strokeWidth={1.7} />
          <span className="hidden lg:inline">Invite team</span>
        </button>
        <button type="button" onClick={() => { setMobileSearchOpen((open) => !open); loadSearchData(); }} aria-label="Search" aria-expanded={mobileSearchOpen} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 text-white/90 transition hover:bg-white/[0.07] hover:text-white md:hidden">
          <Search size={17} strokeWidth={1.7} />
        </button>
        <Link href="/dashboard/settings/ai-usage" aria-label="Usage" className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-2.5 sm:px-3 text-[13px] font-normal text-white/90 transition hover:bg-white/[0.07] hover:text-white">
          <Gauge size={17} strokeWidth={1.7} />
          <span className="hidden lg:inline">Usage</span>
        </Link>
      </div>

      <div className="hidden">
        <Link
          href="/pricing"
          className="group mr-1 h-9 rounded-md bg-gradient-to-r from-[#ff8a3d] via-[#e45ca4] to-[#4d8dff] p-[1.5px] transition hover:-translate-y-px"
        >
          <span className="dashboard-upgrade-inner flex h-full items-center gap-1.5 rounded-[4.5px] bg-white px-3.5 text-[13px] font-normal text-black/90 transition group-hover:bg-[#fafafa]">
            <Rocket size={14} strokeWidth={1.8} className="rotate-[-18deg] text-[#ffb36f]" />
            Upgrade now
          </span>
        </Link>
        <span className="mr-1 hidden h-6 w-px bg-[#e0e4e8] sm:block" />
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          aria-label="Invite people"
          className="flex h-9 items-center justify-center gap-1.5 rounded-md px-2.5 text-[13px] font-normal text-black/90 transition hover:bg-black/5"
        >
          <UserPlus size={18} strokeWidth={1.8} />
          <span className="hidden xl:inline">Invite people</span>
        </button>
        <Link href="/contact" aria-label="Help" className="flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-normal text-black/90 transition hover:bg-black/5">
          <CircleHelp size={17} strokeWidth={1.8} />
          <span className="hidden xl:inline">Help</span>
        </Link>
        <NotificationsBell open={notificationsOpen} onOpenChange={setNotificationsOpen} muted={notificationsMuted} />
      </div>
        <div ref={accountRef} className="dashboard-header-account relative ml-1.5 xl:ml-0">
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((value) => !value)}
            className="flex items-center gap-1 rounded-lg p-1 transition-colors hover:bg-white/[0.07]"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full">
              <span className={`dashboard-account-avatar flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/15 text-sm font-normal text-white/90 ${avatarUrl ? "bg-white/10" : "bg-[#6d5ce7]"}`}>
                {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
              </span>
              <span className={`absolute -bottom-0.5 -right-0.5 z-10 h-3 w-3 rounded-full border-2 border-[#262626] ${displayStatus.dot}`} />
            </span>
            <ChevronDown size={13} className={`text-white/60 transition-transform ${accountOpen ? "rotate-180" : ""} ${compact ? "xl:hidden" : ""}`} />
          </button>

          {accountOpen && (
            <>
            {/* Phones: the menu is a sheet from the bottom edge, with the page dimmed behind it. */}
            <div aria-hidden="true" onClick={() => setAccountOpen(false)} className="fixed inset-0 z-[60] bg-black/45 sm:hidden" />
            <div className={`dashboard-account-menu max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:z-[61] max-sm:max-h-[86dvh] max-sm:w-full max-sm:rounded-b-none max-sm:rounded-t-3xl sm:absolute sm:right-0 sm:top-11 sm:max-h-[calc(100vh-60px)] sm:w-[360px] flex flex-col overflow-hidden rounded-2xl border border-[#d9dde2] bg-white text-[#24272c] shadow-[0_18px_48px_rgba(25,39,58,0.2)] ${compact ? "xl:bottom-0 xl:left-12 xl:right-auto xl:top-auto xl:max-h-[calc(100vh-130px)]" : ""}`}>
              <div aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-[#d3d7db] sm:hidden" />
              <div className="overflow-y-auto overscroll-contain px-3 pb-2 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/* Who you are, and how you appear to the team: the status is one tap here, not a menu inside the menu. */}
                <button
                  type="button"
                  onClick={() => { setAccountOpen(false); router.push("/dashboard/settings"); }}
                  className="flex w-full items-center gap-3.5 rounded-2xl px-2 py-2 text-left hover:bg-[#f3f4f5]"
                >
                  <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full">
                    <span className="dashboard-account-avatar flex size-12 items-center justify-center overflow-hidden rounded-full text-[17px] font-normal">
                      {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
                    </span>
                    <span className={`absolute -bottom-0.5 -right-0.5 z-10 size-3.5 rounded-full border-2 border-white ${displayStatus.dot}`} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-[16px] font-semibold">{displayName}</span>
                      {selected?.role && (
                        <span className="dashboard-role-badge shrink-0 rounded-full bg-[#F0F2F3] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#556070]">
                          {selected.role}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-[#7d8289]">{user.email}</span>
                  </span>
                </button>

                <div className="mt-2 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Your status">
                  {statusOptions.map((option) => {
                    const active = presenceStatus === option.value && !busy;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={statusSaving}
                        onClick={() => void updateStatus(option.value)}
                        className={`dashboard-status-trigger flex h-10 items-center justify-center gap-1.5 rounded-xl border px-1.5 text-[12.5px] font-medium transition disabled:opacity-60 ${active ? "dashboard-status-active border-[#11120f]/70 bg-[#f0f2f3]" : "border-[#e1e3e6] text-[#696e75] hover:bg-[#f7f7f8]"}`}
                      >
                        <span className={`size-2 shrink-0 rounded-full ${option.dot}`} />
                        <span className="truncate">{option.value === "brb" ? "Back soon" : option.label}</span>
                      </button>
                    );
                  })}
                </div>
                {busy && <p className="mt-1.5 px-1 text-[11.5px] leading-4 text-[#8a9298]">You&apos;re shown as busy while assigned to an open conversation.</p>}

                <div className="mt-3 space-y-0.5">
                  <AccountMenuItem
                    icon={Bell}
                    label="Notifications"
                    onClick={() => { setAccountOpen(false); setNotificationsOpen(true); }}
                  />
                  <button
                    type="button"
                    onClick={toggleNotificationsMuted}
                    aria-pressed={notificationsMuted}
                    className="dashboard-mute-notifications flex h-11 w-full items-center gap-3 rounded-xl bg-transparent px-3 text-left text-[14px] hover:bg-[#e8e9ea] sm:h-10"
                  >
                    <VolumeX size={18} className="text-[#686d73]" />
                    <span className="flex-1">{notificationsMuted ? "Unmute notifications" : "Mute notifications"}</span>
                    <span aria-hidden="true" className={`relative h-5 w-9 shrink-0 rounded-full transition ${notificationsMuted ? "bg-[#35b92c]" : "bg-[#d3d7db]"}`}>
                      <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${notificationsMuted ? "left-[18px]" : "left-0.5"}`} />
                    </span>
                  </button>
                </div>

                <div className="my-2 border-t border-[#eceef0]" />

                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a8e94]">Workspace</p>
                <div className="space-y-0.5">
                  <AccountMenuItem icon={Settings} label="Settings" onClick={() => { setAccountOpen(false); router.push("/dashboard/settings"); }} />
                  <AccountMenuItem icon={UserPlus} label="Invite team" onClick={() => { setAccountOpen(false); setInviteOpen(true); }} />
                  <AccountMenuItem icon={Gauge} label="Usage" onClick={() => { setAccountOpen(false); router.push("/dashboard/settings/ai-usage"); }} />
                  <AccountMenuItem icon={Palette} label="Themes" onClick={() => { setAccountOpen(false); router.push("/dashboard/settings"); }} />
                </div>

                {/* With no top bar on the inbox, the workspace switcher and the Usage / Invite shortcuts live here. */}
                {compact && (
                  <div className="hidden xl:block">
                    <p className="px-3 pb-1 pt-1 text-xs font-medium text-[#8a8e94]">Workspace</p>
                    {(organizations.length ? organizations : selected ? [selected] : []).map((organization) => (
                      <button
                        key={organization.id}
                        type="button"
                        onClick={() => { setAccountOpen(false); void selectWorkspace(organization).then(() => router.refresh()); }}
                        className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-[#f1f2f3]"
                      >
                        <span className="flex-1 truncate">{organization.name}</span>
                        {selected?.id === organization.id && <Check size={15} className="text-[#3a7a4e]" />}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => { setAccountOpen(false); setInviteOpen(true); }}
                      className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-[#f1f2f3]"
                    >
                      <UserPlus size={17} className="text-[#686d73]" />
                      Invite team
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAccountOpen(false); router.push("/dashboard/settings/ai-usage"); }}
                      className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-[#f1f2f3]"
                    >
                      <Gauge size={17} className="text-[#686d73]" />
                      Usage
                    </button>
                    <div className="my-2 border-t border-[#eceef0]" />
                  </div>
                )}

                <div className="my-2 border-t border-[#eceef0]" />

                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a8e94]">Shortcuts</p>
                <div className="space-y-0.5">
                  {[
                    { Icon: Inbox, label: "My inbox", href: "/dashboard/inbox", pin: false },
                    { Icon: Users, label: "Contacts", href: "/dashboard/contacts", pin: false },
                    { Icon: BookOpen, label: "Knowledge base", href: "/dashboard/knowledge", pin: true },
                    { Icon: Clock3, label: "All conversations", href: "/dashboard/inbox?list=1", pin: false },
                    { Icon: CircleHelp, label: "Help", href: "/contact", pin: false },
                  ].map(({ Icon, label, href, pin }) => (
                    <AccountMenuItem
                      key={label}
                      icon={Icon}
                      label={label}
                      trailing={pin ? <Pin size={14} className="rotate-45 text-[#969aa0]" /> : undefined}
                      onClick={() => { setAccountOpen(false); router.push(href); }}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-[#e5e7ea] p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  disabled={signingOut}
                  onClick={() => void signOut()}
                  className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[14px] font-medium text-[#c63f4d] hover:bg-[#fff2f3] disabled:opacity-60 sm:h-10"
                >
                  <LogOut size={17} /> {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
            </>
          )}
        </div>
      <div className="dashboard-header-keep contents"><InvitePeopleDialog open={inviteOpen} onClose={() => setInviteOpen(false)} /></div>
    </header>
  );
}
