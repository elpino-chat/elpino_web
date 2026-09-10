import Image from "next/image";

interface Props {
  className?: string;
}

// /public/elpino.png is the real lockup (sloth icon + "elpino" wordmark) on a
// transparent background, 906x275 — keep that intrinsic ratio so callers only
// need to set a width via className.
export function BrandLogo({ className }: Props) {
  return (
    <Image
      src="/elpino.png"
      alt="elpino"
      width={906}
      height={275}
      priority
      className={`h-auto ${className ?? "w-28"}`}
    />
  );
}
