'use client';

import { useState } from 'react';
import { Menu, X, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';

const navLinks = [
  { label: 'Cursos', href: '#cursos', view: null },
  { label: 'Blog', href: '', view: 'blog' as const },
  { label: 'Sobre', href: '', view: 'sobre' as const },
  { label: 'Contato', href: '', view: 'contato' as const },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setView, view: currentView } = useAuthStore();

  const handleNavClick = (item: typeof navLinks[number]) => {
    if (item.view) {
      setView(item.view);
    } else if (currentView !== 'landing') {
      setView('landing');
      // Wait for landing page to render then scroll
      setTimeout(() => {
        const el = document.getElementById('cursos');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('cursos');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:bg-background/70 dark:border-border/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Tech<span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">CRM</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('login')}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Entrar
          </Button>
          <Button
            size="sm"
            onClick={() => setView('register')}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
          >
            Criar conta
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/50 bg-white/95 backdrop-blur-xl md:hidden dark:bg-background/95">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="block w-full text-left rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-border/50 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setView('login');
                  setMobileOpen(false);
                }}
                className="w-full"
              >
                Entrar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setView('register');
                  setMobileOpen(false);
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
              >
                Criar conta
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
