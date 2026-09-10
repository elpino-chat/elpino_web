export default function TypingDots({ color = "currentColor" }: { color?: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full"
          style={{ backgroundColor: color, animationDelay: `${i * 0.12}s`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}
