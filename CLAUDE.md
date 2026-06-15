# SaaS Barbearia - Engineering Rules

## 🛠 Tech Stack Core
- **Framework:** Next.js (App Router)
- **Language:** TypeScript (Strict Mode)
- **State Management:** Custom Hooks + Context API (para globais)
- **API Handling:** Services Layer (Fetch/Axios) + Strong Typing
- **Components:** UI pura em `/components`, Lógica em `/hooks`

## 🏗️ Architecture & Patterns
1. **Separation of Concerns:** 
   - Server Components para fetch de dados iniciais.
   - Client Components ("use client") apenas para interatividade.
   - Business Logic **sempre** fora do JSX (extrair para hooks ou services).
2. **Zero Any Policy:** Tipagem absoluta para Requests, Responses e States.
3. **Folders Structure:**
   - `/app`: Routes & Page Composition
   - `/components`: UI Atoms/Molecules (Stateless)
   - `/hooks`: Domain Logic & State
   - `/lib`: API client
   - `/services`: Data Adapters
   - `/types`: TypeScript Definitions
   - `/utils`: Pure Functions & Formatters

## 📋 Operational Workflow (Plan Mode)
- **Phase 1: Analysis:** Analisar o código atual e identificar "cheiros" técnicos (code smells).
- **Phase 2: Planning:** Propor a refatoração e a implementação da task do KANBAN.
- **Phase 3: Execution:** Refatorar primeiro, implementar depois.
- **Phase 4: Verification:** Checar responsividade, estados de erro/loading e tipagem.

## 🔧 Reusable Skills
- **Pattern: API Handler:** Padronizar retornos de erro e sucesso.
- **Pattern: Modal/Form:** Hooks genéricos para controle de formulários complexos.
- **Pattern: Table/List:** Componentes de listagem com estados vazios e esqueletos de carregamento.