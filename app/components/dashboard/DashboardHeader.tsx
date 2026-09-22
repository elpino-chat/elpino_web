"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  ChevronRight,
  CircleHelp,
  Clock3,
  Gauge,
  Inbox,
  LogOut,
  Menu,
  Palette,
  Pin,
  Plus,
  Rocket,
  Search,
  Settings,
  Users,
  UserPlus,
  VolumeX,
} from "lucide-react";

type Organization = { id: string; name: string; role: string };
type HeaderUser = { email: string; name?: string };
type SearchConversation = { id: string; name: string; preview: string; initials: string };
type SearchPerson = { id: string; email: string };

// Space's panel and the Visitors report nav (VisitorSidebar in
// _visitors-client.tsx) are real drawers hidden below md, and the Contacts
// tools panel is one hidden below lg — none has any other way to reach it,
// so the hamburger opens whichever one the current route has, at that
// route's own breakpoint. The Team Inbox and AI Assist conversation lists
// went a different way (see HomePanel.tsx / ai-assist/page.tsx): on mobile
// they're the full-screen view by default, swapped for the open
// conversation on selection, WhatsApp-style — so they need no hamburger at
// all, on any route.
const SPACE_ROUTES = ["/dashboard", "/dashboard/notifications", "/dashboard/issues"];
const VISITORS_ROUTE_PREFIX = "/dashboard/visitors";
const CONTACTS_ROUTE = "/dashboard/contacts";
// The editor routes (/knowledge/new, /knowledge/page/[id]) render their own
// full-page editor with no sidebar at all, so they're deliberately excluded
// — only the three routes KnowledgeClient itself handles have one.
const KNOWLEDGE_ROUTES = ["/dashboard/knowledge", "/dashboard/knowledge/articles", "/dashboard/knowledge/sources"];
const SETTINGS_ROUTE_PREFIX = "/dashboard/settings";

