# Solução Completa de Deploy

Este repositório contém a versão pronta para **deploy** da aplicação, integrando os três projetos principais:

- `landing` → Frontend do site de apresentação.
- `frontend` → SPA React ou aplicação principal.
- `backend` → API REST em Java Spring Boot.

Além disso, inclui:

- `docker-compose.yml` para orquestração de containers.
- Configurações do **Nginx** para proxy reverso e roteamento de domínios.
- Scripts e configurações de deploy.

---

## Estrutura do Repositório

├── landing/ # Projeto Landing Page
├── frontend/ # Projeto Frontend
├── backend/ # Projeto Backend
├── nginx/ # Configurações de Nginx
├── docker-compose.yml
└── README.md

---

## Tecnologias Utilizadas

- Docker & Docker Compose
- Nginx
- Java (Spring Boot)
- Node.js / React (Frontend)
- HTML/CSS/JS (Landing Page)

---

## Configuração Inicial

### 1. Clonar o repositório

Este repositório utiliza **Git Subtree** para incluir os projetos como pastas dentro da raiz. Ao clonar:

```bash
git clone <url-do-repo-raiz>
cd <nome-repo>
```

Todos os projetos já estarão presentes nas pastas landing, frontend e backend.

### 2. Atualizar Subprojetos (Opcional)

Para trazer a última versão da branch main de cada projeto:

```bash
git fetch backend
git subtree pull --prefix=backend backend main --squash

git fetch frontend
git subtree pull --prefix=frontend frontend main --squash

git fetch landing
git subtree pull --prefix=landing landing main --squash
```

Isso garante que você esteja com a versão mais recente de cada projeto.

### 3. Subir os Containers

No diretório raiz, rode:

```bash
docker-compose up -d --build
```

Isso irá:

- Criar e iniciar containers para backend, frontend e landing.
- Configurar a rede interna do Docker.
- Integrar o Nginx como proxy reverso (se configurado no docker-compose.yml).

### 4. Acessar a Aplicação

- Landing Page: http://<seu-dominio-ou-ip>
- Frontend SPA: http://<seu-dominio-ou-ip>/app (ou conforme configuração do Nginx)
- API Backend: http://<seu-dominio-ou-ip>/api

---

## Notas Importantes

- Este repositório não altera os históricos individuais dos projetos — cada um mantém seu repositório original via subtree.
- Para novos deploys, basta atualizar os subprojetos e rodar `docker-compose up -d --build`.
- Mantenha o Nginx e docker-compose.yml versionados, assim a solução de deploy fica portátil para qualquer VPS.

---

## Contribuição

- Modifique ou adicione novos serviços no docker-compose.yml.
- Atualize as configurações do Nginx em nginx/.
- Para atualizar projetos, use os comandos do Git Subtree acima.
