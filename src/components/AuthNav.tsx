import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export function AuthNav() {
  return (
    <nav className="flex items-center gap-4">
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
    </nav>
  );
}
