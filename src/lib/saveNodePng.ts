import { toPng } from "html-to-image";

const SVG_PAINT_ATTRS = [
  "fill",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
] as const;

function keepForExport(node: HTMLElement) {
  return !node.closest?.("[data-export-hide]");
}

function pageBackground() {
  return getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#fffdf9";
}

function copyCssVars(target: HTMLElement) {
  const source = getComputedStyle(document.documentElement);
  for (const name of source) {
    if (name.startsWith("--")) target.style.setProperty(name, source.getPropertyValue(name));
  }
}

function copyComputedPaint(from: Element, to: Element) {
  const cs = getComputedStyle(from);
  if (to instanceof HTMLElement) {
    to.style.backgroundColor = cs.backgroundColor;
    to.style.color = cs.color;
    to.style.borderTopColor = cs.borderTopColor;
    to.style.borderRightColor = cs.borderRightColor;
    to.style.borderBottomColor = cs.borderBottomColor;
    to.style.borderLeftColor = cs.borderLeftColor;
    to.style.boxShadow = cs.boxShadow;
  }
  if (to instanceof SVGElement) {
    to.style.fill = cs.fill;
    to.style.stroke = cs.stroke;
    to.setAttribute("fill", cs.fill);
    to.setAttribute("stroke", cs.stroke);
    to.setAttribute("stroke-width", cs.strokeWidth);
    if (cs.strokeDasharray && cs.strokeDasharray !== "none") {
      to.setAttribute("stroke-dasharray", cs.strokeDasharray);
    }
    if (cs.strokeDashoffset && cs.strokeDashoffset !== "0px") {
      to.setAttribute("stroke-dashoffset", cs.strokeDashoffset);
    }
    if (cs.strokeLinecap && cs.strokeLinecap !== "butt") {
      to.setAttribute("stroke-linecap", cs.strokeLinecap);
    }
    if (cs.transform && cs.transform !== "none") {
      to.style.transform = cs.transform;
      to.style.transformOrigin = cs.transformOrigin;
    }
  }
  const fromKids = Array.from(from.children);
  const toKids = Array.from(to.children);
  for (let i = 0; i < fromKids.length; i += 1) {
    const next = toKids[i];
    if (next) copyComputedPaint(fromKids[i], next);
  }
}

function snapshotPaints(root: HTMLElement) {
  const snaps = new Map<Element, { style: string | null; attrs: Record<string, string | null> }>();
  const take = (el: Element) => {
    const attrs: Record<string, string | null> = {};
    for (const name of SVG_PAINT_ATTRS) attrs[name] = el.getAttribute(name);
    snaps.set(el, { style: el.getAttribute("style"), attrs });
  };
  take(root);
  root.querySelectorAll("*").forEach(take);
  return snaps;
}

function restorePaints(snaps: Map<Element, { style: string | null; attrs: Record<string, string | null> }>) {
  snaps.forEach((snap, el) => {
    if (snap.style == null) el.removeAttribute("style");
    else el.setAttribute("style", snap.style);
    Object.entries(snap.attrs).forEach(([name, value]) => {
      if (value == null) el.removeAttribute(name);
      else el.setAttribute(name, value);
    });
  });
}

export async function nodeToPngDataUrl(node: HTMLElement) {
  const snaps = snapshotPaints(node);
  copyCssVars(node);
  copyComputedPaint(node, node);
  try {
    return await toPng(node, {
      pixelRatio: 2,
      backgroundColor: pageBackground(),
      cacheBust: true,
      filter: keepForExport,
    });
  } finally {
    restorePaints(snaps);
  }
}

export async function saveNodePng(node: HTMLElement, filename: string) {
  const dataUrl = await nodeToPngDataUrl(node);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
