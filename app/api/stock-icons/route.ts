import { readdir } from "node:fs/promises";
import path from "node:path";

// Lists what's currently in shared/icons/ so the avatar picker's catalog
// stays in sync with that folder without a frontend redeploy whenever an
// icon is added or removed there.
export async function GET() {
  const dir = path.join(process.cwd(), "..", "shared", "icons");
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
