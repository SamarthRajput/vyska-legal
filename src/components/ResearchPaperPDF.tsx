import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: '0.75in',
    backgroundColor: '#ffffff',
    fontSize: 10,
    fontFamily: 'Times-Roman',
  },
  titleSection: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  author: {
    fontSize: 12,
    marginBottom: 5,
  },
  date: {
    fontSize: 10,
    color: '#666',
  },
  abstract: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  abstractTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  abstractText: {
    fontSize: 10,
    textAlign: 'justify',
    lineHeight: 1.5,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  column: {
    flex: 1,
  },
  heading: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 10,
    textAlign: 'justify',
    lineHeight: 1.6,
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
  },
});

interface ResearchPaperPDFProps {
  research: {
    title: string;
    description?: string | null;
    content?: string | null;
    createdAt: Date;
    createdBy: {
      name: string;
    };
  };
}

// Simple markdown to text converter for PDF
const parseMarkdown = (markdown: string): string[] => {
  const text = markdown
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1'); // Remove code blocks
  
  return text.split('\n\n').filter(p => p.trim());
};

const ResearchPaperPDF: React.FC<ResearchPaperPDFProps> = ({ research }) => {
  const paragraphs = parseMarkdown(research.content || '');
  const halfLength = Math.ceil(paragraphs.length / 2);
  const leftColumn = paragraphs.slice(0, halfLength);
  const rightColumn = paragraphs.slice(halfLength);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{research.title}</Text>
          <Text style={styles.author}>{research.createdBy.name}</Text>
          <Text style={styles.date}>
            {new Date(research.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Abstract Section */}
        {research.description && (
          <View style={styles.abstract}>
            <Text style={styles.abstractTitle}>Abstract</Text>
            <Text style={styles.abstractText}>{research.description}</Text>
          </View>
        )}

        {/* Two-Column Content */}
        <View style={styles.twoColumnContainer}>
          {/* Left Column */}
          <View style={styles.column}>
            {leftColumn.map((para, index) => (
              <Text key={`left-${index}`} style={styles.paragraph}>
                {para}
              </Text>
            ))}
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            {rightColumn.map((para, index) => (
              <Text key={`right-${index}`} style={styles.paragraph}>
                {para}
              </Text>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

export default ResearchPaperPDF;
