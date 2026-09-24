import { ZipArchive } from "archiver";
import { createReadStream } from "fs";
import { join } from "path";
import { PassThrough } from "stream";
import { NextResponse } from "next/server";

// Files that ship in the brand kit, from /public. Keep in step with the logos
// listed on the /brand-kit page.
const ASSETS = [
  { file: "logo_demo_transparent.png", name: "elpino-logo.png" },
  { file: "elpino.png", name: "elpino-lockup.png" },
  { file: "elpino_slack.png", name: "elpino-mark.png" },
];

// The palette, as text, so it can be pasted straight into a design tool.
const PALETTE = `Elpino brand colours

Ink           #11120F   Text, outlines and the primary dark button
White         #FFFFFF   The canvas
Cream         #FFF8EC   Warm section backgrounds and soft surfaces
Elpino Blue   #3784FF   Primary actions and links
Sunny Yellow  #FFD84D   Highlights, badges and the friendly second button
Purple        #7060BD   AI and product moments, secondary accents
Orange        #FC7B33   A warm accent for people and handoffs
Green         #1AA37A   Success and verified states
Pink          #D9508A   Used sparingly, for a little delight

Typefaces: Rethink Sans (headlines), Inter (body and interface), Geist Mono (labels and code). All free on Google Fonts.
The logo file is black on a transparent background. Invert it to white on dark backgrounds.
`;

export async function GET() {
  const publicDir = join(process.cwd(), "public");
  const passthrough = new PassThrough();
  const archive = new ZipArchive({ zlib: { level: 9 } });

  archive.on("error", (err: Error) => {
    passthrough.destroy(err);
  });
  archive.pipe(passthrough);

  for (const asset of ASSETS) {
    archive.append(createReadStream(join(publicDir, asset.file)), { name: asset.name });
  }
  archive.append(PALETTE, { name: "elpino-colours.txt" });

  archive.finalize();

  const chunks: Buffer[] = [];
  for await (const chunk of passthrough) {
    chunks.push(chunk as Buffer);
  }
  const zipBuffer = Buffer.concat(chunks);

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="elpino-brand-kit.zip"',
      "Content-Length": String(zipBuffer.length),
    },
  });
}
