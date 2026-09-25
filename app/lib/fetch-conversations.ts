// The inbox list is needed by many parts of the dashboard at once (sidebar
// badge, header, mobile nav, the conversation list, the open chat) and several
// of them poll it. Each used to send its own request, and every request costs
// a session check, an organization lookup and a company upsert on the server
// before the list query even runs. Requests made within a moment of each other
// now share one round trip.
const SHARE_MS = 1000;

let inflight: Promise<Response> | null = null;
let shared: { response: Response; at: number } | null = null;

export function fetchConversations(): Promise<Response> {
  if (shared && Date.now() - shared.at < SHARE_MS) return Promise.resolve(shared.response.clone());
  inflight ??= fetch("/api/workspace/conversations", { cache: "no-store" })
    .then((response) => {
      shared = { response, at: Date.now() };
      return response;
    })
    .finally(() => { inflight = null; });
  // Each caller reads its own copy: a response body can only be read once.
  return inflight.then((response) => response.clone());
}
