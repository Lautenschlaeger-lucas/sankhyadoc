function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlightJson(src: string): string {
  if (!src.trimStart().startsWith('{') && !src.trimStart().startsWith('[')) {
    return escapeHtml(src);
  }
  return escapeHtml(src).replace(/("[^"\\]+")(\s*:)/g, '<span class="hl-key">$1</span>$2');
}