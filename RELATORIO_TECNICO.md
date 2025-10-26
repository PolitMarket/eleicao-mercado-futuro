# Relatório Técnico - PolitMarket

## 📋 Índice
1. [Visão Geral do Projeto](#visão-geral)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Arquitetura do Sistema](#arquitetura)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Banco de Dados](#banco-de-dados)
6. [Funcionalidades Implementadas](#funcionalidades)
7. [Sistema de Pagamentos](#pagamentos)
8. [Edge Functions](#edge-functions)
9. [Autenticação e Autorização](#autenticação)
10. [Como Continuar Desenvolvendo](#desenvolvimento)
11. [Próximos Passos Sugeridos](#próximos-passos)

---

## Visão Geral do Projeto {#visão-geral}

**PolitMarket** é uma plataforma de apostas em mercados de previsão política onde usuários podem apostar em resultados de eventos políticos usando um sistema de créditos.

### Principais Características:
- Sistema de apostas com mercados "Sim/Não" e múltiplos candidatos
- Compra de créditos via Stripe (cartão e PIX)
- Sistema de saque de créditos
- Área administrativa para gestão de mercados e apostas
- Sistema de notificações em tempo real
- Conversão automática créditos → BRL (1 crédito = R$ 0,10)

---

## 🛠️ Stack Tecnológica {#stack-tecnológica}

### Frontend
- **React 18.3.1** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router DOM 6.30.1** - Roteamento
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones
- **TanStack Query 5.83.0** - Gerenciamento de estado assíncrono
- **React Hook Form 7.61.1** - Gerenciamento de formulários
- **Zod 3.25.76** - Validação de schemas
- **Sonner** - Sistema de notificações toast

### Backend (Lovable Cloud / Supabase)
- **Supabase** - Backend as a Service
  - PostgreSQL - Banco de dados
  - Auth - Autenticação
  - Edge Functions - Serverless functions
  - Row Level Security (RLS) - Segurança de dados
- **Stripe** - Gateway de pagamentos
- **Deno** - Runtime para Edge Functions

### Integrações de Terceiros
- **Stripe API 18.5.0** - Processamento de pagamentos
- **Supabase JS 2.75.0** - Cliente Supabase

---

##  Arquitetura do Sistema {#arquitetura}

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Pages   │  │Components│  │  Hooks   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│         │              │              │                  │
│         └──────────────┴──────────────┘                 │
│                        │                                 │
│                        ▼                                 │
│              ┌──────────────────┐                       │
│              │ Supabase Client  │                       │
│              └──────────────────┘                       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Lovable Cloud/Supabase)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ PostgreSQL   │  │   Auth       │  │ Edge Functions│ │
│  │   Database   │  │   System     │  │  (Serverless) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                                    │           │
│         │                                    ▼           │
│         │                          ┌──────────────┐    │
│         └─────────────────────────▶│  Stripe API  │    │
│                                     └──────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Dados Principal:

1. **Usuário → Frontend**: Interação com interface React
2. **Frontend → Supabase Client**: Chamadas de API via cliente oficial
3. **Supabase Client → Database**: Queries com RLS automático
4. **Frontend → Edge Functions**: Operações que precisam de segurança/lógica backend
5. **Edge Functions → Stripe**: Processamento de pagamentos
6. **Edge Functions → Database**: Atualização de créditos/transações

---

##  Estrutura de Pastas {#estrutura-de-pastas}

```
politmarket/
├── public/                      # Arquivos estáticos
│   ├── favicon.png
│   └── robots.txt
│
├── src/
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ... (outros componentes UI)
│   │   ├── admin/               # Componentes da área admin
│   │   │   ├── BetsList.tsx
│   │   │   ├── CreateMarketForm.tsx
│   │   │   ├── EditBetDialog.tsx
│   │   │   ├── EditMarketDialog.tsx
│   │   │   ├── MarketsList.tsx
│   │   │   └── ResolveMarketDialog.tsx
│   │   ├── BuyCreditsDialog.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── MarketCard.tsx
│   │   ├── MarketFilters.tsx
│   │   ├── MarketGrid.tsx
│   │   ├── NotificationsDropdown.tsx
│   │   ├── SocialSharePreview.tsx
│   │   └── WithdrawDialog.tsx
│   │
│   ├── pages/                   # Páginas da aplicação
│   │   ├── Admin.tsx            # Painel administrativo
│   │   ├── Auth.tsx             # Login/Cadastro
│   │   ├── Index.tsx            # Página inicial
│   │   ├── MyBets.tsx           # Minhas apostas
│   │   ├── NotFound.tsx         # 404
│   │   └── Transactions.tsx     # Histórico de transações
│   │
│   ├── hooks/                   # Custom Hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useAdminCheck.tsx
│   │   ├── useMarkets.tsx
│   │   ├── usePaymentVerification.tsx
│   │   └── useUserBalance.tsx
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts        # Cliente Supabase (auto-gerado)
│   │       └── types.ts         # Tipos TypeScript (auto-gerado)
│   │
│   ├── lib/
│   │   └── utils.ts             # Funções utilitárias
│   │
│   ├── App.tsx                  # Componente raiz com rotas
│   ├── index.css                # Estilos globais e design tokens
│   └── main.tsx                 # Entry point da aplicação
│
├── supabase/
│   ├── functions/               # Edge Functions (Serverless)
│   │   ├── create-payment/
│   │   │   └── index.ts         # Criação de sessão de pagamento
│   │   ├── process-withdrawal/
│   │   │   └── index.ts         # Processamento de saques
│   │   └── verify-payment/
│   │       └── index.ts         # Verificação de pagamento
│   ├── migrations/              # Migrações SQL do banco
│   └── config.toml              # Configuração do Supabase
│
├── .env                         # Variáveis de ambiente (auto-gerado)
├── tailwind.config.ts           # Configuração do Tailwind
├── vite.config.ts               # Configuração do Vite
└── package.json                 # Dependências do projeto
```

### Descrição dos Diretórios Principais:

#### `src/components/`
Contém todos os componentes React reutilizáveis:
- **ui/**: Componentes base do shadcn/ui (botões, cards, dialogs, etc.)
- **admin/**: Componentes específicos da área administrativa
- Componentes de funcionalidades (Header, MarketCard, etc.)

#### `src/pages/`
Páginas principais da aplicação mapeadas nas rotas do React Router

#### `src/hooks/`
Custom hooks para lógica reutilizável:
- `useUserBalance`: Gerencia saldo do usuário
- `useAdminCheck`: Verifica se usuário é admin
- `useMarkets`: Carrega e gerencia mercados
- `usePaymentVerification`: Verifica status de pagamentos

#### `supabase/functions/`
Edge Functions (serverless) que rodam no Deno:
- Processamento de pagamentos
- Lógica de negócio sensível
- Integrações com APIs externas

---

## 🗄️ Banco de Dados {#banco-de-dados}

### Schema PostgreSQL

#### Tabela: `profiles`
Perfis dos usuários (criado automaticamente via trigger no signup)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  full_name TEXT,
  avatar_url TEXT,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos:**
- `id`: UUID do usuário (referência auth.users)
- `full_name`: Nome completo
- `balance`: Saldo em créditos
- `created_at`, `updated_at`: Timestamps

**RLS Policies:**
- Usuários podem ver e editar apenas seu próprio perfil

---

#### Tabela: `markets`
Mercados de apostas

```sql
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  market_type TEXT DEFAULT 'yes_no',
  status TEXT DEFAULT 'active',
  end_date TIMESTAMPTZ NOT NULL,
  result BOOLEAN,
  image_url TEXT,
  
  -- Volumes e percentagens
  total_volume NUMERIC DEFAULT 0,
  yes_volume NUMERIC DEFAULT 0,
  no_volume NUMERIC DEFAULT 0,
  yes_percentage INTEGER DEFAULT 50,
  candidate_1_volume NUMERIC DEFAULT 0,
  candidate_2_volume NUMERIC DEFAULT 0,
  
  -- Nomes para mercados de candidatos
  candidate_1_name TEXT,
  candidate_2_name TEXT,
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tipos de Mercado:**
- `yes_no`: Mercado Sim/Não (ex: "Fulano será eleito?")
- `candidate`: Múltiplos candidatos

**Status:**
- `active`: Ativo, aceitando apostas
- `resolved`: Resolvido, resultado definido

**RLS Policies:**
- Qualquer um pode visualizar mercados ativos
- Apenas admins podem criar/editar/deletar

---

#### Tabela: `bets`
Apostas dos usuários

```sql
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  market_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  prediction BOOLEAN NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  won BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos:**
- `prediction`: TRUE = Sim/Candidato1, FALSE = Não/Candidato2
- `resolved`: Se a aposta foi resolvida
- `won`: Se o usuário ganhou (preenchido após resolução)

**RLS Policies:**
- Usuários podem ver apenas suas próprias apostas
- Usuários podem criar apostas
- Admins podem ver/editar todas

---

#### Tabela: `transactions`
Histórico de transações financeiras

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  stripe_session_id TEXT,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tipos de Transação:**
- `deposit`: Depósito de créditos
- `withdrawal`: Saque de créditos
- `bet`: Aposta realizada
- `win`: Ganho de aposta

**RLS Policies:**
- Usuários veem apenas suas transações
- Admins veem todas

---

#### Tabela: `notifications`
Notificações do sistema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  related_id UUID,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tipos:**
- `win`: Aposta vencedora
- `loss`: Aposta perdida
- `deposit`: Depósito confirmado

**RLS Policies:**
- Usuários veem apenas suas notificações
- Sistema pode inserir notificações

---

#### Tabela: `user_roles`
Papéis/permissões dos usuários

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enum de roles
CREATE TYPE app_role AS ENUM ('user', 'admin');
```

**Roles:**
- `user`: Usuário padrão
- `admin`: Administrador do sistema

---

### Funções e Triggers PostgreSQL

#### Função: `handle_new_user()`
Trigger que cria perfil automaticamente quando usuário se cadastra

```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Primeiro usuário vira admin
  INSERT INTO user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN (SELECT COUNT(*) FROM auth.users) = 1 
      THEN 'admin'::app_role
      ELSE 'user'::app_role
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### Função: `update_market_statistics()`
Atualiza volumes e percentagens quando nova aposta é criada

```sql
CREATE FUNCTION update_market_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualiza volume total
  UPDATE markets
  SET total_volume = total_volume + NEW.amount
  WHERE id = NEW.market_id;
  
  -- Atualiza volumes sim/não e recalcula percentagens
  IF NEW.prediction = TRUE THEN
    UPDATE markets
    SET yes_volume = yes_volume + NEW.amount
    WHERE id = NEW.market_id;
  ELSE
    UPDATE markets
    SET no_volume = no_volume + NEW.amount
    WHERE id = NEW.market_id;
  END IF;
  
  -- Recalcula percentagem
  UPDATE markets
  SET yes_percentage = ROUND((yes_volume / (yes_volume + no_volume)) * 100)
  WHERE id = NEW.market_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### Função: `resolve_market()`
Resolve um mercado e distribui ganhos

```sql
CREATE FUNCTION resolve_market(_market_id UUID, _result BOOLEAN)
RETURNS VOID AS $$
DECLARE
  bet_record RECORD;
  payout_multiplier NUMERIC;
  total_payout NUMERIC;
BEGIN
  -- Atualiza status do mercado
  UPDATE markets
  SET status = 'resolved', result = _result
  WHERE id = _market_id;
  
  -- Processa todas as apostas
  FOR bet_record IN 
    SELECT * FROM bets 
    WHERE market_id = _market_id AND resolved = FALSE
  LOOP
    IF bet_record.prediction = _result THEN
      -- Calcula multiplicador baseado nas odds
      -- Retorno = valor apostado * (100 / percentagem do lado vencedor)
      
      -- Credita saldo do usuário
      UPDATE profiles
      SET balance = balance + total_payout
      WHERE id = bet_record.user_id;
      
      -- Registra transação
      INSERT INTO transactions (user_id, amount, type, description)
      VALUES (bet_record.user_id, total_payout, 'win', 'Ganhou aposta');
      
      -- Marca aposta como vencedora
      UPDATE bets
      SET resolved = TRUE, won = TRUE
      WHERE id = bet_record.id;
    ELSE
      -- Marca aposta como perdida
      UPDATE bets
      SET resolved = TRUE, won = FALSE
      WHERE id = bet_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### Função: `create_notification()`
Cria notificação para usuário

```sql
CREATE FUNCTION create_notification(
  _user_id UUID,
  _title TEXT,
  _message TEXT,
  _type TEXT,
  _related_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, related_id)
  VALUES (_user_id, _title, _message, _type, _related_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### Função: `notify_bet_result()`
Trigger que notifica usuário quando aposta é resolvida

```sql
CREATE FUNCTION notify_bet_result()
RETURNS TRIGGER AS $$
DECLARE
  market_title TEXT;
BEGIN
  SELECT title INTO market_title
  FROM markets WHERE id = NEW.market_id;
  
  IF NEW.won = TRUE THEN
    PERFORM create_notification(
      NEW.user_id,
      'Aposta Vencedora! 🎉',
      'Parabéns! Você ganhou a aposta em: ' || market_title,
      'win',
      NEW.id
    );
  ELSE
    PERFORM create_notification(
      NEW.user_id,
      'Aposta Perdida',
      'Sua aposta em "' || market_title || '" não foi vencedora.',
      'loss',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ⚙️ Funcionalidades Implementadas {#funcionalidades}

### 1. Autenticação e Usuários
- ✅ Cadastro de usuários (email/senha)
- ✅ Login e logout
- ✅ Gerenciamento de sessão
- ✅ Perfil do usuário com saldo
- ✅ Sistema de roles (user/admin)
- ✅ Primeiro usuário automaticamente vira admin

### 2. Mercados de Apostas
- ✅ Visualização de mercados ativos
- ✅ Filtros por categoria
- ✅ Dois tipos de mercado:
  - Sim/Não
  - Candidatos (múltiplos)
- ✅ Estatísticas em tempo real (volumes, percentagens)
- ✅ Imagens dos mercados
- ✅ Data de encerramento

### 3. Sistema de Apostas
- ✅ Realizar apostas em mercados
- ✅ Cálculo automático de retorno potencial
- ✅ Validação de saldo
- ✅ Atualização automática de odds
- ✅ Histórico de apostas do usuário
- ✅ Visualização de apostas ativas e resolvidas

### 4. Sistema Financeiro
- ✅ Compra de créditos via Stripe
  - Cartão de crédito
  - PIX
- ✅ Pacotes de créditos pré-definidos
- ✅ Saque de créditos
- ✅ Histórico de transações
- ✅ Conversão crédito ↔ BRL (1:0.10)
- ✅ Verificação de pagamentos

### 5. Notificações
- ✅ Sistema de notificações em tempo real
- ✅ Notificações de:
  - Apostas vencedoras
  - Apostas perdidas
  - Depósitos confirmados
- ✅ Badge com contador de não lidas
- ✅ Marcar como lido

### 6. Área Administrativa
- ✅ Painel de controle
- ✅ Criar mercados
- ✅ Editar mercados
- ✅ Resolver mercados (definir resultado)
- ✅ Visualizar todas as apostas
- ✅ Editar apostas
- ✅ Deletar apostas
- ✅ Upload de imagens para mercados

### 7. Interface do Usuário
- ✅ Design responsivo (mobile-first)
- ✅ Tema personalizado com Tailwind
- ✅ Sistema de tokens de design
- ✅ Componentes reutilizáveis (shadcn/ui)
- ✅ Toasts para feedback
- ✅ Loading states
- ✅ Error handling

---

## 💳 Sistema de Pagamentos {#pagamentos}

### Integração com Stripe

#### Produtos e Preços Configurados

O sistema possui 3 pacotes de créditos:

```typescript
const CREDIT_PACKAGES = {
  'price_1QlzvjF0l8dD3pVWTCUKbbJZ': 1000,    // R$ 100 = 1000 créditos
  'price_1QlzvkF0l8dD3pVWI0RiLl4w': 5000,    // R$ 500 = 5000 créditos
  'price_1Qlzw1F0l8dD3pVWX3dBz34D': 10000    // R$ 1000 = 10000 créditos
};
```

#### Fluxo de Compra de Créditos

1. **Usuário clica em "Comprar Créditos"**
2. **Seleciona pacote desejado**
3. **Frontend chama edge function `create-payment`**
4. **Edge function cria Checkout Session no Stripe**
   - Verifica se cliente Stripe existe (por email)
   - Cria novo cliente se não existir
   - Configura métodos de pagamento: `['card', 'pix']`
   - Define URLs de sucesso/cancelamento
5. **Usuário é redirecionado para Stripe Checkout**
6. **Preenche dados de pagamento**
   - **Cartão**: Processamento imediato
   - **PIX**: Stripe gera QR Code automaticamente
7. **Após pagamento bem-sucedido**:
   - Stripe redireciona para `/?payment=success&session_id={ID}`
8. **Frontend chama `verify-payment`**
9. **Edge function verifica status no Stripe**
10. **Se pagamento confirmado**:
    - Credita saldo do usuário
    - Cria transação no banco
    - Cria notificação
11. **Usuário vê confirmação e saldo atualizado**

#### Fluxo de Saque

1. **Usuário clica em "Sacar Créditos"**
2. **Informa valor desejado**
3. **Frontend chama edge function `process-withdrawal`**
4. **Edge function valida**:
   - Saldo suficiente
   - Valor mínimo (R$ 50)
5. **Debita saldo do perfil**
6. **Cria transação de saque**
7. **Retorna confirmação**

> **Nota**: Atualmente o saque apenas registra a transação. Para implementar saque real via Stripe, seria necessário usar Stripe Payouts/Transfers.

---

## 🔧 Edge Functions {#edge-functions}

### 1. `create-payment`

**Arquivo**: `supabase/functions/create-payment/index.ts`

**Propósito**: Criar sessão de pagamento no Stripe Checkout

**Fluxo**:
```typescript
// 1. Autenticação
const user = await supabase.auth.getUser(token);

// 2. Verifica/cria cliente Stripe
const customers = await stripe.customers.list({ email: user.email });
let customerId = customers.data[0]?.id;

// 3. Cria Checkout Session
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  customer_email: customerId ? undefined : user.email,
  line_items: [{ price: priceId, quantity: 1 }],
  mode: "payment",
  payment_method_types: ['card', 'pix'],
  success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/?payment=canceled`,
  metadata: {
    user_id: user.id,
    credits: CREDIT_PACKAGES[priceId]
  }
});

// 4. Retorna URL do checkout
return { url: session.url, sessionId: session.id };
```

**Variáveis de Ambiente Necessárias**:
- `STRIPE_SECRET_KEY`: Chave secreta do Stripe
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase

**CORS**: Habilitado para todas as origens

---

### 2. `verify-payment`

**Arquivo**: `supabase/functions/verify-payment/index.ts`

**Propósito**: Verificar se pagamento foi concluído e creditar usuário

**Fluxo**:
```typescript
// 1. Recebe session_id do Stripe
const { sessionId } = await req.json();

// 2. Busca sessão no Stripe
const session = await stripe.checkout.sessions.retrieve(sessionId);

// 3. Verifica se já foi processada
const { data: existingTransaction } = await supabase
  .from('transactions')
  .select('id')
  .eq('stripe_session_id', sessionId)
  .single();

if (existingTransaction) {
  return { alreadyProcessed: true };
}

// 4. Se pagamento aprovado
if (session.payment_status === 'paid') {
  const credits = parseInt(session.metadata.credits);
  const userId = session.metadata.user_id;
  
  // 5. Incrementa saldo
  await supabase.rpc('increment_balance', {
    user_id: userId,
    amount: credits
  });
  
  // 6. Registra transação
  await supabase.from('transactions').insert({
    user_id: userId,
    amount: credits,
    type: 'deposit',
    description: 'Compra de créditos via Stripe',
    stripe_session_id: sessionId,
    stripe_payment_id: session.payment_intent
  });
  
  // 7. Cria notificação
  await supabase.rpc('create_notification', {
    _user_id: userId,
    _title: 'Depósito Confirmado',
    _message: `Seu depósito de ${credits} créditos foi confirmado!`,
    _type: 'deposit'
  });
}

return { success: true };
```

**Importante**: Esta função usa `SUPABASE_SERVICE_ROLE_KEY` para poder inserir dados sem RLS.

---

### 3. `process-withdrawal`

**Arquivo**: `supabase/functions/process-withdrawal/index.ts`

**Propósito**: Processar saque de créditos

**Fluxo**:
```typescript
// 1. Autenticação
const user = await supabase.auth.getUser(token);

// 2. Recebe valor do saque
const { amount } = await req.json();

// 3. Validações
if (amount < 500) { // R$ 50 mínimo
  throw new Error("Valor mínimo de saque é R$ 50");
}

// 4. Busca saldo atual
const { data: profile } = await supabase
  .from('profiles')
  .select('balance')
  .eq('id', user.id)
  .single();

if (profile.balance < amount) {
  throw new Error("Saldo insuficiente");
}

// 5. Debita saldo
await supabase
  .from('profiles')
  .update({ balance: profile.balance - amount })
  .eq('id', user.id);

// 6. Registra transação
await supabase.from('transactions').insert({
  user_id: user.id,
  amount: amount,
  type: 'withdrawal',
  description: 'Saque de créditos'
});

return { success: true };
```

---

### Como Chamar Edge Functions no Frontend

```typescript
// Exemplo: Comprar créditos
const { data, error } = await supabase.functions.invoke('create-payment', {
  body: { priceId: 'price_1QlzvjF0l8dD3pVWTCUKbbJZ' }
});

if (data?.url) {
  window.open(data.url, '_blank');
}

// Exemplo: Verificar pagamento
const { data: verifyData } = await supabase.functions.invoke('verify-payment', {
  body: { sessionId: 'cs_test_...' }
});

// Exemplo: Processar saque
const { data: withdrawData } = await supabase.functions.invoke('process-withdrawal', {
  body: { amount: 1000 } // 1000 créditos = R$ 100
});
```

---

## 🔐 Autenticação e Autorização {#autenticação}

### Sistema de Autenticação (Supabase Auth)

#### Cadastro de Usuário

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'senha123',
  options: {
    data: {
      full_name: 'Nome do Usuário'
    }
  }
});
```

**O que acontece automaticamente**:
1. Usuário é criado em `auth.users`
2. Trigger `on_auth_user_created` é disparado
3. Perfil é criado em `profiles` table
4. Role é atribuída em `user_roles` (admin para primeiro, user para demais)

#### Login

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'senha123'
});
```

#### Logout

```typescript
await supabase.auth.signOut();
```

#### Verificar Sessão Atual

```typescript
const { data: { session } } = await supabase.auth.getSession();
const user = session?.user;
```

#### Listener de Mudanças de Auth

```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    if (event === 'SIGNED_IN') {
      // Usuário logou
    }
    if (event === 'SIGNED_OUT') {
      // Usuário saiu
    }
  }
);

// Cleanup
subscription.unsubscribe();
```

---

### Sistema de Autorização (Roles)

#### Verificar se Usuário é Admin

**No Frontend**:
```typescript
// Hook customizado
const { isAdmin, loading } = useAdminCheck();

// Uso
if (isAdmin) {
  // Mostrar botão admin
}
```

**Implementação do Hook**:
```typescript
// src/hooks/useAdminCheck.tsx
export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!data);
    };
    
    checkAdmin();
  }, []);
  
  return { isAdmin };
};
```

**No Banco de Dados (RLS)**:
```sql
-- Função helper
CREATE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Uso em policy
CREATE POLICY "Admins can delete markets"
ON markets FOR DELETE
USING (has_role(auth.uid(), 'admin'));
```

---

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. Exemplos:

#### Profiles
```sql
-- Ver próprio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Editar próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

#### Bets
```sql
-- Ver próprias apostas
CREATE POLICY "Users can view own bets"
ON bets FOR SELECT
USING (auth.uid() = user_id);

-- Criar apostas
CREATE POLICY "Users can insert own bets"
ON bets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admin vê tudo
CREATE POLICY "Admins can view all bets"
ON bets FOR SELECT
USING (has_role(auth.uid(), 'admin'));
```

#### Markets
```sql
-- Qualquer um vê mercados ativos
CREATE POLICY "Anyone can view active markets"
ON markets FOR SELECT
USING (status = 'active' OR auth.uid() IS NOT NULL);

-- Só admin cria/edita/deleta
CREATE POLICY "Admins can insert markets"
ON markets FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));
```

---

## 🚀 Como Continuar Desenvolvendo {#desenvolvimento}

### Configuração do Ambiente Local

#### 1. Clonar o Projeto (se no GitHub)

```bash
git clone <url-do-repositorio>
cd politmarket
```

#### 2. Instalar Dependências

```bash
npm install
# ou
bun install
```

#### 3. Configurar Variáveis de Ambiente

O arquivo `.env` é auto-gerado pelo Lovable. Contém:

```env
VITE_SUPABASE_URL=https://vldkwtxypdoyfwxiomap.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
VITE_SUPABASE_PROJECT_ID=vldkwtxypdoyfwxiomap
```

**Não edite este arquivo manualmente.**

#### 4. Rodar Localmente

```bash
npm run dev
# ou
bun dev
```

Aplicação estará em `http://localhost:5173`

---

### Estrutura de Desenvolvimento

#### Criando um Novo Componente

```bash
# Criar arquivo
touch src/components/MeuComponente.tsx
```

```tsx
// src/components/MeuComponente.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const MeuComponente = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Meu Componente</h2>
        <Button>Clique Aqui</Button>
      </CardContent>
    </Card>
  );
};
```

#### Criando uma Nova Página

```tsx
// src/pages/MinhaPage.tsx
import Header from "@/components/Header";
import { MeuComponente } from "@/components/MeuComponente";

const MinhaPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Minha Página</h1>
        <MeuComponente />
      </main>
    </div>
  );
};

export default MinhaPage;
```

**Adicionar rota**:
```tsx
// src/App.tsx
import MinhaPage from "@/pages/MinhaPage";

// Dentro do <Routes>
<Route path="/minha-page" element={<MinhaPage />} />
```

#### Criando um Custom Hook

```tsx
// src/hooks/useMeuHook.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMeuHook = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('minha_tabela')
        .select('*');
      
      if (!error) setData(data);
      setLoading(false);
    };
    
    fetchData();
  }, []);
  
  return { data, loading };
};
```

---

### Trabalhando com o Banco de Dados

#### Criar Nova Tabela (Migration)

1. **No Lovable**: Use o chat com AI para criar migrations
2. **Localmente com Supabase CLI**:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref vldkwtxypdoyfwxiomap

# Criar migration
supabase migration new create_minha_tabela

# Editar arquivo gerado em supabase/migrations/
```

**Exemplo de Migration**:
```sql
-- supabase/migrations/20240101000000_create_minha_tabela.sql

CREATE TABLE minha_tabela (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  titulo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE minha_tabela ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own records"
ON minha_tabela FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records"
ON minha_tabela FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Aplicar migration**:
```bash
supabase db push
```

#### Queries no Frontend

```typescript
// SELECT
const { data, error } = await supabase
  .from('markets')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });

// INSERT
const { data, error } = await supabase
  .from('bets')
  .insert({
    market_id: '123',
    user_id: user.id,
    amount: 100,
    prediction: true
  });

// UPDATE
const { data, error } = await supabase
  .from('profiles')
  .update({ full_name: 'Novo Nome' })
  .eq('id', user.id);

// DELETE
const { data, error } = await supabase
  .from('markets')
  .delete()
  .eq('id', '123');

// JOIN
const { data, error } = await supabase
  .from('bets')
  .select(`
    *,
    markets (
      title,
      end_date
    )
  `)
  .eq('user_id', user.id);
```

---

### Criando Edge Functions

#### 1. Criar estrutura de arquivos

```bash
mkdir -p supabase/functions/minha-funcao
touch supabase/functions/minha-funcao/index.ts
```

#### 2. Implementar a função

```typescript
// supabase/functions/minha-funcao/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Autenticar usuário
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Não autenticado");
    }

    // Lógica da função
    const { data, error } = await supabaseClient
      .from('alguma_tabela')
      .select('*');

    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
```

#### 3. Adicionar ao config.toml

```toml
# supabase/config.toml
[functions.minha-funcao]
verify_jwt = true  # false se função for pública
```

#### 4. Deploy

No Lovable, as edge functions são deployadas automaticamente.

Localmente:
```bash
supabase functions deploy minha-funcao
```

#### 5. Chamar no Frontend

```typescript
const { data, error } = await supabase.functions.invoke('minha-funcao', {
  body: { 
    parametro1: 'valor1',
    parametro2: 'valor2'
  }
});

if (error) {
  console.error('Erro:', error);
} else {
  console.log('Resposta:', data);
}
```

---

### Trabalhando com Stripe

#### Criar Novo Produto/Preço

1. **Via Stripe Dashboard**:
   - Acessar https://dashboard.stripe.com/products
   - Clicar "Add product"
   - Preencher nome, descrição, preço
   - Copiar o `price_id` gerado

2. **Via Código** (usando edge function):
```typescript
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");

const product = await stripe.products.create({
  name: "5000 Créditos",
  description: "Pacote de 5000 créditos para apostas"
});

const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 50000, // R$ 500 em centavos
  currency: "brl"
});

console.log("Price ID:", price.id);
```

#### Adicionar Novo Pacote ao Sistema

```typescript
// supabase/functions/create-payment/index.ts
const CREDIT_PACKAGES: { [key: string]: number } = {
  'price_1QlzvjF0l8dD3pVWTCUKbbJZ': 1000,
  'price_1QlzvkF0l8dD3pVWI0RiLl4w': 5000,
  'price_1Qlzw1F0l8dD3pVWX3dBz34D': 10000,
  'price_NOVO_ID_AQUI': 20000  // Novo pacote
};
```

```tsx
// src/components/BuyCreditsDialog.tsx
const creditPackages = [
  { id: 'price_1QlzvjF0l8dD3pVWTCUKbbJZ', credits: 1000, price: 100 },
  { id: 'price_1QlzvkF0l8dD3pVWI0RiLl4w', credits: 5000, price: 500 },
  { id: 'price_1Qlzw1F0l8dD3pVWX3dBz34D', credits: 10000, price: 1000 },
  { id: 'price_NOVO_ID_AQUI', credits: 20000, price: 2000 }  // Novo
];
```

---

### Estilização e Temas

#### Sistema de Tokens (Design System)

Os tokens de design estão em `src/index.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... mais tokens */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... tokens do dark mode */
  }
}
```

#### Usar Tokens em Componentes

```tsx
// ✅ CORRETO - Usar classes semânticas
<div className="bg-background text-foreground">
  <h1 className="text-primary">Título</h1>
  <Card className="bg-card border-border">
    Conteúdo
  </Card>
</div>

// ❌ ERRADO - Não usar cores diretas
<div className="bg-white text-black">
  <h1 className="text-blue-500">Título</h1>
</div>
```

#### Personalizar Tema

```css
/* src/index.css */
:root {
  --primary: 260 100% 55%;  /* Roxo primário */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 45 93% 47%;  /* Amarelo secundário */
  --secondary-foreground: 0 0% 0%;
  
  --accent: 340 82% 52%;    /* Rosa accent */
}
```

#### Criar Variante de Componente

```tsx
// src/components/ui/button.tsx (exemplo de como customizar)
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // Nova variante customizada
        success: "bg-green-500 text-white hover:bg-green-600",
        danger: "bg-red-500 text-white hover:bg-red-600"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        // Nova variante de tamanho
        xl: "h-14 px-10 text-lg"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

// Uso:
<Button variant="success" size="xl">Confirmar</Button>
```

---

### Debugging

#### Console Logs

No Lovable, você pode acessar os logs:
- Clicar no ícone de "bug" na interface
- Ver console do navegador (F12)

#### Edge Function Logs

```bash
# Localmente
supabase functions serve minha-funcao --no-verify-jwt

# Ver logs
supabase functions logs minha-funcao
```

No código:
```typescript
console.log("Checkpoint 1: usuário autenticado", user.id);
console.log("Checkpoint 2: dados recebidos", { amount, type });
```

#### React DevTools

Instalar extensão React DevTools no navegador para:
- Inspecionar componentes
- Ver props e state
- Analisar re-renders

#### Database Logs

```bash
# Localmente
supabase logs -f db

# Ver queries lentas
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

### Testes

#### Testes de Componentes (Exemplo com Vitest)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```tsx
// src/components/__tests__/MarketCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketCard } from '../MarketCard';

describe('MarketCard', () => {
  it('renders market title', () => {
    const market = {
      id: '1',
      title: 'Teste de Mercado',
      // ... outros campos
    };
    
    render(<MarketCard market={market} />);
    expect(screen.getByText('Teste de Mercado')).toBeInTheDocument();
  });
});
```

#### Testes de Edge Functions

```typescript
// supabase/functions/minha-funcao/test.ts
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";

Deno.test("Minha função retorna dados corretos", async () => {
  const response = await fetch("http://localhost:54321/functions/v1/minha-funcao", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer <token-de-teste>"
    },
    body: JSON.stringify({ teste: true })
  });
  
  const data = await response.json();
  assertEquals(data.success, true);
});
```

---

## 📈 Próximos Passos Sugeridos {#próximos-passos}

### Funcionalidades Prioritárias

#### 1. Sistema de Liquidez Automatizada (AMM)
**Objetivo**: Implementar Automated Market Maker para odds dinâmicas

**Benefícios**:
- Odds mais justas baseadas em oferta/demanda
- Liquidez sempre disponível
- Não precisa de operador manual

**Implementação**:
```sql
-- Adicionar campos à tabela markets
ALTER TABLE markets ADD COLUMN liquidity_pool NUMERIC DEFAULT 1000;
ALTER TABLE markets ADD COLUMN k_constant NUMERIC; -- x * y = k

-- Função para calcular preço baseado em AMM
CREATE FUNCTION calculate_amm_price(
  _market_id UUID,
  _prediction BOOLEAN,
  _amount NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  current_yes NUMERIC;
  current_no NUMERIC;
  k NUMERIC;
  new_amount NUMERIC;
  price NUMERIC;
BEGIN
  -- Buscar estado atual do pool
  SELECT yes_volume, no_volume, k_constant
  INTO current_yes, current_no, k
  FROM markets WHERE id = _market_id;
  
  -- Calcular novo preço baseado na curva x*y=k
  IF _prediction THEN
    new_amount := k / (current_no + _amount);
    price := current_yes - new_amount;
  ELSE
    new_amount := k / (current_yes + _amount);
    price := current_no - new_amount;
  END IF;
  
  RETURN price;
END;
$$ LANGUAGE plpgsql;
```

#### 2. Sistema de Cashout Antecipado
**Objetivo**: Permitir usuários venderem apostas antes do resultado

**Benefícios**:
- Mais engajamento
- Gerenciamento de risco para usuários
- Mais volume de transações

**Implementação**:
```typescript
// Edge function: calculate-cashout
async function calculateCashoutValue(betId: string) {
  // 1. Buscar aposta original
  const { data: bet } = await supabase
    .from('bets')
    .select('*, markets(*)')
    .eq('id', betId)
    .single();
  
  // 2. Calcular valor atual baseado em odds atuais
  const currentOdds = bet.prediction 
    ? 100 / bet.markets.yes_percentage
    : 100 / (100 - bet.markets.yes_percentage);
  
  const originalOdds = bet.prediction
    ? 100 / bet.original_yes_percentage
    : 100 / (100 - bet.original_yes_percentage);
  
  // 3. Valor de cashout = (valor apostado * odds atual) - taxa
  const cashoutValue = (bet.amount * (currentOdds / originalOdds)) * 0.95; // 5% de taxa
  
  return cashoutValue;
}
```

#### 3. Sistema de Referral/Afiliados
**Objetivo**: Crescimento orgânico via indicações

**Implementação**:
```sql
-- Tabela de códigos de referral
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  code TEXT UNIQUE NOT NULL,
  uses INTEGER DEFAULT 0,
  earnings NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de indicações
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users,
  referred_id UUID REFERENCES auth.users,
  bonus_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para dar bônus
CREATE FUNCTION give_referral_bonus()
RETURNS TRIGGER AS $$
BEGIN
  -- Dar 100 créditos para quem indicou
  UPDATE profiles
  SET balance = balance + 100
  WHERE id = NEW.referrer_id;
  
  -- Dar 50 créditos para quem foi indicado
  UPDATE profiles
  SET balance = balance + 50
  WHERE id = NEW.referred_id;
  
  -- Registrar transações
  INSERT INTO transactions (user_id, amount, type, description)
  VALUES 
    (NEW.referrer_id, 100, 'referral_bonus', 'Bônus por indicação'),
    (NEW.referred_id, 50, 'referral_bonus', 'Bônus de boas-vindas');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 4. Sistema de Rankings e Leaderboards
**Objetivo**: Gamificação e engajamento

```sql
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  total_profit NUMERIC DEFAULT 0,
  total_bets INTEGER DEFAULT 0,
  win_rate NUMERIC DEFAULT 0,
  streak INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- View para ranking
CREATE VIEW top_traders AS
SELECT 
  p.full_name,
  l.total_profit,
  l.total_bets,
  l.win_rate,
  l.streak,
  ROW_NUMBER() OVER (ORDER BY l.total_profit DESC) as rank
FROM leaderboards l
JOIN profiles p ON p.id = l.user_id
ORDER BY l.total_profit DESC
LIMIT 100;
```

#### 5. Notificações Push (Web Push)
**Objetivo**: Re-engajamento via notificações

```typescript
// Service Worker para Push Notifications
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/favicon.png',
    badge: '/badge.png',
    data: {
      url: data.url
    }
  });
});

// Frontend: Solicitar permissão
const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    // Registrar service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    // Enviar token para backend
    // ... implementação
  }
};
```

#### 6. Sistema de Mercados de Criação Comunitária
**Objetivo**: Usuários podem propor mercados

```sql
CREATE TABLE market_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposed_by UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE market_votes (
  user_id UUID REFERENCES auth.users,
  proposal_id UUID REFERENCES market_proposals,
  vote INTEGER, -- 1 = upvote, -1 = downvote
  PRIMARY KEY (user_id, proposal_id)
);
```

#### 7. Analytics Dashboard
**Objetivo**: Métricas para admins

```typescript
// Componente AdminDashboard
const AdminDashboard = () => {
  const metrics = {
    totalUsers: 0,
    activeUsers: 0,
    totalVolume: 0,
    totalRevenue: 0,
    avgBetSize: 0,
    conversionRate: 0
  };
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard 
        title="Usuários Ativos (7d)"
        value={metrics.activeUsers}
        trend="+15%"
      />
      <MetricCard 
        title="Volume Total"
        value={`R$ ${metrics.totalVolume}`}
        trend="+23%"
      />
      {/* ... mais métricas */}
    </div>
  );
};
```

#### 8. Sistema de Chat/Comentários em Mercados
**Objetivo**: Engajamento e discussão

```sql
CREATE TABLE market_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES markets,
  user_id UUID REFERENCES auth.users,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime subscription
ALTER PUBLICATION supabase_realtime ADD TABLE market_comments;
```

```typescript
// Frontend: Escutar comentários em tempo real
supabase
  .channel(`market-${marketId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'market_comments',
    filter: `market_id=eq.${marketId}`
  }, (payload) => {
    setComments(prev => [...prev, payload.new]);
  })
  .subscribe();
```

---

### Melhorias Técnicas

#### 1. Otimização de Performance
- Implementar React Query para cache de dados
- Lazy loading de componentes
- Otimização de imagens (WebP, lazy load)
- Code splitting por rota

#### 2. Segurança
- Rate limiting nas edge functions
- Validação rigorosa de inputs
- Auditoria de RLS policies
- Implementar CAPTCHA no cadastro

#### 3. Testes
- Testes unitários com Vitest
- Testes E2E com Playwright
- Testes de integração para edge functions

#### 4. Monitoramento
- Integrar Sentry para error tracking
- Analytics com Google Analytics/Plausible
- Monitoring de performance (Web Vitals)

#### 5. CI/CD
- GitHub Actions para testes automáticos
- Deploy automático ao fazer merge na main
- Preview deploys para PRs

---

### Recursos Úteis

#### Documentação Oficial
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs
- **shadcn/ui**: https://ui.shadcn.com

#### Comunidades
- Discord do Lovable
- Supabase Discord
- Stack Overflow
- Reddit r/react, r/typescript

#### Cursos e Tutoriais
- Supabase YouTube Channel
- Fireship (YouTube) - Quick tutorials
- Web Dev Simplified (YouTube)

---

## 📝 Notas Finais

### Estrutura de Commits Recomendada

```bash
# Feat: Nova funcionalidade
git commit -m "feat: adiciona sistema de cashout antecipado"

# Fix: Correção de bug
git commit -m "fix: corrige cálculo de odds em mercados de candidatos"

# Refactor: Refatoração de código
git commit -m "refactor: extrai lógica de apostas para hook customizado"

# Style: Mudanças de estilo
git commit -m "style: atualiza tema para roxo primário"

# Docs: Documentação
git commit -m "docs: adiciona comentários em funções de cálculo"

# Test: Testes
git commit -m "test: adiciona testes para componente MarketCard"
```

### Boas Práticas

1. **Sempre testar localmente antes de deploy**
2. **Fazer backup do banco antes de migrations grandes**
3. **Usar TypeScript para evitar erros em runtime**
4. **Comentar código complexo**
5. **Manter componentes pequenos e focados**
6. **Usar custom hooks para lógica reutilizável**
7. **Sempre habilitar RLS em novas tabelas**
8. **Validar inputs no frontend E backend**
9. **Fazer code review antes de merge**
10. **Monitorar logs de edge functions em produção**

### Contatos Úteis

- **Suporte Lovable**: Via chat na plataforma
- **Supabase Support**: https://supabase.com/support
- **Stripe Support**: https://support.stripe.com

---

## 🎓 Conclusão

Este documento fornece uma base sólida para continuar o desenvolvimento do PolitMarket. O projeto está bem estruturado com:

- ✅ Arquitetura moderna e escalável
- ✅ Sistema de autenticação robusto
- ✅ Banco de dados bem modelado
- ✅ Pagamentos funcionando (PIX + Cartão)
- ✅ Interface responsiva e moderna

**Próximos passos imediatos sugeridos**:
1. Implementar sistema de cashout
2. Adicionar mais categorias de mercados
3. Melhorar UX do mobile
4. Implementar sistema de referral
5. Adicionar analytics básico

**Lembre-se**: 
- Desenvolver incrementalmente
- Testar cada funcionalidade
- Manter código limpo e documentado
- Focar na experiência do usuário
- Monitorar métricas de negócio

Boa sorte no desenvolvimento! 🚀

---

**Versão do Documento**: 1.0  
**Data**: Janeiro 2025  
**Autor**: Equipe da PolitMarket
