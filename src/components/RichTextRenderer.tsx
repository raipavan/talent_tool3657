import { useMemo } from 'react';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  let inOrderedList = false;
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Blank line terminates active list or blockquote
    if (!line.trim()) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      if (inOrderedList) {
        out.push('</ol>');
        inOrderedList = false;
      }
      if (inBlockquote) {
        out.push('</blockquote>');
        inBlockquote = false;
      }
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      if (!inBlockquote) {
        out.push('<blockquote class="cms-prose-blockquote">');
        inBlockquote = true;
      }
      line = line.slice(2);
    } else if (inBlockquote) {
      out.push('</blockquote>');
      inBlockquote = false;
    }

    // Headings
    if (line.startsWith('### ')) {
      out.push(`<h3 class="cms-prose-h3">${renderInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      out.push(`<h2 class="cms-prose-h2">${renderInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      out.push(`<h1 class="cms-prose-h1">${renderInline(line.slice(2))}</h1>`);
      continue;
    }

    // Unordered List
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        out.push('<ul class="cms-prose-list">');
        inList = true;
      }
      out.push(`<li>${renderInline(line.slice(2))}</li>`);
      continue;
    } else if (inList) {
      out.push('</ul>');
      inList = false;
    }

    // Ordered List
    const numMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      if (!inOrderedList) {
        out.push('<ol class="cms-prose-ordered-list">');
        inOrderedList = true;
      }
      out.push(`<li>${renderInline(numMatch[2])}</li>`);
      continue;
    } else if (inOrderedList) {
      out.push('</ol>');
      inOrderedList = false;
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      out.push('<hr class="cms-prose-hr" />');
      continue;
    }

    // Regular Paragraph
    out.push(`<p class="cms-prose-p">${renderInline(line)}</p>`);
  }

  if (inList) out.push('</ul>');
  if (inOrderedList) out.push('</ol>');
  if (inBlockquote) out.push('</blockquote>');

  return out.join('\n');
}

function renderInline(text: string): string {
  let s = escapeHtml(text);

  // Images: ![alt](url)
  s = s.replace(/!\[(.*?)\]\((.*?)\)/g, (_match, alt, url) => {
    const safeUrl = sanitizeUrl(url);
    return `<img src="${safeUrl}" alt="${alt}" class="cms-prose-img" loading="lazy" />`;
  });

  // Links: [label](url)
  s = s.replace(/\[(.*?)\]\((.*?)\)/g, (_match, label, url) => {
    const safeUrl = sanitizeUrl(url);
    const isExt = /^https?:\/\//i.test(safeUrl);
    return `<a href="${safeUrl}" class="cms-prose-link"${isExt ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
  });

  // Bold: **text** or __text__
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
  s = s.replace(/_(.*?)_/g, '<em>$1</em>');

  // Inline Code: `code`
  s = s.replace(/`([^`]+)`/g, '<code class="cms-prose-code">$1</code>');

  return s;
}

function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^(https?:\/\/|\/|mailto:|tel:|#)/i.test(trimmed)) {
    return trimmed;
  }
  return '#';
}

export function RichTextRenderer({
  content,
  className = '',
}: {
  content?: string;
  className?: string;
}) {
  const html = useMemo(() => parseMarkdownToHtml(content || ''), [content]);

  if (!content) return null;

  return (
    <div
      className={`cms-rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        lineHeight: 1.7,
        fontSize: '1rem',
        color: 'var(--color-text)',
      }}
    />
  );
}
