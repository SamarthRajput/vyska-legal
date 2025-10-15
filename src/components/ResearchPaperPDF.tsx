import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
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
  h1: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  h2: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  h3: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 10,
    textAlign: 'justify',
    lineHeight: 1.6,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  link: {
    color: 'blue',
    textDecoration: 'underline',
  },
  listItem: {
    fontSize: 10,
    marginBottom: 3,
    marginLeft: 15,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#ccc',
    paddingLeft: 10,
    marginVertical: 5,
    fontStyle: 'italic',
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#f4f4f4',
    padding: 2,
    fontSize: 9,
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

interface ParsedElement {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'blockquote';
  content: Array<{
    text: string;
    bold?: boolean;
    italic?: boolean;
    link?: string;
  }>;
}

const parseMarkdownToElements = (markdown: string): ParsedElement[] => {
  const lines = markdown.split('\n');
  const elements: ParsedElement[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        elements.push({
          type: 'p',
          content: parseInlineMarkdown(text),
        });
      }
      currentParagraph = [];
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      flushParagraph();
      return;
    }

    if (trimmedLine.startsWith('# ')) {
      flushParagraph();
      elements.push({
        type: 'h1',
        content: parseInlineMarkdown(trimmedLine.replace(/^#\s/, '')),
      });
    } else if (trimmedLine.startsWith('## ')) {
      flushParagraph();
      elements.push({
        type: 'h2',
        content: parseInlineMarkdown(trimmedLine.replace(/^##\s/, '')),
      });
    } else if (trimmedLine.startsWith('### ')) {
      flushParagraph();
      elements.push({
        type: 'h3',
        content: parseInlineMarkdown(trimmedLine.replace(/^###\s/, '')),
      });
    }

    else if (trimmedLine.startsWith('> ')) {
      flushParagraph();
      elements.push({
        type: 'blockquote',
        content: parseInlineMarkdown(trimmedLine.replace(/^>\s/, '')),
      });
    }

    else if (trimmedLine.match(/^[-*]\s/)) {
      flushParagraph();
      elements.push({
        type: 'ul',
        content: parseInlineMarkdown(trimmedLine.replace(/^[-*]\s/, '')),
      });
    } else if (trimmedLine.match(/^\d+\.\s/)) {
      flushParagraph();
      elements.push({
        type: 'ol',
        content: parseInlineMarkdown(trimmedLine.replace(/^\d+\.\s/, '')),
      });
    }

    else {
      currentParagraph.push(trimmedLine);
    }
  });

  flushParagraph();
  return elements;
};


const parseInlineMarkdown = (text: string): Array<{
  text: string;
  bold?: boolean;
  italic?: boolean;
  link?: string;
}> => {
  const segments: Array<{
    text: string;
    bold?: boolean;
    italic?: boolean;
    link?: string;
  }> = [];

  const patterns = [
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' }, 
    { regex: /\*\*([^*]+)\*\*/g, type: 'bold' }, 
    { regex: /\*([^*]+)\*/g, type: 'italic' }, 
    { regex: /`([^`]+)`/g, type: 'code' }, 
  ];

  let remainingText = text;
  const matches: Array<{
    index: number;
    length: number;
    text: string;
    type: string;
    url?: string;
  }> = [];


  patterns.forEach(({ regex, type }) => {
    let match;
    const regexCopy = new RegExp(regex);
    while ((match = regexCopy.exec(text)) !== null) {
      if (type === 'link') {
        matches.push({
          index: match.index,
          length: match[0].length,
          text: match[1],
          type,
          url: match[2],
        });
      } else {
        matches.push({
          index: match.index,
          length: match[0].length,
          text: match[1],
          type,
        });
      }
    }
  });


  matches.sort((a, b) => a.index - b.index);

  if (matches.length === 0) {
    return [{ text }];
  }


  let currentIndex = 0;
  matches.forEach((match) => {
    if (match.index > currentIndex) {
      segments.push({ text: text.substring(currentIndex, match.index) });
    }

    if (match.type === 'link') {
      segments.push({ text: match.text, link: match.url });
    } else if (match.type === 'bold') {
      segments.push({ text: match.text, bold: true });
    } else if (match.type === 'italic') {
      segments.push({ text: match.text, italic: true });
    } else {
      segments.push({ text: match.text });
    }

    currentIndex = match.index + match.length;
  });

  if (currentIndex < text.length) {
    segments.push({ text: text.substring(currentIndex) });
  }

  return segments;
};

const renderElement = (element: ParsedElement, index: number) => {
  const renderContent = () => {
    return element.content.map((segment, i) => {
      if (segment.link) {
        return (
          <Link key={i} src={segment.link} style={styles.link}>
            {segment.text}
          </Link>
        );
      }
      
      const textStyle = [];
      if (segment.bold) textStyle.push(styles.bold);
      if (segment.italic) textStyle.push(styles.italic);

      return (
        <Text key={i} style={textStyle}>
          {segment.text}
        </Text>
      );
    });
  };

  switch (element.type) {
    case 'h1':
      return (
        <Text key={index} style={styles.h1}>
          {renderContent()}
        </Text>
      );
    case 'h2':
      return (
        <Text key={index} style={styles.h2}>
          {renderContent()}
        </Text>
      );
    case 'h3':
      return (
        <Text key={index} style={styles.h3}>
          {renderContent()}
        </Text>
      );
    case 'blockquote':
      return (
        <View key={index} style={styles.blockquote}>
          <Text>{renderContent()}</Text>
        </View>
      );
    case 'ul':
    case 'ol':
      return (
        <Text key={index} style={styles.listItem}>
          • {renderContent()}
        </Text>
      );
    default:
      return (
        <Text key={index} style={styles.paragraph}>
          {renderContent()}
        </Text>
      );
  }
};

const ResearchPaperPDF: React.FC<ResearchPaperPDFProps> = ({ research }) => {
  const elements = parseMarkdownToElements(research.content || '');
  const halfLength = Math.ceil(elements.length / 2);
  const leftColumn = elements.slice(0, halfLength);
  const rightColumn = elements.slice(halfLength);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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

        {research.description && (
          <View style={styles.abstract}>
            <Text style={styles.abstractTitle}>Abstract</Text>
            <Text style={styles.abstractText}>{research.description}</Text>
          </View>
        )}

        <View style={styles.twoColumnContainer}>
          <View style={styles.column}>
            {leftColumn.map((element, index) => renderElement(element, index))}
          </View>

          <View style={styles.column}>
            {rightColumn.map((element, index) => renderElement(element, index))}
          </View>
        </View>

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
