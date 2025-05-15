
"use client"; // Required because we use useSession, signIn, signOut hooks

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, FileText, Package, Cpu, Lightbulb, History, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react';
import { useSession, signIn, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, protected: true },
  { href: '/', label: 'Create Quotation', icon: FileText, protected: true },
  { href: '/products', label: 'Manage Products', icon: Package, protected: true },
  { href: '/quotations/history', label: 'Quotation History', icon: History, protected: true },
  { href: '/ai-tools/payment-clauses', label: 'AI Payment Clauses', icon: Lightbulb, protected: true },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  // If not authenticated and not on the login page, middleware should redirect.
  // This component might render briefly before middleware kicks in, or if middleware is misconfigured.
  // We might show a loading state or a restricted view here.
  // For now, if session is null and not loading, means user is not authenticated.
  // The middleware handles the redirection to /login.
  // This layout will effectively only render its content for authenticated users, or the login page itself.

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Cpu className="h-12 w-12 animate-pulse text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading PerformaFlow...</p>
      </div>
    );
  }
  
  // If it's the login page, render a minimal layout or just the children
  // This logic might be complex if AppLayout is used by /login.
  // For now, assuming middleware handles redirect and /login uses its own layout or no AppLayout.
  // However, if /login is a child route of this layout, we need to handle it.
  // The middleware should prevent AppLayout from being fully rendered for unauthenticated users on protected routes.

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base text-primary">
          <Cpu className="h-6 w-6" />
          <span className="font-bold text-xl">PerformaFlow</span>
        </Link>
        {session && (
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 ml-auto">
            {navItems.filter(item => item.protected).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-foreground/70 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                    <AvatarFallback>
                      {session.user?.name ? session.user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Profile (soon)</DropdownMenuItem>
                <DropdownMenuItem disabled>Settings (soon)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={() => signIn()} disabled={isLoading}>
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          )}

          {session && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="grid gap-6 text-lg font-medium pt-8">
                  <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary mb-4">
                    <Cpu className="h-6 w-6" />
                    <span className="font-bold text-xl">PerformaFlow</span>
                  </Link>
                  {navItems.filter(item => item.protected).map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="text-foreground/80 hover:text-foreground flex items-center gap-2"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </header>
      
      {/* Main content will only be shown if authenticated, handled by middleware */}
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
        {children}
      </main>

      {session && (
        <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PerformaFlow. All rights reserved.
        </footer>
      )}
    </div>
  );
}
