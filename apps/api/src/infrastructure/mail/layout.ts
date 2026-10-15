const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export interface EmailContent {
  /** Rótulo em forma de tag de código acima do título: <contato />. */
  tag?: string;
  heading: string;
  paragraphs: string[];
  rows?: [label: string, value: string][];
  button?: { label: string; url: string };
  footnote?: string;
}

const MONO = "'JetBrains Mono',Consolas,'Courier New',monospace";
const SANS = "Jost,'Segoe UI',Helvetica,Arial,sans-serif";

/**
 * Template único dos e-mails, no design system BV: gradiente grafite → carvão,
 * texto branco, secundários em ink-muted, filetes em hairline, cantos retos.
 */
export function renderEmail(content: EmailContent): { html: string; text: string } {
  const rows = (content.rows ?? [])
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px 0;color:#a3a9ae;font-family:${MONO};font-size:12px;width:140px;vertical-align:top">${escape(label.toLowerCase())}</td><td style="padding:10px 0;color:#ffffff;font-size:15px;line-height:1.6;white-space:pre-line">${escape(value)}</td></tr>`,
    )
    .join('');
  const button = content.button
    ? `<p style="margin:32px 0"><a href="${escape(content.button.url)}" style="background:#ffffff;color:#161616;text-decoration:none;font-weight:500;font-size:14px;padding:14px 22px;border-radius:2px;display:inline-block">${escape(content.button.label)} &rarr;</a></p>`
    : '';
  const tag = content.tag
    ? `<p style="margin:0 0 12px;font-family:${MONO};font-weight:300;font-size:13px;color:#a3a9ae">&lt;${escape(content.tag)} /&gt;</p>`
    : '';
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#161616;font-family:${SANS}">
<div style="background:#161616;background-image:linear-gradient(180deg,#2b3034,#161616)">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;color:#ffffff">
<p style="margin:0 0 40px;font-family:${MONO};font-size:14px;color:#ffffff;letter-spacing:1px">&lt;BV /&gt;</p>
${tag}
<h1 style="margin:0 0 24px;font-size:28px;line-height:1.15;font-weight:600;letter-spacing:-0.02em">${escape(content.heading)}</h1>
${content.paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#a3a9ae">${escape(p)}</p>`).join('')}
${rows ? `<table style="width:100%;border-collapse:collapse;border-top:1px solid #3a4045;border-bottom:1px solid #3a4045;margin:24px 0">${rows}</table>` : ''}
${button}
${content.footnote ? `<p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #3a4045;font-size:12px;line-height:1.5;color:#a3a9ae">${escape(content.footnote)}</p>` : ''}
<p style="margin:40px 0 0;font-family:${MONO};font-size:12px;color:#a3a9ae">Bruno Victor &middot; Desenvolvedor de Software</p>
</div></div></body></html>`;

  const text = [
    content.heading,
    '',
    ...content.paragraphs,
    ...(content.rows ?? []).map(([l, v]) => `${l}: ${v}`),
    ...(content.button ? ['', `${content.button.label}: ${content.button.url}`] : []),
    ...(content.footnote ? ['', content.footnote] : []),
    '',
    'Bruno Victor · Desenvolvedor de Software',
  ].join('\n');

  return { html, text };
}
