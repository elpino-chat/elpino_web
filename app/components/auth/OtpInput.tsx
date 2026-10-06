"use client";

import { useRef } from "react";

// Six single-digit boxes for an emailed code: typing moves forward, Backspace moves back, and pasting fills them all.
export function OtpInput({
  value,
  onChange,
  disabled,
  length = 6,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  length?: number;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (index: number, digit: string) => {
    const chars = value.padEnd(length, " ").split("");
    chars[index] = digit;
    onChange(chars.join("").trimEnd());
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if (value[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        setDigit(index - 1, "");
        inputsRef.current[index - 1]?.focus();
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          value={value[index] ?? ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          autoFocus={index === 0}
          disabled={disabled}
          className="h-12 w-10 rounded-xl border-2 border-[#11120f] bg-white text-center text-lg font-semibold outline-none transition focus:ring-4 focus:ring-[#3784ff]/20 disabled:opacity-50 sm:h-[52px] sm:w-12"
        />
      ))}
    </div>
  );
}
