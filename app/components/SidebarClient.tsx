'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const SidebarClient = dynamic(() => import('./Sidebar'), { ssr: false });

export default SidebarClient;