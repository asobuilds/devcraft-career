import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 64,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.55,
    color: '#1f2937',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 14,
    marginBottom: 24,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 5,
  },
  contact: {
    fontSize: 9,
    color: '#4b5563',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  spacer: {
    height: 10,
  },
});

export default function CoverLetterPdf({ generatedLetter = '', fullName, email, phone, website }) {
  const contactParts = [email, phone, website].filter(Boolean);
  const lines = generatedLetter.split('\n');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{fullName || 'Your Name'}</Text>
          {contactParts.length > 0 ? (
            <Text style={styles.contact}>{contactParts.join('  ·  ')}</Text>
          ) : null}
        </View>
        <View>
          {lines.map((line, index) =>
            line.trim() === '' ? (
              <View key={index} style={styles.spacer} />
            ) : (
              <Text key={index} style={styles.paragraph}>
                {line.trim()}
              </Text>
            )
          )}
        </View>
      </Page>
    </Document>
  );
}
