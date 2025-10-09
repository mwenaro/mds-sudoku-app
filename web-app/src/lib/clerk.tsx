// Clerk configuration for Next.js App Router
import { ClerkProvider } from '@clerk/nextjs';

export function withClerkProvider(children: React.ReactNode) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
