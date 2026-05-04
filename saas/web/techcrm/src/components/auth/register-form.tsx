'use client';

import { useState, type FormEvent } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Info, Loader2, ArrowLeft, Cpu } from 'lucide-react';

export function RegisterForm() {
  const { register, setView } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || passwordMismatch) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Registra mas NÃO loga - vai para a tela de login com mensagem de sucesso
    register(name.trim(), email.trim(), password);
    setIsLoading(false);
  };

  const isSubmitDisabled =
    isLoading || !name.trim() || !email.trim() || !password || !confirmPassword || passwordMismatch;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-teal-950/30 dark:via-background dark:to-emerald-950/30 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-200/30 dark:bg-teal-800/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-200/30 dark:bg-emerald-800/10 rounded-full blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md shadow-xl border-0 shadow-teal-500/5">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex items-center justify-center gap-2 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25">
              <Cpu className="size-5" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              TechCRM
            </span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Criar sua conta
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Comece sua jornada em tecnologia
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Alert className="mb-6 bg-sky-50/80 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/50">
            <Info className="size-4 text-sky-600 dark:text-sky-400" />
            <AlertDescription className="text-sky-700 dark:text-sky-300 text-xs">
              Modo demonstração — use qualquer dado para criar sua conta
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">Nome completo</Label>
              <Input
                id="register-name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Senha</Label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crie uma senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  aria-invalid={passwordMismatch}
                  className={`h-10 pr-10 ${passwordMismatch ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
              {passwordMismatch && (
                <p className="text-xs text-destructive font-medium">
                  As senhas não coincidem
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 transition-all duration-200 cursor-pointer"
              disabled={isSubmitDisabled}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <p className="text-sm text-muted-foreground text-center">
            Já tem conta?{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-teal-600 dark:text-teal-400 font-semibold hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer"
              onClick={() => setView('login')}
            >
              Entrar
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
