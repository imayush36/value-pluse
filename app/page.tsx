// @ts-nocheck
'use client';

import dynamic from 'next/dynamic';

const NextApp = dynamic(() => import('../src/NextApp'), { ssr: false });

export default function Page() {
  return <NextApp />;
}