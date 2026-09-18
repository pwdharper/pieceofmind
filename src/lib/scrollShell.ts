export function scrollShellToTop() {
  const frame = document.querySelector(".phone-frame");
  if (frame instanceof HTMLElement) frame.scrollTop = 0;
  window.scrollTo(0, 0);
}
