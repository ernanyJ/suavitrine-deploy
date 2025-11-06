This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Configuration

Create a `.env.local` file in the root of this project to configure the backend URL:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

This environment variable is used to fetch store data from the backend API. By default, it uses `http://localhost:8080` if not set.

**Note:** Use `NEXT_PUBLIC_` prefix for environment variables that need to be accessible in the browser (client-side components).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Pré-requisitos

1. **Variável de Ambiente**: Configure a variável `NEXT_PUBLIC_BACKEND_URL` no painel da Vercel com a URL do seu backend em produção.

   - No dashboard da Vercel: Settings → Environment Variables
   - Adicione: `NEXT_PUBLIC_BACKEND_URL` = `https://backend-solitary-snowflake-4899.fly.dev`
   - Aplique para todos os ambientes (Production, Preview, Development)

2. **Build Settings**: A Vercel detecta automaticamente Next.js, mas verifique:
   - Framework Preset: Next.js
   - Build Command: `next build` (padrão)
   - Output Directory: `.next` (padrão)
   - Install Command: `pnpm install` (ou `npm install` / `yarn install` conforme seu gerenciador)

3. **Node.js Version**: Certifique-se de que a versão do Node.js está compatível (Next.js 16 requer Node.js 18+)

### Passos para Deploy

1. Conecte seu repositório GitHub/GitLab à Vercel
2. Configure as variáveis de ambiente conforme acima
3. Clique em "Deploy"
4. Aguarde o build e deploy

### Troubleshooting

- Se houver erros de build, verifique os logs no dashboard da Vercel
- Certifique-se de que a URL do backend está acessível publicamente (sem CORS bloqueando)
- Verifique se todas as rotas da API necessárias estão disponíveis no backend

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
