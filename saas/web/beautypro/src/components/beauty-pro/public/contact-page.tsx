'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' } as any,
  transition: { duration: 0.5 },
};

const contactInfo = [
  {
    icon: Phone,
    title: 'Telefone',
    value: '(11) 3456-7890',
    description: 'Seg-Sáb, 8h às 20h',
    href: 'tel:+551134567890',
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'contato@studiobeauty.com.br',
    description: 'Respondemos em até 24h',
    href: 'mailto:contato@studiobeauty.com.br',
  },
  {
    icon: MapPin,
    title: 'Endereço',
    value: 'Rua Augusta, 1200',
    description: 'Consolação, São Paulo - SP',
    href: '#',
  },
];

const businessHours = [
  { day: 'Segunda', hours: '8h às 20h' },
  { day: 'Terça', hours: '8h às 20h' },
  { day: 'Quarta', hours: '8h às 20h' },
  { day: 'Quinta', hours: '8h às 20h' },
  { day: 'Sexta', hours: '8h às 20h' },
  { day: 'Sábado', hours: '8h às 18h' },
  { day: 'Domingo', hours: 'Fechado' },
];

export function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formState.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formState.email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email))
      newErrors.email = 'Email inválido';
    if (!formState.message.trim()) newErrors.message = 'Mensagem é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-beauty-pink-light/20 dark:from-primary/20 dark:via-primary/10 dark:to-beauty-pink-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">Contato</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Fale <span className="text-primary">conosco</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Estamos sempre prontos para ajudar. Entre em contato por telefone, email
              ou preencha o formulário abaixo.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {contactInfo.map((info, i) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <info.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{info.title}</h3>
                    <p className="text-primary font-medium mb-1">{info.value}</p>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div {...fadeInUp}>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Envie sua mensagem</h2>

                  {submitted ? (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Mensagem enviada!</h3>
                      <p className="text-muted-foreground mb-4">
                        Obrigado pelo contato. Retornaremos em breve.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSubmitted(false);
                          setFormState({ name: '', email: '', phone: '', message: '' });
                        }}
                      >
                        Enviar outra mensagem
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                          id="name"
                          placeholder="Seu nome completo"
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && (
                          <p className="text-xs text-destructive">{errors.name}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={formState.email}
                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                            className={errors.email ? 'border-destructive' : ''}
                          />
                          {errors.email && (
                            <p className="text-xs text-destructive">{errors.email}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            placeholder="(11) 99999-9999"
                            value={formState.phone}
                            onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Mensagem *</Label>
                        <Textarea
                          id="message"
                          placeholder="Como podemos ajudar?"
                          rows={5}
                          value={formState.message}
                          onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                          className={errors.message ? 'border-destructive' : ''}
                        />
                        {errors.message && (
                          <p className="text-xs text-destructive">{errors.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                        disabled={sending}
                      >
                        {sending ? (
                          <>
                            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Enviar Mensagem
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right side: Map + Hours + WhatsApp */}
            <motion.div {...fadeInUp} className="space-y-6">
              {/* Map Placeholder */}
              <Card>
                <CardContent className="p-0">
                  <div className="h-64 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center rounded-t-lg">
                    <div className="text-center">
                      <MapPin className="w-10 h-10 text-primary/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Rua Augusta, 1200 - Consolação
                      </p>
                      <p className="text-xs text-muted-foreground">São Paulo - SP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Horário de Funcionamento
                  </h3>
                  <div className="space-y-2">
                    {businessHours.map((bh) => (
                      <div
                        key={bh.day}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">{bh.day}</span>
                        <span className={bh.hours === 'Fechado' ? 'text-destructive font-medium' : 'font-medium'}>
                          {bh.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Button */}
              <Button
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={() => window.open('https://wa.me/551134567890', '_blank')}
              >
                <MessageCircle className="w-5 h-5" />
                Falar pelo WhatsApp
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
