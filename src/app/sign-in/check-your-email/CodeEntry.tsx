"use client";

import { useRef, useState } from "react";
import { CODE_LENGTH } from "@/lib/verificationCode";
import styles from "../auth.module.css";

/**
 * Six boxes.
 *
 * One field per character rather than one field for all six, because that is what
 * a code from an email looks like everywhere else now and because it makes the
 * length of the thing self-evident — you can see how many you have left without
 * counting.
 *
 * The parts that are easy to get wrong and matter most:
 *
 *   - pasting the whole code into any box fills all of them, which is what almost
 *     everybody actually does;
 *   - backspace in an empty box steps back and clears the one before, rather than
 *     stranding the cursor;
 *   - a real hidden input carries the value, so this submits as a plain form and
 *     works the same whether or not the JavaScript that prettifies it has loaded.
 *
 * It posts to a route handler rather than calling a Server Action. The action
 * version failed with "an unexpected response was received from the server",
 * because what has to happen next is a *browser navigation* to Auth.js's callback
 * — a thing an action's serialised reply cannot ask for, and a thing an ordinary
 * form post does without being asked.
 */
export function CodeEntry() {
  const [chars, setChars] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [sending, setSending] = useState(false);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  const code = chars.join("");

  const put = (i: number, value: string) => {
    const next = [...chars];
    next[i] = value;
    setChars(next);
  };

  const focus = (i: number) => {
    boxes.current[Math.max(0, Math.min(CODE_LENGTH - 1, i))]?.focus();
  };

  /* One place for "some characters arrived at box i", so typing and pasting
     behave identically — a paste is just a fast sequence of characters. */
  const accept = (i: number, raw: string) => {
    const clean = raw.toUpperCase().replace(/[^0-9A-Z]/g, "");
    if (!clean) return;
    const next = [...chars];
    for (let n = 0; n < clean.length && i + n < CODE_LENGTH; n += 1) {
      next[i + n] = clean[n];
    }
    setChars(next);
    focus(i + clean.length);
  };

  return (
    <form method="post" action="/api/sign-in/code" onSubmit={() => setSending(true)}>
      <input type="hidden" name="code" value={code} />

      <div className={styles.codeRow}>
        {chars.map((ch, i) => (
          <input
            key={i}
            ref={(el) => {
              boxes.current[i] = el;
            }}
            className={styles.codeBox}
            value={ch}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Character ${i + 1} of ${CODE_LENGTH}`}
            maxLength={1}
            autoFocus={i === 0}
            onChange={(e) => accept(i, e.target.value)}
            onPaste={(e) => {
              e.preventDefault();
              accept(0, e.clipboardData.getData("text"));
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                e.preventDefault();
                if (chars[i]) put(i, "");
                else {
                  put(i - 1 < 0 ? 0 : i - 1, "");
                  focus(i - 1);
                }
              }
              if (e.key === "ArrowLeft") focus(i - 1);
              if (e.key === "ArrowRight") focus(i + 1);
            }}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={code.length !== CODE_LENGTH || sending}
        className="mt-5 flex h-11 w-full cursor-pointer items-center justify-center rounded-lg border-0 font-medium disabled:cursor-default disabled:opacity-45"
        style={{
          background: "var(--brass)",
          color: "var(--on-dark)",
          fontSize: 14,
          boxShadow: "0 10px 22px -14px rgba(46,30,14,.9)",
        }}
      >
        {sending ? "Checking…" : "Continue"}
      </button>
    </form>
  );
}
