'use client';

import React from 'react';
import CVPdfDocument from './CVPdfDocument'; // eslint-disable-line no-unused-vars

const PdfDocumentRouter = ({ theme, fullName, email, phone, website, summary, skills, experience }) => {
  const PdfComponent = theme === 'lagos-corporate'
    ? lazy(() => import('./components/CVPdfLagosCorporate'))
    : theme === 'tech-stack'
      ? lazy(() => import('./components/CVPdfTechStack'))
    : CVPdfDocument;

  return (
    <Suspense fallback={<div>Loading PDF document...</div>}>
      <PdfComponent
        fullName={fullName}
        email={email}
        phone={phone}
        website={website}
        summary={summary}
        skills={skills}
        experience={experience}
      />
    </Suspense>
  );
};

export default PdfDocumentRouter;