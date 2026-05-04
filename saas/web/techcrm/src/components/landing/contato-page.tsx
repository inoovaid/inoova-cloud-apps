'use client';

import { useState, type FormEvent } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/auth-store';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    detail: 'contato@techcrm.com.br',
    description: 'Resposta em até 24 horas úteis',
  },
  {
    icon: Phone,
    title: 'Telefone',
    detail: '(11) 3000-1234',
    description: 'Seg a Sex, 9h às 18h (horário de Brasília)',
  },
  {
    icon: MapPin,
    title: 'Endereço',
    detail: 'Av. Paulista, 1000 - São Paulo, SP',
    description: 'Sede principal da TechCRM',
  },
  {
    icon: Clock,
    title: 'Horário de atendimento',
    detail: 'Seg a Sex, 9h às 18h',
    description: 'Sábados: 9h às 13h (chat online)',
  },
];

const faq = [
  {
    question: 'Como funciona o período de teste?',
    answer: 'Oferecemos 7 dias grátis para você experimentar todos os recursos da plataforma. Não é necessário cartão de crédito para iniciar o teste. Ao final do período, você pode escolher o plano que melhor se adapta às suas necessidades.',
  },
  {
    question: 'Os certificados são reconhecidos?',
    answer: 'Sim! Nossos certificados são reconhecidos por diversas empresas do setor de tecnologia. Cada certificado inclui um código de verificação único que pode ser validado online por recrutadores e empregadores.',
  },
  {
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer: 'Com certeza! Não há fidelidade ou multa por cancelamento. Você pode cancelar sua assinatura a qualquer momento pela área do aluno ou entrando em contato com nosso suporte. O acesso continua até o final do período já pago.',
  },
  {
    question: 'Como funciona o suporte para alunos?',
    answer: 'Oferecemos suporte por email, chat ao vivo e fórum da comunidade. Alunos dos planos Profissional e Empresarial têm acesso a suporte prioritário e mentoria individual com instrutores especializados.',
  },
  {
    question: 'Vocês oferecem treinamento corporativo?',
    answer: 'Sim! Temos programas personalizados para empresas com dashboards de acompanhamento, relatórios de progresso e certificação em lote. Entre em contato com nosso time comercial para uma proposta personalizada.',
  },
];

export function ContatoPage() {
  const setView = useAuthStore((s) => s.setView);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    // Simula envio
    await new Promise((resolve) => setTimeout(resolve, 800));
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 dark:from-background dark:via-background dark:to-emerald-950/10 py-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="absolute right-10 top-40 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
              <MessageSquare className="size-4" />
              Fale conosco
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Entre em{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                contato
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Tem alguma dúvida, sugestão ou precisa de ajuda? Estamos aqui para você. Envie uma mensagem e nossa equipe responderá o mais rápido possível.
            </p>
          </div>
        </section>

        {/* Info Cards + Form */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-5">
              {/* Info Cards */}
              <div className="space-y-4 lg:col-span-2">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.title} className="border-border/50 transition-all hover:border-emerald-300 hover:shadow-md">
                      <CardContent className="flex items-start gap-4 py-5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                          <Icon className="size-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{item.detail}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Form */}
              <Card className="lg:col-span-3 border-border/50">
                <CardContent className="p-6 sm:p-8">
                  {formSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
                        <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">Mensagem enviada!</h3>
                      <p className="mt-2 text-muted-foreground max-w-sm">
                        Obrigado pelo contato! Nossa equipe responderá em até 24 horas úteis.
                      </p>
                      <Button
                        onClick={() => {
                          setFormSubmitted(false);
                          setName('');
                          setEmail('');
                          setSubject('');
                          setMessage('');
                        }}
                        variant="outline"
                        className="mt-6"
                      >
                        Enviar outra mensagem
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <h2 className="text-xl font-bold text-foreground">Envie sua mensagem</h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="contact-name">Nome</Label>
                          <Input
                            id="contact-name"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Email</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-subject">Assunto</Label>
                        <Input
                          id="contact-subject"
                          placeholder="Como podemos ajudar?"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-message">Mensagem</Label>
                        <Textarea
                          id="contact-message"
                          placeholder="Descreva sua dúvida ou sugestão..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          rows={5}
                          className="resize-none"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 cursor-pointer"
                      >
                        <Send className="size-4 mr-2" />
                        Enviar mensagem
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Perguntas frequentes</h2>
              <p className="mt-4 text-lg text-muted-foreground">As respostas para as dúvidas mais comuns</p>
            </div>
            <div className="space-y-4">
              {faq.map((item) => (
                <Card key={item.question} className="border-border/50">
                  <CardContent className="py-5">
                    <h3 className="mb-2 font-semibold text-foreground">{item.question}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Prefere falar por email?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Envie um email diretamente para <span className="font-semibold text-emerald-600 dark:text-emerald-400">contato@techcrm.com.br</span> e responderemos em até 24 horas úteis.
            </p>
            <Button
              size="lg"
              onClick={() => setView('register')}
              className="mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 px-8 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:brightness-110"
            >
              Começar agora
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
