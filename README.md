# UnAjuda

Uma plataforma colaborativa de perguntas e respostas voltada para estudantes universitários.

## Sobre o Projeto

UnAjuda é uma plataforma onde estudantes podem:
- Fazer perguntas sobre matérias universitárias
- Responder dúvidas de outros estudantes
- Votar em perguntas e respostas
- Construir reputação através da participação
- Navegar por categorias de disciplinas

## Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod

## Pré-requisitos

- Node.js 18+ (recomendado: instalar via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm ou bun

## Instalação e Configuração

1. Clone o repositório:
```bash
git clone <URL_DO_REPOSITORIO>
cd unajuda-243ad330
```

2. Instale as dependências:
```bash
npm install
# ou
bun install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase
VITE_SUPABASE_PROJECT_ID=seu_project_id
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
bun dev
```

O projeto estará disponível em `http://localhost:8080`

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run build:dev` - Cria a build em modo desenvolvimento
- `npm run lint` - Executa o linter
- `npm run preview` - Preview da build de produção

## Estrutura do Projeto

```
src/
├── components/     # Componentes React reutilizáveis
├── pages/         # Páginas da aplicação
├── hooks/         # Custom React hooks
├── contexts/      # React contexts
├── lib/           # Utilitários e helpers
├── integrations/  # Integrações (Supabase)
└── assets/        # Arquivos estáticos
```

## Banco de Dados

O projeto utiliza Supabase com PostgreSQL. As migrations estão em `supabase/migrations/`.

### Principais Tabelas:
- `profiles` - Perfis de usuários
- `questions` - Perguntas
- `answers` - Respostas
- `votes` - Sistema de votação
- `categories` - Categorias de matérias

## Deploy

Para fazer deploy da aplicação:

```bash
npm run build
```

Os arquivos de produção estarão em `dist/`.

Você pode hospedar em plataformas como:
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Licença

Este projeto é privado e todos os direitos são reservados.
