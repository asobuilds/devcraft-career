'use client';

import React from 'react';
import CVPdfDocument from './CVPdfDocument';
import CVPdfLagosCorporate from './CVPdfLagosCorporate';
import CVPdfTechStack from './CVPdfTechStack';

const PdfDocumentRouter = (props) => {
  const { theme } = props;

  if (theme === 'lagos-corporate') {
    return <CVPdfLagosCorporate {...props} />;
  }

  if (theme === 'tech-stack') {
    return <CVPdfTechStack {...props} />;
  }

  return <CVPdfDocument {...props} />;
};

export default PdfDocumentRouter;
