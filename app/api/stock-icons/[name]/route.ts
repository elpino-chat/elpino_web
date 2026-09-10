import { readFile } from "node:fs/promises";
import path from "node:path";

// Backs the avatar picker's "Stock icons" tab — serves the curated PNGs from
// public/stock-icons/. These used to live one level up at ../shared/icons,
// a monorepo-relative path that doesn't exist once web/ deploys as its own
// standalone build (see the sibling index route for the full story — same
// bug, this route just serves bytes instead of the id list). The filename
// pattern check is a path-traversal guard, not a catalog.
const SAFE_ID = /^[a-zA-Z0-9_-]+$/;

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const id = name.replace(/\.png$/i, "");
  if (!SAFE_ID.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", "stock-icons", `${id}.png`);
  try {
    const file = await readFile(filePath);
    return new Response(new Uint8Array(file), {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
