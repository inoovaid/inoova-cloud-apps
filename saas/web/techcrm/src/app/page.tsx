'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { CoursesSection } from '@/components/landing/courses-section';
import { BenefitsSection } from '@/components/landing/benefits-section';
import { PlansSection } from '@/components/landing/plans-section';
import { Footer } from '@/components/landing/footer';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { CRMLayout } from '@/components/crm/crm-layout';
import { SobrePage } from '@/components/landing/sobre-page';
import { BlogPage } from '@/components/landing/blog-page';
import { ContatoPage } from '@/components/landing/contato-page';

export default function Home() {
  const view = useAuthStore((s) => s.view);

  if (view === 'crm') {
    return <CRMLayout />;
  }

  if (view === 'login') {
    return <LoginForm />;
  }

  if (view === 'register') {
    return <RegisterForm />;
  }

  if (view === 'sobre') {
    return <SobrePage />;
  }

  if (view === 'blog') {
    return <BlogPage />;
  }

  if (view === 'contato') {
    return <ContatoPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <CoursesSection />
        <BenefitsSection />
        <PlansSection />
      </main>
      <Footer />
    </div>
  );
}
