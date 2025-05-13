
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, FileText, Package, Cpu, Lightbulb, History } from 'lucide-react'; // Added History icon

const navItems = [
  { href: '/', label: 'Create Invoice', icon: FileText },
  { href: '/products', label: 'Manage Products', icon: Package },
  { href: '/invoices/history', label: 'Invoice History', icon: History },
  { href: '/ai-tools/payment-clauses', label: 'AI Payment Clauses', icon: Lightbulb },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base text-primary">
          <Cpu className="h-6 w-6" />
          <span className="font-bold text-xl">InvoiceFlow</span>
        </Link>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 ml-auto">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-foreground/70 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="ml-auto shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="grid gap-6 text-lg font-medium pt-8">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary mb-4">
                <Cpu className="h-6 w-6" />
                <span className="font-bold text-xl">InvoiceFlow</span>
              </Link>
              {navItems.map((item) => (
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
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
        {children}
      </main>
      <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} InvoiceFlow. All rights reserved.
      </footer>
    </div>
  );
}
