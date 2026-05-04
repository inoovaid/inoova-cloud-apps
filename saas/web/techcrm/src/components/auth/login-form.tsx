'use client';

import { useState, type FormEvent } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Info, Loader2, ArrowLeft, Cpu, CheckCircle2 } from 'lucide-react';

export function LoginForm() {
  const { login, setView, registeredUser } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  // Se acabou de registrar, pré-preencher campos
  const displayName = justRegistered && registeredUser ? registeredUser.name : name;
  const displayEmail = justRegistered && registeredUser ? registeredUser.email : email;
  const displayPassword = justRegistered && registeredUser ? registeredUser.password : password;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !displayName.trim()) return;

    const finalName = name.trim() || displayName.trim();
    const finalEmail = email.trim() || displayEmail.trim();

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    login(finalName, finalEmail);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/30 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 dark:bg-emerald-800/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200/30 dark:bg-teal-800/10 rounded-full blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md shadow-xl border-0 shadow-emerald-500/5">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex items-center justify-center gap-2 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Cpu className="size-5" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              TechCRM
            </span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Bem-vindo de volta
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Entre na sua conta para acessar o CRM
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Mensagem de sucesso após registro */}
          {registeredUser && justRegistered && (
            <Alert className="mb-4 bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                Usuário cadastrado com sucesso! Agora faça login para acessar o sistema.
              </AlertDescription>
            </Alert>
          )}

          <Alert className="mb-6 bg-sky-50/80 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/50">
            <Info className="size-4 text-sky-600 dark:text-sky-400" />
            <AlertDescription className="text-sky-700 dark:text-sky-300 text-xs">
              Use qualquer nome, email e senha para entrar (modo demonstração)
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-name">Nome</Label>
              <Input
                id="login-name"
                type="text"
                placeholder="Seu nome"
                value={justRegistered && registeredUser ? displayName : name}
                onChange={(e) => { setName(e.target.value); setJustRegistered(false); }}
                required
                disabled={isLoading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                value={justRegistered && registeredUser ? displayEmail : email}
                onChange={(e) => { setEmail(e.target.value); setJustRegistered(false); }}
                required
                disabled={isLoading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Senha</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={justRegistered && registeredUser ? displayPassword : password}
                  onChange={(e) => { setPassword(e.target.value); setJustRegistered(false); }}
                  required
                  disabled={isLoading}
                  className="h-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 cursor-pointer"
              disabled={isLoading || (!name.trim() && !displayName.trim())}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <p className="text-sm text-muted-foreground text-center">
            Não tem conta?{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer"
              onClick={() => setView('register')}
            >
              Criar conta
            </Button>
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
            onClick={() => setView('landing')}
          >
            <ArrowLeft className="size-3.5" />
            Voltar para o site
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
