/** Presentation only: keep original answers and citation metadata intact. */
export function plainChatText(text: string): string {
  let inCode = false;
  return text.replace(/\r\n/g, '\n').split('\n').map(line => {
    if (/^\s*(`{3,}|~{3,})/.test(line)) { inCode = !inCode; return ''; }
    if (inCode) return line;
    return line
      .replace(/^\s{0,3}#{1,6}(?:\s+|$)/, '')
      .replace(/\s+#+\s*$/, '')
      .replace(/^\s{0,3}(?:>\s*)+/, '')
      .replace(/^\s*[-*+]\s+(?:\[[ xX]\]\s*)?/, '')
      .replace(/^\s*(?:([-*_])\s*){3,}\s*$/, '')
      .replace(/^\s*={3,}\s*$/, '')
      .replace(/^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/, '')
      .replace(/^\s*\|(.+)\|\s*$/, '$1')
      .replace(/\s+\|\s+/g, '   ')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, '$1 ($2)')
      .replace(/(\*{2,3}|_{2,3}|~~)(.+?)\1/g, '$2')
      .replace(/(^|\s)\*([^*\n]+)\*(?=\s|[.,;:!?]|$)/g, '$1$2')
      .replace(/(^|\s)_([^_\n]+)_(?=\s|[.,;:!?]|$)/g, '$1$2')
      .replace(/`+([^`]+)`+/g, '$1')
      .replace(/(?:\*{2,3}|_{2,3}|~~|`+)$/g, '')
      .replace(/(^|\s)(?:\*{1,3}|_{2,3}|~~|`+)(?=\S)/g, '$1')
      .replace(/\\([\\`*{}\[\]()#+\-.!_>])/g, '$1');
  }).join('\n')
    .replace(/(?:\p{Extended_Pictographic}|\p{Regional_Indicator})[\uFE0E\uFE0F\p{Emoji_Modifier}]*(?:\u200D(?:\p{Extended_Pictographic})[\uFE0E\uFE0F\p{Emoji_Modifier}]*)*|[0-9#*]\uFE0F?\u20E3/gu, '')
    .replace(/\n{3,}/g, '\n\n');
}
