// front/app/login/page.tsx
"use client"; // This page must be a Client Component

// Import both Login component and AuthProvider
import Login from "../../src/pages/Login";
import { AuthProvider } from "../../src/contexts/AuthContext"; // Import AuthProvider

export default function LoginPage() {
  return (
    <AuthProvider> {/* Wrap the Login component with AuthProvider */}
      <Login />
    </AuthProvider>
  );
}