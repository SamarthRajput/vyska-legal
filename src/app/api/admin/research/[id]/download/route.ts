import { NextRequest, NextResponse } from 'next/server';
import React from 'react';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const research = await prisma.research.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!research) {
      return NextResponse.json(
        { error: 'Research paper not found' },
        { status: 404 }
      );
    }

    // If research has uploaded file, redirect to it
    if (research.fileUrl) {
      return NextResponse.redirect(research.fileUrl);
    }

    // Generate PDF from content
    if (research.content) {
      // Dynamic import to avoid SSR issues
      const ReactPDF = await import('@react-pdf/renderer');
      const ResearchPaperPDF = (await import('@/components/ResearchPaperPDF')).default;

      // Create React element wrapped in Document
      const { Document } = ReactPDF;
      const pdfDoc = React.createElement(
        Document,
        null,
        React.createElement(ResearchPaperPDF, { research })
      );
      
      // Render to buffer
      const buffer = await ReactPDF.renderToBuffer(pdfDoc);

      // Convert Node.js Buffer to Uint8Array for NextResponse
      const uint8Array = new Uint8Array(buffer);

      return new NextResponse(uint8Array, {
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
