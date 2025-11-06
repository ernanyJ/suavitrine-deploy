import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { cpf } from 'cpf-cnpj-validator';
import { authApi, authStorage } from '@/lib/api/auth';
import type { LoginRequest, RegisterRequest } from '@/lib/api/types';
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
import { ShoppingBag, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="size-8 text-primary" />
            <h1 className="text-3xl font-bold">SuaVitrine (BETA)</h1>
          </div>
          <p className="text-muted-foreground text-center">
            Sua vitrine digital completa!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'Entrar' : 'Criar conta'}</CardTitle>
            <CardDescription>
              {isLogin
                ? 'Entre com suas credenciais para acessar sua conta'
                : 'Preencha os dados para criar sua conta'}
            </CardDescription>
          </CardHeader>

          {isLogin ? (
            <LoginForm onSuccess={() => navigate({ to: '/' })} />
          ) : (
            <RegisterForm onSuccess={() => navigate({ to: '/' })} />
          )}

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
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? 'Não tem uma conta? Cadastre-se'
                : 'Já tem uma conta? Entre'}
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
    loginMutation.mutate({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loginMutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loginMutation.isPending}
          />
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

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpfValue, setCpfValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cpfError, setCpfError] = useState('');

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      authStorage.setToken(data.token);
      authStorage.setUser({ id: data.userId, name: data.name, email: data.email });
      onSuccess();
    },
    onError: (error: Error) => {
      setError(error.message || 'Erro ao criar conta. Tente novamente.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCpfError('');

    // Client-side validation
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    // Validar CPF usando a biblioteca
    const cpfOnlyNumbers = cpfValue.replace(/\D/g, '');
    if (cpfOnlyNumbers.length !== 11) {
      setCpfError('CPF deve ter 11 dígitos');
      return;
    }

    if (!cpf.isValid(cpfOnlyNumbers)) {
      setCpfError('CPF inválido. Por favor, verifique o número digitado.');
      return;
    }

    registerMutation.mutate({ name, email, cpf: cpfOnlyNumbers, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            type="text"
            placeholder="João Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            disabled={registerMutation.isPending}
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
            autoComplete="email"
            disabled={registerMutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-cpf">CPF</Label>
          <Input
            id="register-cpf"
            type="text"
            placeholder="000.000.000-00"
            value={cpfValue}
            onChange={(e) => {
              // Remove tudo que não é número
              const value = e.target.value.replace(/\D/g, '');
              // Limita a 11 dígitos
              const limitedValue = value.slice(0, 11);
              // Formata usando a biblioteca
              const formatted = limitedValue ? cpf.format(limitedValue) : '';
              setCpfValue(formatted);
              // Limpa erro ao digitar
              if (cpfError) {
                setCpfError('');
              }
            }}
            onBlur={(e) => {
              // Valida CPF quando o campo perde o foco
              const cpfNumbers = e.target.value.replace(/\D/g, '');
              if (cpfNumbers && cpfNumbers.length === 11) {
                if (!cpf.isValid(cpfNumbers)) {
                  setCpfError('CPF inválido');
                } else {
                  setCpfError('');
                }
              } else if (cpfNumbers && cpfNumbers.length > 0) {
                setCpfError('CPF deve ter 11 dígitos');
              } else {
                setCpfError('');
              }
            }}
            required
            maxLength={14}
            disabled={registerMutation.isPending}
          />
          {cpfError && (
            <p className="text-xs text-destructive">{cpfError}</p>
          )}
          {!cpfError && (
            <p className="text-xs text-muted-foreground">
              Digite apenas números
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Senha</Label>
          <Input
            id="register-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
            disabled={registerMutation.isPending}
          />
          <p className="text-xs text-muted-foreground">
            Mínimo de 6 caracteres
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar conta'
          )}
        </Button>
      </CardContent>
    </form>
  );
}
