import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface ExportChapter {
  title: string;
  scenes: {
    title: string | null;
    content: string;
  }[];
}

interface ExportOptions {
  title: string;
  subtitle?: string;
  author?: string;
  chapters: ExportChapter[];
}

export async function exportToDOCX(options: ExportOptions) {
  const { title, subtitle, author, chapters } = options;

  const children: Paragraph[] = [];

  // Title page
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: title, bold: true, size: 48, font: 'Times New Roman' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  if (subtitle) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: subtitle, size: 32, font: 'Times New Roman' }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  if (author) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: author, size: 28, font: 'Times New Roman' }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      })
    );
  }

  // Page break after title
  children.push(new Paragraph({ children: [], pageBreakBefore: true }));

  // Chapters
  for (const chapter of chapters) {
    // Chapter title
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: chapter.title, bold: true, size: 32, font: 'Times New Roman' }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    // Scenes
    for (const scene of chapter.scenes) {
      if (scene.title) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: scene.title, bold: true, size: 28, font: 'Times New Roman' }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      }

      // Scene content
      const paragraphs = scene.content.split('\n').filter((p) => p.trim());
      for (const para of paragraphs) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: para, size: 24, font: 'Times New Roman' }),
            ],
            spacing: { after: 100 },
            indent: { firstLine: 720 }, // 1.27cm first line indent
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title}.docx`);
}

export function generateFB2(options: ExportOptions): string {
  const { title, subtitle, author, chapters } = options;

  let fb2 = `<?xml version="1.0" encoding="utf-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0">
  <description>
    <title-info>
      <genre>prose_classic</genre>
      <author>
        <first-name>${author || 'Автор'}</first-name>
      </author>
      <book-title>${escapeXml(title)}</book-title>
      ${subtitle ? `<annotation><p>${escapeXml(subtitle)}</p></annotation>` : ''}
      <date>${new Date().toISOString().split('T')[0]}</date>
      <lang>ru</lang>
    </title-info>
    <document-info>
      <author><first-name>StoryForge</first-name></author>
      <program-used>StoryForge</program-used>
      <date>${new Date().toISOString()}</date>
      <version>1.0</version>
    </document-info>
  </description>
  <body>
`;

  for (const chapter of chapters) {
    fb2 += `    <section>
      <title><p>${escapeXml(chapter.title)}</p></title>
`;

    for (const scene of chapter.scenes) {
      if (scene.title) {
        fb2 += `      <subtitle>${escapeXml(scene.title)}</subtitle>\n`;
      }

      const paragraphs = scene.content.split('\n').filter((p) => p.trim());
      for (const para of paragraphs) {
        fb2 += `      <p>${escapeXml(para)}</p>\n`;
      }
    }

    fb2 += `    </section>\n`;
  }

  fb2 += `  </body>
</FictionBook>`;

  return fb2;
}

export function downloadFB2(options: ExportOptions) {
  const fb2Content = generateFB2(options);
  const blob = new Blob([fb2Content], { type: 'application/xml;charset=utf-8' });
  saveAs(blob, `${options.title}.fb2`);
}

export function downloadPDF(options: ExportOptions) {
  // For PDF, we'll generate an HTML page and trigger print
  const { title, subtitle, author, chapters } = options;

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      font-size: 14pt;
      line-height: 1.5;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px;
    }
    h1 { text-align: center; font-size: 24pt; margin-bottom: 10px; }
    h2 { font-size: 18pt; margin-top: 30px; }
    .subtitle { text-align: center; font-size: 16pt; color: #666; margin-bottom: 20px; }
    .author { text-align: center; font-size: 14pt; color: #888; margin-bottom: 40px; }
    p { text-indent: 1.5em; margin: 0.5em 0; }
    .page-break { page-break-before: always; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ''}
  ${author ? `<div class="author">${escapeHtml(author)}</div>` : ''}
  <div class="page-break"></div>
`;

  for (const chapter of chapters) {
    html += `  <h2>${escapeHtml(chapter.title)}</h2>\n`;

    for (const scene of chapter.scenes) {
      if (scene.title) {
        html += `  <h3>${escapeHtml(scene.title)}</h3>\n`;
      }

      const paragraphs = scene.content.split('\n').filter((p) => p.trim());
      for (const para of paragraphs) {
        html += `  <p>${escapeHtml(para)}</p>\n`;
      }
    }
  }

  html += `</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
