"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cssStyle } from "@/lib/uiStyle";

export interface DropdownOption {
  value: string;
  label: string;
  /** Optional leading glyph, e.g. a category emoji. */
  glyph?: string;
}

/**
 * A themed replacement for `<select>`. Native selects render with the OS chrome
 * and ignore the page's palette, so this reimplements the listbox pattern —
 * including the keyboard and ARIA behaviour a real select gives you for free.
 */
export function Dropdown({
  label,
  value,
  options,
  onChange,
  allLabel,
}: {
  /** Accessible name, also the trigger text when nothing is selected. */
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  /** Label for the "no filter" entry. Defaults to `label`. */
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const all: DropdownOption = { value: "", label: allLabel ?? label };
  const items = [all, ...options];
  const selected = items.find((o) => o.value === value) ?? all;
  const isFiltered = value !== "";

  /* Close on outside press or focus leaving the whole control. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onFocus = (e: FocusEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("focusin", onFocus);
    };
  }, [open]);

  /* Keep the highlighted row in view when arrowing through a long list. */
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelectorAll("li")[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openAt = (index: number) => {
    setActive(index);
    setOpen(true);
  };

  const commit = (index: number) => {
    onChange(items[index].value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = items.findIndex((o) => o.value === value);
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openAt(Math.max(0, currentIndex));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        openAt(items.length - 1);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(items.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      commit(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openAt(Math.max(0, items.findIndex((o) => o.value === value))))}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        style={cssStyle(
          `display:inline-flex;align-items:center;gap:10px;padding:12px 15px;border-radius:8px;cursor:pointer;font-size:14px;font-family:var(--font-space-grotesk),sans-serif;background:var(--paper);color:${
            isFiltered ? "var(--ink)" : "var(--ink-muted)"
          };border:1px solid ${isFiltered ? "var(--rust)" : "rgba(43,38,32,.16)"};transition:border-color .2s ease`
        )}
      >
        {selected.glyph && <span style={cssStyle("font-size:14px")}>{selected.glyph}</span>}
        <span>{selected.label}</span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={cssStyle("font-size:9px;line-height:1;margin-left:auto;color:var(--ink-faint)")}
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            aria-activedescendant={`${listId}-${active}`}
            tabIndex={-1}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onKeyDown={onKeyDown}
            /* `width:max-content` matters: an absolutely-positioned box would
               otherwise shrink-to-fit inside the narrow trigger wrapper, and the
               nowrap rows would spill and force a horizontal scrollbar. */
            style={cssStyle(
              "position:absolute;left:0;top:calc(100% + 6px);z-index:60;width:max-content;min-width:100%;max-width:min(320px,78vw);max-height:min(300px,52vh);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;margin:0;padding:6px;list-style:none;border-radius:10px;background:var(--paper);border:1px solid rgba(43,38,32,.18);box-shadow:0 22px 44px -20px rgba(30,20,12,.45);scrollbar-width:thin;scrollbar-color:rgba(43,38,32,.3) transparent"
            )}
          >
            {items.map((o, i) => {
              const isSelected = o.value === value;
              const isActive = i === active;
              return (
                <li
                  key={o.value || "__all"}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => commit(i)}
                  style={cssStyle(
                    `display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:6px;cursor:pointer;font-size:13.5px;line-height:1.35;background:${
                      isActive ? "rgba(181,80,46,.12)" : "transparent"
                    };color:${isSelected ? "var(--rust)" : "var(--ink)"};font-weight:${isSelected ? 600 : 400}`
                  )}
                >
                  {o.glyph && <span style={cssStyle("font-size:14px")}>{o.glyph}</span>}
                  <span>{o.label}</span>
                  {isSelected && (
                    <span aria-hidden style={cssStyle("margin-left:auto;font-size:11px;color:var(--rust)")}>
                      ✓
                    </span>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
