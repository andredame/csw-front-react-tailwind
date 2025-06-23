// front/app/page.tsx
"use client" // This component remains a client component.

import dynamic from 'next/dynamic'; // Import Next.js's dynamic utility

// Dynamically import the App component.
// { ssr: false } tells Next.js NOT to render this component on the server.
const DynamicApp = dynamic(() => import("../src/App"), { ssr: false });

export default function SyntheticV0PageForDeployment() {
  // Render the dynamically imported App component.
  // It will only be rendered once the client-side environment is available.
  return <DynamicApp />;
}