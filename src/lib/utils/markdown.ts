/**
 * Clean TipTap editor raw HTML wrapper tags and decode HTML entities
 */
function cleanTipTapHtml(html: string): string {
  if (!html) return '';
  
  // Remove TipTap raw HTML wrapper tags and extract the actual HTML content
  let cleaned = html.replace(
    /<div data-raw-html="true" data-html="([^"]+)"[^>]*>.*?<\/div>/gs,
    (_, encodedHtml) => {
      // Decode HTML entities
      const decoded = encodedHtml
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
      return decoded;
    }
  );
  
  // Also handle self-closing raw HTML tags
  cleaned = cleaned.replace(
    /<div data-raw-html="true" data-html="([^"]+)"[^>]*\/>/g,
    (_, encodedHtml) => {
      const decoded = encodedHtml
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
      return decoded;
    }
  );
  
  return cleaned;
}

/**
 * Convert markdown to HTML with tailwind classes
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
    // Bold (must come before italic to avoid conflicts)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^\*]+?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    // Highlight
    .replace(/==(.*?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-500">$1</mark>')
    // Images (must come before links)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-2 rounded" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener">$1</a>')
    // Inline code (must come before code blocks)
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded my-2 overflow-x-auto"><code class="text-sm font-mono whitespace-pre">$1</code></pre>')
    // Horizontal rule
    .replace(/^---$/gim, '<hr class="my-4 border-t" />')
    // Blockquote
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2">$1</blockquote>')
    // Task lists
    .replace(/^- \[ \] (.*$)/gim, '<li class="ml-4 flex items-center gap-2"><input type="checkbox" disabled class="rounded" /> $1</li>')
    .replace(/^- \[x\] (.*$)/gim, '<li class="ml-4 flex items-center gap-2"><input type="checkbox" checked disabled class="rounded" /> $1</li>')
    // Bullet lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    // Tables - basic support
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      return '<tr>' + cells.map(c => `<td class="border px-2 py-1">${c.trim()}</td>`).join('') + '</tr>';
    })
    // Line breaks (but preserve HTML tags)
    .replace(/\n(?![<])/g, '<br />');

  // Wrap lists
  html = html.replace(/(<li class="ml-4">.*?<\/li>)/gs, '<ul class="list-disc my-2">$1</ul>');
  html = html.replace(/(<li class="ml-4 list-decimal">.*?<\/li>)/gs, '<ol class="list-decimal my-2">$1</ol>');
  
  // Wrap tables
  if (html.includes('<tr>')) {
    html = html.replace(/(<tr>.*?<\/tr>)/gs, '<table class="border-collapse border my-2">$1</table>');
  }

  // Clean TipTap raw HTML wrapper tags
  html = cleanTipTapHtml(html);

  return html;
}

/**
 * Get HTML content from campaign description
 * Handles both string and JSONB formats
 */
export function getDescriptionHtml(description: string | { type: 'blocks' | 'markdown' | 'html'; data: unknown } | null): string {
  if (!description) return '';
  
  // If it's already a string, convert markdown to HTML
  if (typeof description === 'string') {
    return cleanTipTapHtml(markdownToHtml(description));
  }
  
  // If it's a JSONB object with data property
  if (typeof description === 'object' && 'data' in description) {
    if (typeof description.data === 'string') {
      // For markdown type, convert to HTML
      if (description.type === 'markdown') {
        return cleanTipTapHtml(markdownToHtml(description.data));
      }
      // For HTML type, clean and return
      if (description.type === 'html') {
        return cleanTipTapHtml(description.data);
      }
      // Default: treat as markdown
      return cleanTipTapHtml(markdownToHtml(description.data));
    }
    // For blocks type, try to extract text from blocks and convert
    if (description.type === 'blocks' && Array.isArray(description.data)) {
      const text = description.data.map((block: { text?: string }) => block.text || '').join('\n');
      return cleanTipTapHtml(markdownToHtml(text));
    }
  }
  
  return '';
}
