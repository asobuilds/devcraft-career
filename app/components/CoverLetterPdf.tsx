import React from 'react';
import { Document, Page, Text } from '@react-pdf/renderer';

const CoverLetterPdf = ({ coverLetterText }: { coverLetterText: string }) => {
  return (
    <Document>
      <Page size="A4">
        <div>
          <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '10mm', borderBottom: '1px solid #dee2e6', paddingBottom: '5mm' }}>
            Cover Letter
          </div>
          <div style={{ fontWeight: 'bold', marginBottom: '5mm' }}>Dear Hiring Manager,</div>
          <div style={{ margin: '0 0 5mm 0', lineHeight: '1.5' }}>
            {coverLetterText.split('\n').map((line, i) => {
              if (line.trim() === '') return <br key={i} />;
              return <Text key={i}> {line.trim()} </Text>;
            })}
          </div>
          <div style={{ marginTop: '20mm', fontSize: 12, borderTop: '1px solid #dee2e6', paddingTop: '5mm' }}>
            Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experience align with your needs.
          </div>
          <div style={{ marginTop: '5mm' }}>Sincerely,</div>
          <div></div>
        </div>
      </Page>
    </Document>
  );
};

export default CoverLetterPdf;