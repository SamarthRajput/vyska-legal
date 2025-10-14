import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const research = await prisma.research.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true } },
      },
    });

    if (!research) {
      return NextResponse.json(
        { error: 'Research paper not found' },
        { status: 404 }
      );
    }

    if (research.fileUrl) {
      return NextResponse.redirect(research.fileUrl);
    }

    if (research.content) {
      // Parse markdown to plain text
      const parseMarkdown = (markdown: string): string => {
        return markdown
          .replace(/#{1,6}\s/g, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          .replace(/`{1,3}(.*?)`{1,3}/g, '$1');
      };

      const content = parseMarkdown(research.content);
      const description = research.description ? parseMarkdown(research.description) : '';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              @page {
                size: A4;
                margin: 0.75in;
              }
              
              body {
                font-family: 'Times New Roman', Times, serif;
                font-size: 10pt;
                line-height: 1.6;
                color: #000;
              }
              
              .title-section {
                text-align: center;
                margin-bottom: 20px;
              }
              
              .title {
                font-size: 16pt;
                font-weight: bold;
                margin-bottom: 10px;
              }
              
              .author {
                font-size: 12pt;
                margin-bottom: 5px;
              }
              
              .date {
                font-size: 10pt;
                color: #666;
              }
              
              .abstract {
                margin-bottom: 20px;
                padding: 10px;
                background-color: #f5f5f5;
              }
              
              .abstract-title {
                font-size: 12pt;
                font-weight: bold;
                margin-bottom: 5px;
              }
              
              .abstract-text {
                font-size: 10pt;
                text-align: justify;
              }
              
              .two-column-content {
                column-count: 2;
                column-gap: 15px;
                text-align: justify;
              }
              
              .two-column-content p {
                margin-bottom: 10px;
                break-inside: avoid;
              }
              
              .footer {
                position: fixed;
                bottom: 20px;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 9pt;
                color: #666;
              }
            </style>
          </head>
          <body>
            <!-- Title Section -->
            <div class="title-section">
              <div class="title">${research.title}</div>
              <div class="author">${research.createdBy.name}</div>
              <div class="date">
                ${new Date(research.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            ${description ? `
            <!-- Abstract Section -->
            <div class="abstract">
              <div class="abstract-title">Abstract</div>
              <div class="abstract-text">${description}</div>
            </div>
            ` : ''}

            <!-- Two-Column Content -->
            <div class="two-column-content">
              ${content.split('\n\n').filter(p => p.trim()).map(para => `<p>${para}</p>`).join('\n')}
            </div>
          </body>
        </html>
      `;

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="width: 100%; text-align: center; font-size: 9pt; color: #666;">
            <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        `,
        margin: {
          top: '0.75in',
          right: '0.75in',
          bottom: '0.75in',
          left: '0.75in'
        }
      });

      await browser.close();

      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${research.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'No content available for download' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
