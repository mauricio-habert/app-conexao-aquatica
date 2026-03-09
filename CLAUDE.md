# Conexão Aquática - App Mobile

## Sobre o Projeto
App mobile para técnico de natação gerenciar sua equipe.
Cliente: colega do Maurício que é técnico de natação.
Objetivo: publicar na Play Store (Android) e App Store (iOS).

## Stack Tecnológica
- **Frontend**: React Native com Expo (SDK 54)
- **Backend**: Supabase (PostgreSQL) - ainda não integrado
- **Linguagem**: TypeScript
- **Navegação**: Expo Router v7 (file-based routing)
- **Estado mock**: React Context (constants/MockContext.tsx)

## Identidade Visual
- **Cores do logo**: Laranja (#E87A1E) e Teal/Verde-azulado (#1A7A7A)
- **Logo**: C (laranja) + A (teal) = "CA" - arquivos em /img/
- **Estilo**: Esportivo/Vibrante (inspirado no Freeletics)
- **Dark mode como padrão**, light mode disponível
- **Tipografia**: Poppins (títulos) + Source Sans 3 (corpo)
- **Navegação**: barra inferior com 5 tabs (Home, Treinos, Avaliação, Calendário, Recados)
- **Slogan**: "Nade leve." (filosofia do técnico Daniel: técnica > volume, menos é mais)
- **Design system completo**: docs/design-system.md

## Estrutura do Projeto
```
app/
  _layout.tsx              # Layout raiz (fontes, tema, MockProvider)
  +not-found.tsx
  welcome.tsx              # Splash animada (logo + gradiente → redireciona para login)
  login.tsx                # Login mockado (email/senha + perfil técnico/atleta)
  analytics.tsx            # Analytics do técnico (Intensidade/Risco de Lesão/Recuperação)
  my-performance.tsx       # "Meu Desempenho" do atleta (sem ACWR, sem dados de outros)
  new-announcement.tsx     # Modal: criar recado
  new-workout.tsx          # Modal: criar treino (geral/individual)
  new-competition.tsx      # Modal: criar competição
  (tabs)/
    _layout.tsx            # 5 tabs com SafeArea
    index.tsx              # Home: visão técnico (dashboard) ou atleta (treino+ações)
    workouts.tsx           # Treinos geral + individualizado
    questionnaires.tsx     # Pré-treino (1-5) e Pós-treino (esforço 0-10). Técnico pode add/remover perguntas
    calendar.tsx           # Calendário mensal + lista competições
    announcements.tsx      # Mural de recados
components/
  Card.tsx                 # Card reutilizável
  Badge.tsx                # Badge colorido
  Themed.tsx               # Text/View com suporte dark/light
  useColorScheme.ts        # Hook que retorna 'light' | 'dark'
constants/
  Colors.ts                # Paleta completa (dark + light)
  Fonts.ts                 # Mapeamento das fontes
  MockData.ts              # Dados fictícios + helpers de cor/label
  MockContext.tsx           # Estado global mock (add/remove items, perguntas editáveis)
  MockAnalytics.ts         # Dados mock de 30 dias (carga + recuperação por atleta)
  AuthContext.tsx           # Autenticação mockada (email/senha, perfil coach/athlete, switchRole)
```

## Fases de Entrega

### Fase 1 - Primeira Entrega (ATUAL)

#### ETAPA 0 - Protótipo Frontend (mockado, sem backend) ← ESTAMOS AQUI
Objetivo: validar telas com o técnico antes de desenvolver backend.
Dados fictícios via MockContext. Técnico testa no celular via Expo Go.

- [x] 0.1 - Setup: projeto Expo + navegação + tema visual
- [x] 0.2 - Splash screen + tela de login (mockada, sem auth real)
- [x] 0.3 - Home do atleta (visão diferente da do técnico)
- [x] 0.4 - Home do técnico / dashboard (logo, recuperação, carga, recados, competição)
- [x] 0.5 - Questionário pré-treino (5 perguntas, botões circulares coloridos 1-5)
- [x] 0.6 - Questionário pós-treino (esforço 0-10 + duração com +/- + cálculo de intensidade)
- [x] 0.7 - Mural de recados (listagem + criação + exclusão por long press)
- [x] 0.8 - Treinos geral + individualizado (listagem + criação + exclusão por long press)
- [x] 0.9 - Calendário de competições (mensal + listagem + criação + exclusão por long press)
- [x] 0.11a - Instalar gifted-charts + gerar dados mock 30 dias (MockAnalytics.ts)
- [x] 0.11b - Tela Analytics técnico: estrutura + filtros (atleta chips + período pills)
- [x] 0.11c - Aba Intensidade: barras diárias + cards resumo
- [x] 0.11d - Aba Risco de Lesão: linha ACWR com faixas coloridas + cards de zona
- [x] 0.11e - Aba Recuperação: linhas por dimensão + cards
- [x] 0.11f - Heatmap da equipe por semana (dentro de analytics)
- [x] 0.11g - Tela "Meu Desempenho" (visão do atleta, sem ACWR/dados de outros)
- [x] 0.11h - Botões na Home (técnico: "Ver Analytics", atleta: "Meu Desempenho") + rotas
- [ ] 0.10 - Revisão com o técnico → coletar feedback → ajustes

#### ETAPA 1 - Backend e Integração
Após aprovação do técnico, conectar tudo ao Supabase.

- [ ] 1.1 - Configurar Supabase (banco, auth, tabelas)
- [ ] 1.2 - Autenticação real (login, cadastro, perfis técnico vs atleta)
- [ ] 1.3 - Integrar questionário pré-treino com banco
- [ ] 1.4 - Integrar questionário pós-treino com banco
- [ ] 1.5 - Integrar mural de recados com banco
- [ ] 1.6 - Integrar treinos com banco
- [ ] 1.7 - Integrar calendário de competições com banco
- [ ] 1.8 - Dashboard real com dados do banco
- [ ] 1.9 - Testes gerais, ajustes de UX, polimento
- [ ] 1.10 - Analytics: conectar gráficos a dados reais do Supabase
- [ ] 1.11 - Analytics: cálculo de ACWR (método EWMA)
- [ ] 1.12 - Analytics: alertas automáticos (ACWR perigoso, recuperação baixa)

### Fases futuras (a definir com o técnico)
- Analytics (gráficos de carga agudo:crônico, tendências, alertas de lesão)
- Recordes pessoais
- Histórico de treinos
- Publicação nas stores (Google Play / App Store)

## Repositório
- GitHub: mauricio-habert/app-conexao-aquatica
- Branch principal: master

## Convenções
- Interface em português (PT-BR)
- Código e comentários em inglês
- Commits em português
- **Linguagem acessível**: público-alvo são nadadores amadores (30-50+ anos). Evitar jargão técnico na interface:
  - "PSE" → "Nível de esforço" ou "Esforço"
  - "UA" (unidades arbitrárias) → "pontos"
  - "Carga de treino" → "Intensidade do treino"
  - Termos técnicos (ACWR, EWMA) ficam apenas na documentação interna, nunca na interface

## Problemas Conhecidos
- Expo Go SDK 55 incompatível com versão da Play Store → rebaixado para SDK 54
- Cores hex do logo são estimativas visuais, não extraídas com precisão

## Documentação Detalhada
- Especificações de funcionalidades: docs/especificacoes.md
- Referências de mercado: docs/referencias.md
- Design system: docs/design-system.md
- Analytics (gráficos, ACWR, filtros): docs/analytics.md