export default function DashboardHeader({ user }: { user: HeaderUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggle: toggleDrawer } = useMobileDrawer();
  const isSpaceRoute = SPACE_ROUTES.includes(pathname);
  const isVisitorsRoute = pathname === VISITORS_ROUTE_PREFIX || pathname.startsWith(`${VISITORS_ROUTE_PREFIX}/`);
  const isContactsRoute = pathname === CONTACTS_ROUTE;
  const isKnowledgeRoute = KNOWLEDGE_ROUTES.includes(pathname);
  const isSettingsRoute = pathname === SETTINGS_ROUTE_PREFIX || pathname.startsWith(`${SETTINGS_ROUTE_PREFIX}/`);
  // Live notifications (unread activity, escalations, secure requests) plus
  // unresolved issues — both drop on their own as things get read/resolved,
  // so this stays accurate without a separate "seen it" flag to maintain.
  const [spaceBadgeCount, setSpaceBadgeCount] = useState(0);
  const hamburgerBreakpoint =
    isSpaceRoute || isVisitorsRoute || isKnowledgeRoute || isSettingsRoute ? "md:hidden" : isContactsRoute ? "lg:hidden" : null;
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
  useEffect(() => {
    notificationsMutedRef.current = notificationsMuted;
  }, [notificationsMuted]);
  const switcherRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
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
    setNotificationsMuted((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(NOTIFICATIONS_MUTED_KEY, next ? "1" : "0");
      } catch {
        // Nothing to persist to — the toggle still works for this tab.
      }
      return next;
    });
  }

  useEffect(() => {
    fetch("/api/account")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { account?: { id: string; avatarUrl: string | null; presenceStatus?: string } } | null) => {
        setAvatarUrl(data?.account?.avatarUrl ?? "");
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
    socket.on("notification", (payload: { userId?: string; notification?: { conversationId?: string; title?: string; detail?: string } }) => {
      if (payload.userId !== accountId) return;
      // Badge reflects real state regardless of whether the chime/toast is
      // muted — muting silences the alert, not the count.
      refreshSpaceBadge();
      if (notificationsMutedRef.current) return;
      const notification = payload.notification;
      if (!notification?.conversationId || !notification.title) return;
      playAssignmentChime();
      toast.custom(
        (id) => (
          <AssignmentToast
            notification={{ conversationId: notification.conversationId!, title: notification.title!, detail: notification.detail ?? "" }}
            onDismiss={() => toast.dismiss(id)}
          />
        ),
        { position: "bottom-right", duration: 45_000 },
      );
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

  function loadSearchData() {
    if (searchLoaded) return;
    setSearchLoaded(true);
    fetch("/api/workspace/conversations")
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
    setSearchQuery("");
    router.push(`/dashboard/inbox?conversation=${id}`);
  }

  function goToPeople() {
    setSearchOpen(false);
    setSearchQuery("");
    router.push("/dashboard/settings/people");
  }

  async function goToWorkspace(organization: Organization) {
    setSearchOpen(false);
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
    <header className="relative z-50 mx-2 my-0.5 flex h-12 shrink-0 items-center rounded-xl bg-transparent px-2.5 text-[#354052]">
      {hamburgerBreakpoint && (
        <button
          type="button"
          onClick={toggleDrawer}
          aria-label={spaceBadgeCount > 0 ? `Open menu — ${spaceBadgeCount} new` : "Open menu"}
          className={`relative mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/[0.07] ${hamburgerBreakpoint}`}
        >
          <Menu size={19} />
          {isSpaceRoute && spaceBadgeCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border-2 border-[#262626] bg-[#e2574c] px-0.5 text-[7.5px] font-bold text-white">
              {spaceBadgeCount > 99 ? "99+" : spaceBadgeCount}
            </span>
          )}
        </button>
      )}
      <div ref={switcherRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="dashboard-workspace-switcher flex h-10 items-center gap-2 rounded-md border border-transparent bg-transparent px-2.5 transition-colors hover:bg-black/5"
          aria-expanded={open}
        >
          <span className="max-w-[110px] truncate text-[15px] font-normal text-white sm:max-w-52">{workspaceName}&apos;s Workspace</span>
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
      <div id="dashboard-global-search" ref={searchRef} className="relative mx-4 hidden min-w-0 max-w-2xl flex-1 md:block">
        <div className="dashboard-header-search flex h-9 items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.045] px-3.5 transition focus-within:border-white/25 focus-within:bg-white/[0.07]">
          <Search size={15} className="shrink-0 text-white/45" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => { setSearchOpen(true); loadSearchData(); }}
            placeholder="Search people, chats, workspaces…"
            aria-label="Search"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-normal text-white/90 outline-none placeholder:text-white/35"
          />
        </div>

        {searchOpen && searchTerm && (
          <div className="dashboard-search-results absolute left-0 top-11 z-50 max-h-[420px] w-[360px] overflow-y-auto rounded-xl border border-[#e1e5e9] bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
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

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {/* Secondary actions — dropped below sm rather than shrunk further,
            since an icon with no label and no room to breathe reads as
            clutter next to Upgrade and the account avatar. Both stay
            reachable on mobile from the account menu below. */}
        <button type="button" onClick={() => setInviteOpen(true)} className="hidden h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-[13px] font-normal text-white/90 transition hover:bg-white/[0.07] hover:text-white sm:flex">
          <UserPlus size={16} strokeWidth={1.7} />
          <span className="hidden lg:inline">Invite team</span>
        </button>
        <Link href="/dashboard/settings/ai-usage" className="hidden h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-[13px] font-normal text-white/90 transition hover:bg-white/[0.07] hover:text-white sm:flex">
          <Gauge size={16} strokeWidth={1.7} />
          <span className="hidden lg:inline">Usage</span>
        </Link>
        <Link href="/pricing#plans" className="flex h-9 items-center gap-2 rounded-lg border border-violet-300/20 bg-gradient-to-r from-[#6d5ce7] to-[#8b5cf6] px-2.5 text-[13px] font-normal text-white/90 shadow-[0_4px_16px_rgba(109,92,231,0.22)] transition hover:from-[#7868ed] hover:to-[#9568fa] hover:text-white sm:px-3">
          <Rocket size={16} strokeWidth={1.7} />
          <span className="hidden lg:inline">Upgrade</span>
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
        <div ref={accountRef} className="relative ml-1.5">
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
            <ChevronDown size={13} className={`text-white/60 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
          </button>

          {accountOpen && (
            <div className="dashboard-account-menu absolute right-0 top-11 flex max-h-[calc(100vh-60px)] w-[360px] flex-col overflow-hidden rounded-2xl border border-[#d9dde2] bg-white text-[#24272c] shadow-[0_18px_48px_rgba(25,39,58,0.2)]">
              <div className="overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard#account")}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-[#f3f4f5]"
                >
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <span className="dashboard-account-avatar flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-[15px] font-normal">
                      {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
                    </span>
                    <span className={`absolute -bottom-0.5 -right-0.5 z-10 h-3.5 w-3.5 rounded-full border-2 border-white ${displayStatus.dot}`} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-[15px] font-semibold">{displayName}</span>
                      {selected?.role && (
                        <span className="dashboard-role-badge shrink-0 rounded-full bg-[#F0F2F3] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#556070]">
                          {selected.role}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-[#7d8289]">{displayStatus.label}</span>
                  </span>
                </button>

                <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                  <PopoverTrigger className="dashboard-status-trigger mt-1 flex h-9 w-full items-center gap-2 rounded-xl border border-[#e1e3e6] px-3 text-left text-sm text-[#696e75] hover:bg-[#f7f7f8]">
                    <CircleHelp size={16} className="text-[#8b9097]" />
                    Set status
                  </PopoverTrigger>
                  <PopoverContent align="start" className="dashboard-status-menu w-[220px]">
                    {busy && <p className="px-2.5 pb-1.5 pt-1 text-[11px] leading-4 text-[#8a9298]">You&apos;re shown as busy while assigned to an open conversation.</p>}
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        disabled={statusSaving}
                        onClick={() => void updateStatus(option.value)}
                        className={`flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] font-medium disabled:opacity-60 ${presenceStatus === option.value ? "dashboard-status-active bg-[#f0f2f3]" : "hover:bg-[#f7f8f8]"}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${option.dot}`} /> {option.label}
                        {presenceStatus === option.value && <Check size={14} className="ml-auto text-[#11120f]" />}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                <button
                  type="button"
                  onClick={toggleNotificationsMuted}
                  aria-pressed={notificationsMuted}
                  className="dashboard-mute-notifications mt-2 flex h-10 w-full items-center gap-3 rounded-lg bg-transparent px-3 text-left text-sm hover:bg-[#e8e9ea]"
                >
                  <VolumeX size={17} />
                  <span className="flex-1">{notificationsMuted ? "Unmute notifications" : "Mute notifications"}</span>
                  {notificationsMuted && <Check size={15} className="text-[#3a7a4e]" />}
                </button>

                <div className="my-2 border-t border-[#eceef0]" />

                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    setNotificationsOpen(true);
                  }}
                  className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-[#f1f2f3]"
                >
                  <Bell size={17} className="text-[#686d73]" />
                  Notifications
                </button>

                {/* Same actions the header itself carries from sm up — below
                    that width they live here instead of as extra header
                    buttons, so nothing is lost, just relocated. */}
                <div className="sm:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      setInviteOpen(true);
                    }}
                    className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-[#f1f2f3]"
                  >
                    <UserPlus size={17} className="text-[#686d73]" />
                    Invite team
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      router.push("/dashboard/settings/ai-usage");
                    }}
                    className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-[#f1f2f3]"
                  >
                    <Gauge size={17} className="text-[#686d73]" />
                    Usage
                  </button>
                </div>

                {[
                  { Icon: Settings, label: "Settings", href: "/dashboard/settings" },
                  { Icon: Palette, label: "Themes", href: "/dashboard#themes" },
                  { Icon: CircleHelp, label: "Help", href: "/contact" },
                ].map(({ Icon, label, href }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      router.push(href);
                    }}
                    className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-[#f1f2f3]"
                  >
                    <Icon size={17} className="text-[#686d73]" />
                    {label}
                  </button>
                ))}

                <div className="mx-[-8px] my-3 border-t border-[#e5e7ea]" />
                <p className="px-3 pb-1.5 text-xs font-medium text-[#8a8e94]">AI Support Tools</p>

                {[
                  { Icon: Inbox, label: "My inbox", href: "/dashboard", pin: false },
                  { Icon: Users, label: "Contacts", href: "/dashboard#contacts", pin: false },
                  { Icon: BookOpen, label: "Knowledge base", href: "/dashboard/knowledge", pin: true },
                  { Icon: Clock3, label: "Conversation history", href: "/dashboard#history", pin: false },
                ].map(({ Icon, label, href, pin }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      router.push(href);
                    }}
                    className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-[#f1f2f3]"
                  >
                    <Icon size={17} className="text-[#686d73]" />
                    <span className="flex-1">{label}</span>
                    {pin && <Pin size={14} className="rotate-45 text-[#969aa0]" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-[#e5e7ea] p-2">
                <button
                  type="button"
                  disabled={signingOut}
                  onClick={() => void signOut()}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#c63f4d] hover:bg-[#fff2f3] disabled:opacity-60"
                >
                  <LogOut size={17} /> {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          )}
        </div>
      <InvitePeopleDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </header>
  );
}
