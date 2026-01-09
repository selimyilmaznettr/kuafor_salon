import { Link, useLocation } from "wouter";
import { 
  Scissors, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/appointments", label: "Appointments", icon: Calendar },
  ];

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-lg shadow-lg shadow-primary/25">
          <Scissors className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Lumière</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Salon Manager</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }
                `}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6">
        <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl p-4 border border-accent/20">
          <p className="text-sm font-medium text-accent-foreground mb-1">Need Help?</p>
          <p className="text-xs text-muted-foreground mb-3">Contact support for assistance with the system.</p>
          <Button variant="outline" size="sm" className="w-full bg-white/50 border-accent/30 hover:bg-white text-xs h-8">
            Support
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-border/40 fixed h-full z-10">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-border/40 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-md">
            <Scissors className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-lg">Lumière</span>
        </div>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <div className="flex flex-col h-full">
              <NavContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen">
        <div className="container mx-auto max-w-7xl p-4 lg:p-8 pt-20 lg:pt-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
