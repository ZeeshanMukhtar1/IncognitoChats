'use client';
// docs link for session provider : https://next-auth.js.org/getting-started/client#sessionprovider

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
