import { readdir } from "node:fs/promises";
import path from "node:path";

// Lists what's currently in public/stock-icons/ so the avatar picker's
// catalog stays in sync with that folder without a code change whenever an
// icon is added or removed there.
//
// This used to read ../shared/icons — a path one level above this app in
// the monorepo. That broke the moment web/ started deploying as its own
// standalone build (Cloud Run pulls only from the elpino_web repo, which
// has no shared/ sibling at all): readdir always threw, always hit the
// catch below, and the picker silently showed zero icons in production
// while working fine in local dev, where the monorepo layout still holds.
// public/stock-icons/ is inside this app's own deployable tree, so it
// exists identically everywhere this app runs.
export async function GET() {
  const dir = path.join(process.cwd(), "public", "stock-icons");
  try {
    const files = await readdir(dir);
    const icons = files
      .filter((file) => file.toLowerCase().endsWith(".png"))
      .map((file) => file.replace(/\.png$/i, ""))
      .sort();
    return Response.json({ icons });
  } catch {
    return Response.json({ icons: [] });
  }
}
