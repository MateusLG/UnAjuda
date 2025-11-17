<div align="center">
  <h1>🎓 UnAjuda</h1>
  <p><strong>Plataforma colaborativa de perguntas e respostas para estudantes universitários</strong></p>

  ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
  ![React](https://img.shields.io/badge/React-18.3-61dafb)
  ![License](https://img.shields.io/badge/license-Private-red)
</div>

---

## 📖 Sobre o Projeto

**UnAjuda** é uma plataforma moderna e interativa onde estudantes universitários podem compartilhar conhecimento, esclarecer dúvidas e construir uma comunidade acadêmica forte. Inspirada no Stack Overflow, a plataforma oferece uma experiência otimizada para o ambiente universitário brasileiro.

### ✨ Funcionalidades Principais

- 🔐 **Autenticação Segura** - Sistema completo de login/cadastro com validação robusta
- ❓ **Perguntas e Respostas** - Faça perguntas e ajude outros estudantes
- 👍 **Sistema de Votação** - Vote nas melhores respostas
- 🏆 **Gamificação** - Sistema de reputação, níveis e badges
- 🔔 **Notificações em Tempo Real** - Seja notificado sobre respostas e menções
- 📂 **Categorias** - Organize perguntas por disciplinas
- 🔍 **Busca Avançada** - Encontre respostas rapidamente
- 🌓 **Tema Claro/Escuro** - Conforto visual em qualquer hora do dia
- 📱 **Design Responsivo** - Funciona perfeitamente em desktop e mobile

---

## 🚀 Tecnologias

### Frontend
- **[React 18.3](https://react.dev/)** - Biblioteca UI moderna
- **[TypeScript 5.8](https://www.typescriptlang.org/)** - Tipagem estática
- **[Vite 5.4](https://vitejs.dev/)** - Build tool ultra-rápida
- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes acessíveis e customizáveis
- **[Lucide React](https://lucide.dev/)** - Ícones modernos

### Backend & Infraestrutura
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL Database
  - Authentication & Authorization
  - Row Level Security (RLS)
  - Real-time Subscriptions
  - Storage

### Gerenciamento de Estado & Dados
- **[TanStack Query 5](https://tanstack.com/query)** - Gerenciamento de estado assíncrono
- **[React Router 6](https://reactrouter.com/)** - Roteamento client-side
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários
- **[Zod](https://zod.dev/)** - Validação de schemas

### Qualidade & Segurança
- **ESLint** - Linting de código
- **TypeScript Strict Mode** - Tipagem rigorosa
- **Zod Validation** - Validação de inputs
- **Content Security Policy** - Proteção contra XSS
- **Error Boundaries** - Tratamento robusto de erros

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **[Node.js](https://nodejs.org/)** 18.x ou superior
- **[npm](https://www.npmjs.com/)** 9.x ou superior (ou **[bun](https://bun.sh/)** como alternativa)
- **[Git](https://git-scm.com/)**
- Uma conta no **[Supabase](https://supabase.com/)** (gratuita)

---

## ⚙️ Instalação e Configuração

### 1️⃣ Clone o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd unajuda-243ad330
```

### 2️⃣ Instale as Dependências

```bash
npm install
```

Ou usando Bun:
```bash
bun install
```

### 3️⃣ Configure as Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_PROJECT_ID="seu_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua_chave_publica"
VITE_SUPABASE_URL="https://seu_project_id.supabase.co"
```

**📝 Como obter as credenciais:**
1. Acesse [Supabase Dashboard](https://app.supabase.com/)
2. Crie um novo projeto (ou selecione um existente)
3. Vá em **Settings** → **API**
4. Copie as credenciais:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Reference ID** → `VITE_SUPABASE_PROJECT_ID`

### 4️⃣ Configure o Banco de Dados

Execute as migrations do Supabase:

```bash
# Se você tem o Supabase CLI instalado:
supabase db push

# Ou importe manualmente em: Dashboard → SQL Editor
```

As migrations estão em `supabase/migrations/`.

### 5️⃣ Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:8080**

---

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (porta 8080) |
| `npm run build` | Gera build de produção otimizada |
| `npm run build:dev` | Gera build em modo desenvolvimento |
| `npm run preview` | Preview da build de produção |
| `npm run lint` | Executa ESLint para verificar código |

---

## 📁 Estrutura do Projeto

```
unajuda-243ad330/
├── public/                      # Arquivos estáticos
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/                  # Imagens e recursos
│   │   └── avatars/             # Avatares padrão
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes shadcn/ui
│   │   ├── profile/             # Componentes de perfil
│   │   ├── ErrorBoundary.tsx    # Tratamento de erros
│   │   ├── Navbar.tsx           # Barra de navegação
│   │   └── ...
│   ├── contexts/                # React Contexts
│   │   └── AuthContext.tsx      # Context de autenticação
│   ├── hooks/                   # Custom hooks
│   │   ├── use-toast.ts
│   │   └── use-mobile.tsx
│   ├── integrations/            # Integrações externas
│   │   └── supabase/
│   │       ├── client.ts        # Cliente Supabase
│   │       └── types.ts         # Tipos do DB
│   ├── lib/                     # Utilitários
│   │   ├── utils.ts             # Funções auxiliares
│   │   ├── validations.ts       # Schemas Zod
│   │   └── error-handler.ts     # Tratamento de erros
│   ├── pages/                   # Páginas/Rotas
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Profile.tsx
│   │   ├── QuestionDetail.tsx
│   │   └── ...
│   ├── utils/                   # Utilitários específicos
│   │   └── reputation.ts        # Sistema de reputação
│   ├── App.tsx                  # Componente raiz
│   ├── main.tsx                 # Entry point
│   └── index.css                # Estilos globais
├── supabase/
│   └── migrations/              # Migrations do banco
├── .env.example                 # Template de variáveis
├── .gitignore                   # Arquivos ignorados pelo Git
├── CHANGELOG.md                 # Histórico de mudanças
├── SECURITY.md                  # Documentação de segurança
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md                    # Este arquivo
```

---

## 🗄️ Banco de Dados

O projeto utiliza **Supabase** (PostgreSQL) com as seguintes tabelas principais:

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuários (nome, avatar, bio, reputação) |
| `questions` | Perguntas feitas pelos usuários |
| `answers` | Respostas para as perguntas |
| `votes` | Votos em perguntas e respostas |
| `categories` | Categorias de disciplinas |
| `notifications` | Notificações em tempo real |
| `badges` | Badges conquistáveis |
| `user_badges` | Relação usuário-badges |

### 🔒 Segurança

- **Row Level Security (RLS)** ativado em todas as tabelas
- Políticas de acesso por usuário autenticado
- Triggers automáticos para criação de perfil e notificações

---

## 🚀 Deploy

### Build de Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`.

### Plataformas Recomendadas

| Plataforma | Dificuldade | Grátis |
|------------|-------------|--------|
| **[Vercel](https://vercel.com/)** | Fácil | ✅ |
| **[Netlify](https://www.netlify.com/)** | Fácil | ✅ |
| **[Cloudflare Pages](https://pages.cloudflare.com/)** | Fácil | ✅ |
| **[Railway](https://railway.app/)** | Média | ✅ (com limites) |

### Configuração de Variáveis de Ambiente

⚠️ **Importante:** Configure as variáveis de ambiente na plataforma de deploy:

```env
VITE_SUPABASE_PROJECT_ID=seu_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
VITE_SUPABASE_URL=https://seu_project_id.supabase.co
```

---

## 🔒 Segurança

Este projeto implementa várias camadas de segurança:

✅ **Validação de Inputs** - Zod schemas em todos os formulários
✅ **Sanitização de Erros** - Mensagens seguras para usuários
✅ **Content Security Policy** - Proteção contra XSS
✅ **Row Level Security** - Controle de acesso no banco
✅ **Error Boundaries** - Tratamento robusto de erros
✅ **Senhas Fortes** - Requisitos de complexidade
✅ **HTTPS Obrigatório** - Em produção

📄 Para mais detalhes, consulte: **[SECURITY.md](./SECURITY.md)**

---

## 📝 Contribuindo

Contribuições são bem-vindas! Siga estas etapas:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature:
   ```bash
   git checkout -b feature/MinhaNovaFeature
   ```
3. **Commit** suas mudanças:
   ```bash
   git commit -m 'feat: Adiciona MinhaNovaFeature'
   ```
4. **Push** para a branch:
   ```bash
   git push origin feature/MinhaNovaFeature
   ```
5. Abra um **Pull Request**

### 📐 Padrões de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

---

## 📜 Licença

Este projeto é **privado** e todos os direitos são reservados.

---

## 👥 Autores

- Desenvolvido por **[Seu Nome]**

---

## 📞 Suporte

Se encontrar problemas ou tiver dúvidas:

- Abra uma [Issue](../../issues)
- Consulte a [Documentação de Segurança](./SECURITY.md)
- Revise o [Changelog](./CHANGELOG.md)

---

<div align="center">
  <p>Feito com ❤️ para a comunidade universitária</p>
  <p><sub>2025 © UnAjuda - Todos os direitos reservados</sub></p>
</div>
