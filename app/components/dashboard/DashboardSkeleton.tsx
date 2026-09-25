// Loading placeholders for the dashboard: grey shapes in the layout of the real
// page, shown instantly while the server checks the session and fetches data.
// Server-safe (no hooks); colours come from the dashboard theme's CSS variables
// (see .elpino-skel in globals.css), so they match light and dark.

export function Bone({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`elpino-skel ${className}`} />;
}

const Card = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`elpino-skel-card p-6 ${className}`}>{children}</div>
);

/** The home page: date, greeting, install banner, Inbox and Issues cards, recent activity. */
export function HomeContentSkeleton() {
  return (
    <section role="status" aria-busy="true" aria-label="Loading your dashboard" className="min-h-full px-6 py-7 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <Bone className="h-4 w-40" />
        <Bone className="mt-3 h-9 w-72 max-w-full" />

        <div className="elpino-skel-card mt-7 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <Bone className="size-10 shrink-0" />
            <div className="space-y-2.5 pt-0.5">
              <Bone className="h-4 w-56 max-w-full" />
              <Bone className="h-3 w-80 max-w-full" />
            </div>
          </div>
          <Bone className="h-9 w-32 shrink-0" />
        </div>

        <div className="mt-7 grid gap-4 xl:grid-cols-2">
          <Card className="min-h-[300px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5"><Bone className="size-5 rounded-full" /><Bone className="h-6 w-20" /></div>
              <Bone className="h-3 w-24" />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2 py-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2.5">
                  <Bone className="h-7 w-10" />
                  <Bone className="h-3 w-16" />
                </div>
              ))}
            </div>
            <Bone className="mt-7 h-3.5 w-3/4" />
          </Card>

          <Card className="min-h-[300px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5"><Bone className="size-5 rounded-full" /><Bone className="h-6 w-20" /></div>
              <Bone className="h-3 w-24" />
            </div>
            <div className="mt-8 space-y-2">
              {[0, 1, 2].map((i) => <Bone key={i} className="h-12 w-full" />)}
            </div>
          </Card>
        </div>

        <Card className="mt-4">
          <div className="flex items-center gap-2.5"><Bone className="size-5 rounded-full" /><Bone className="h-6 w-36" /></div>
          <div className="mt-5 space-y-3.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Bone className="size-1.5 shrink-0 rounded-full" />
                <Bone className="h-3.5 flex-1" />
                <Bone className="h-3 w-10 shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

/** Any other dashboard page: a title and a list of rows. */
export function GenericContentSkeleton() {
  return (
    <section role="status" aria-busy="true" aria-label="Loading" className="min-h-full px-6 py-7 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <Bone className="h-8 w-56 max-w-full" />
        <Bone className="mt-3 h-4 w-80 max-w-full" />
        <Card className="mt-7 !p-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3.5 p-4">
              <Bone className="size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2.5">
                <Bone className="h-3.5 w-1/3" />
                <Bone className="h-3 w-2/3" />
              </div>
              <Bone className="hidden h-3 w-12 shrink-0 sm:block" />
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}

/** The whole dashboard frame (sidebar rail, header, content), shown while the session is checked. */
export function DashboardShellSkeleton() {
  return (
    <div className="dashboard-shell relative flex h-dvh w-full flex-row overflow-hidden">
      <aside className="dashboard-primary-sidebar hidden h-full w-[68px] shrink-0 flex-col items-center gap-3 pt-3 md:flex">
        <Bone className="size-10 rounded-xl" />
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => <Bone key={i} className="size-10 rounded-xl" />)}
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col pt-[env(safe-area-inset-top)]">
        <header className="mx-2 my-0.5 flex h-12 shrink-0 items-center gap-3 px-2.5">
          <Bone className="h-8 w-44" />
          <div className="ml-auto flex items-center gap-2.5">
            <Bone className="size-8 rounded-full" />
            <Bone className="size-8 rounded-full" />
          </div>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <GenericContentSkeleton />
        </main>
      </div>
    </div>
  );
}

/** Rows of the inbox conversation list: avatar, name and preview, time. */
export function ConversationListSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <div role="status" aria-busy="true" aria-label="Loading conversations" className="space-y-1 px-2 py-1">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl px-2.5 py-2.5">
          <Bone className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-3 w-2/5" />
            <Bone className="h-2.5 w-4/5" />
          </div>
          <Bone className="h-2.5 w-8 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** An open conversation: message bubbles alternating sides, above the reply box. */
export function ChatSkeleton({ withHeader = false }: { withHeader?: boolean }) {
  const bubbles: [string, string][] = [
    ["items-start", "h-12 w-64"], ["items-end", "h-9 w-48"], ["items-start", "h-16 w-80"],
    ["items-end", "h-12 w-72"], ["items-start", "h-9 w-56"],
  ];
  return (
    <div role="status" aria-busy="true" aria-label="Loading conversation" className="flex h-full min-h-[240px] flex-col">
      {withHeader && (
        <div className="flex h-14 shrink-0 items-center gap-3 px-6">
          <Bone className="size-9 rounded-full" />
          <Bone className="h-4 w-40" />
        </div>
      )}
      <div className="mx-auto flex w-full max-w-[820px] flex-1 flex-col gap-4 px-6 py-6">
        {bubbles.map(([side, size], i) => (
          <div key={i} className={`flex flex-col ${side}`}><Bone className={`${size} max-w-[80%] rounded-2xl`} /></div>
        ))}
      </div>
      {withHeader && (
        <div className="shrink-0 px-6 pb-5">
          <div className="mx-auto max-w-[820px]"><Bone className="h-20 w-full rounded-2xl" /></div>
        </div>
      )}
    </div>
  );
}
