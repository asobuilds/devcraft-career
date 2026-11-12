'use client';

import React, { lazy, Suspense } from 'react';
import CVPdfDocument from './CVPdfDocument';

const PdfDocumentRouter = ({ theme, fullName, email, phone, website, summary, skills, experience }) => {
  const PdfComponent = theme === 'lagos-corporate'
    ? lazy(() => import('./CVPdfLagosCorporate'))
    : theme === 'tech-stack'
      ? lazy(() => import('./CVPdfTechStack'))
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
