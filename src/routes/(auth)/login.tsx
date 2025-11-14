import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { authApi, authStorage } from '@/lib/api/auth';
import type { LoginRequest } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import logoImage from '@/assets/logo.png';

// Constants for validation limits
const MAX_EMAIL_LENGTH = 255
const MAX_PASSWORD_LENGTH = 75
const MIN_PASSWORD_LENGTH = 6

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img 
            src={logoImage} 
            alt="SuaVitrine" 
            className="size-20 object-contain"
          />
          <h1 className="text-3xl font-bold mb-2">SuaVitrine</h1>
          <p className="text-muted-foreground text-center">
            Sua vitrine digital completa!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>

          <LoginForm onSuccess={() => navigate({ to: '/' })} />

          <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              asChild
            >
              <Link to="/register">
                Não tem uma conta? Cadastre-se
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      authStorage.setToken(data.token);
      authStorage.setUser({ id: data.userId, name: data.name, email: data.email });
      onSuccess();
    },
    onError: (error: Error) => {
      setError(error.message || 'Erro ao fazer login. Tente novamente.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (email.length > MAX_EMAIL_LENGTH) {
      setError(`Email deve ter no máximo ${MAX_EMAIL_LENGTH} caracteres`);
      return;
    }

    if (!password.trim()) {
      setError('Senha é obrigatória');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres`);
      return;
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      setError(`Senha deve ter no máximo ${MAX_PASSWORD_LENGTH} caracteres`);
      return;
    }

    loginMutation.mutate({ email: email.trim(), password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2 mt-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value.slice(0, MAX_EMAIL_LENGTH))}
            required
            autoComplete="email"
            disabled={loginMutation.isPending}
            maxLength={MAX_EMAIL_LENGTH}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value.slice(0, MAX_PASSWORD_LENGTH))}
              required
              autoComplete="current-password"
              disabled={loginMutation.isPending}
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={MAX_PASSWORD_LENGTH}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={loginMutation.isPending}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </CardContent>
    </form>
  );
}

