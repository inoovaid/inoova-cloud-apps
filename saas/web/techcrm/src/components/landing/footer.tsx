'use client';

import { Code2, Github, Twitter, Linkedin, Youtube } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const footerLinks = {
  Cursos: [
    { label: 'Front-end', view: 'landing' as const, section: 'cursos' },
    { label: 'Back-end', view: 'landing' as const, section: 'cursos' },
    { label: 'QA', view: 'landing' as const, section: 'cursos' },
    { label: 'DevOps', view: 'landing' as const, section: 'cursos' },
    { label: 'Dados', view: 'landing' as const, section: 'cursos' },
    { label: 'IA', view: 'landing' as const, section: 'cursos' },
  ],
  Empresa: [
    { label: 'Sobre nós', view: 'sobre' as const, section: null },
    { label: 'Blog', view: 'blog' as const, section: null },
    { label: 'Carreiras', view: null, section: null },
    { label: 'Parceiros', view: null, section: null },
  ],
  Suporte: [
    { label: 'Central de ajuda', view: null, section: null },
    { label: 'Contato', view: 'contato' as const, section: null },
    { label: 'FAQ', view: 'contato' as const, section: null },
    { label: 'Comunidade', view: null, section: null },
  ],
  Legal: [
    { label: 'Termos de uso', view: null, section: null },
    { label: 'Privacidade', view: null, section: null },
    { label: 'Cookies', view: null, section: null },
    { label: 'LGPD', view: null, section: null },
  ],
};

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export function Footer() {
  const { setView } = useAuthStore();

  const handleLinkClick = (view: string | null, section: string | null) => {
    if (view) {
      setView(view as any);
      if (section) {
        setTimeout(() => {
          const el = document.getElementById(section);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  return (
    <footer id="contato" className="border-t border-border bg-muted/30 dark:bg-muted/10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-6">
          {/* Logo & description */}
          <div className="lg:col-span-2">
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
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Plataforma completa de cursos de tecnologia para transformar sua carreira. Aprenda com projetos reais e certificados reconhecidos.
            </p>

            {/* Social links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground">{title}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.view ? (
                      <button
                        onClick={() => handleLinkClick(link.view, link.section)}
                        className="text-sm text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <span className="text-sm text-muted-foreground">{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-border/50 pt-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} TechCRM. Todos os direitos reservados.
            </p>
            <p className="text-sm text-muted-foreground">
              Feito com ❤️ para a comunidade tech brasileira
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
