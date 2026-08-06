import type { CSSProperties } from "react";

export function cssStyle(css: string): CSSProperties {
  const style: Record<string, string> = {};
  css.split(";").forEach((decl) => {
    const idx = decl.indexOf(":");
    if (idx === -1) return;
    const prop = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    if (!prop || !value) return;
    if (prop.startsWith("--")) {
      style[prop] = value;
      return;
    }
    const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    style[camel] = value;
  });
  return style as unknown as CSSProperties;
}

export function photoStyle(photos: string[], index: number, css: string, fallbackColor: string): CSSProperties {
  const url = photos.length > 0 ? photos[index % photos.length] : undefined;
  return {
    ...cssStyle(`${css};background-size:cover;background-position:center`),
    backgroundImage: url ? `url(${url})` : undefined,
    backgroundColor: fallbackColor,
  };
}
