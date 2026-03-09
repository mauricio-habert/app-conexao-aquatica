# Analytics - Especificação Detalhada

## Visão Geral

O módulo de Analytics tem **duas visões**:
1. **Visão do Técnico**: dashboard com dados da equipe inteira, com drill-down por atleta
2. **Visão do Atleta**: seus próprios dados de recuperação, carga e evolução

---

## Estrutura de Telas

### Tela Principal de Analytics (Técnico)

```
[Header: "Analytics"]
[Seletor de Atleta: Todos | Ana | Bruno | Carla | ...]  (chips horizontais)
[Período: 7d | 30d | 90d | Temporada | Personalizado]   (pills horizontais)
[Abas de Métrica: Carga | ACWR | Recuperação]            (segmented control)
[Gráfico principal]
[Cards de resumo abaixo do gráfico]
```

### 1. Aba "Carga" (Training Load)

**Gráfico**: Barras diárias de carga (PSE x duração), com linha de média móvel 7 dias.

**Cards abaixo**:
- Carga total da semana (UA)
- Carga média diária (UA)
- Dia de maior carga
- Comparação com semana anterior (seta verde/vermelha + %)

**Filtros**:
- "Todos" = barras empilhadas da equipe por dia
- Atleta específico = barras simples do atleta

### 2. Aba "ACWR" (Razão Agudo:Crônico)

**O que é**: compara a carga recente (7 dias) com a carga habitual (28 dias).
- Se sobe rápido demais (>1.5) = risco de lesão
- Se cai demais (<0.8) = destreinamento
- Ideal: entre 0.8 e 1.3

**Cálculo (método EWMA - recomendado)**:
```
EWMA_hoje = Carga_hoje × lambda + (1 - lambda) × EWMA_ontem

lambda_agudo = 2 / (7 + 1) = 0.25
lambda_crônico = 2 / (28 + 1) = 0.069

ACWR = EWMA_agudo / EWMA_crônico
```

**Gráfico**: Linha do ACWR ao longo do tempo, com faixas coloridas de fundo:
- Vermelho: < 0.8 (sub-treinamento)
- Amarelo: 0.8 - 1.0 (atenção baixa)
- Verde: 0.8 - 1.3 (zona ideal)
- Amarelo: 1.3 - 1.5 (atenção alta)
- Vermelho: > 1.5 (zona de perigo)

**Cards abaixo**:
- ACWR atual de cada atleta (ou do selecionado)
- Quantos atletas em cada zona (verde/amarelo/vermelho)
- Tendência (subindo/descendo/estável)

**Nota**: precisa de mínimo 28 dias de dados para ser confiável.

### 3. Aba "Recuperação" (Wellness)

**Gráfico opção A**: Linhas múltiplas - cada dimensão (sono, dor, fadiga, humor, estresse) como uma linha separada ao longo do tempo.

**Gráfico opção B**: Heatmap de calendário - cada dia é um quadrado colorido (verde=boa recuperação, vermelho=baixa). Ótimo para ver padrões de várias semanas.

**Cards abaixo**:
- Score médio de recuperação (hoje, semana, mês)
- Dimensão mais problemática da equipe (ex: "Sono está baixo esta semana")
- Atletas com tendência de queda

**Filtros**:
- Toggle por dimensão: mostrar/esconder linhas específicas
- "Todos" = média da equipe
- Atleta específico = dados individuais

---

## Visão do Atleta (self-service)

O atleta vê apenas SEUS dados:

### Tela "Meu Desempenho"
```
[Período: 7d | 30d | 90d]
[Abas: Carga | Recuperação]
```

**Aba Carga**:
- Gráfico de barras da sua carga diária
- Carga total da semana
- Comparação com semana anterior

**Aba Recuperação**:
- Gráfico radar (spider) do dia: mostra as 5 dimensões de uma vez
- Gráfico de linhas da evolução ao longo do período
- Score médio

**O atleta NÃO vê**:
- ACWR (muito técnico, pode gerar ansiedade)
- Dados de outros atletas
- Alertas/flags

---

## Visão "Equipe por Dia" (Técnico)

Tipo planilha/heatmap:

```
              Seg  Ter  Qua  Qui  Sex
Ana           🟢   🟢   🟡   🟢   🟢
Bruno         🟡   🔴   🟡   🟡   -
Carla         🟢   🟢   🟢   🟢   🟢
Diego         -    🟡   🟡   🔴   🟡
Elena         🟢   🟢   🟢   🟡   🟢
```

Cada célula = score de recuperação do dia. Toque para ver detalhes.
Útil para ver de relance quem está consistente e quem está caindo.

---

## Alertas Automáticos (Técnico)

Na Home do técnico, destacar:
- Atleta com ACWR > 1.5 (perigo de lesão)
- Atleta com 3+ dias consecutivos de recuperação < 15/25
- Atleta que não respondeu questionário há 2+ dias
- Queda brusca de recuperação vs semana anterior

---

## Biblioteca de Gráficos

**react-native-gifted-charts** (compatível com Expo):
```
npx expo install react-native-gifted-charts react-native-svg
```
- Suporta: barras, linhas, área, radar, empilhado
- Suporta faixas coloridas de fundo (perfeito para ACWR)
- Suporta múltiplas séries de dados
- Animações e interação (toque no ponto para ver valor)

---

## Planejamento de Implementação

### No protótipo mockado (Etapa 0):
- [ ] 0.11a - Instalar gifted-charts + gerar dados mock 30 dias
- [ ] 0.11b - Tela Analytics técnico: estrutura + filtros (atleta chips + período pills)
- [ ] 0.11c - Aba Intensidade: barras diárias + média móvel + cards resumo
- [ ] 0.11d - Aba Risco de Lesão (ACWR): linha com faixas coloridas + cards de zona
- [ ] 0.11e - Aba Recuperação: linhas por dimensão + cards
- [ ] 0.11f - Heatmap da equipe por semana
- [ ] 0.11g - Tela "Meu Desempenho" (visão do atleta, sem ACWR)
- [ ] 0.11h - Botões na Home + rotas

**Linguagem na interface** (não usar jargão técnico):
- "Carga" → "Intensidade"
- "ACWR" → "Risco de Lesão"
- "UA" → "pontos"
- Faixas: "Zona ideal", "Atenção", "Risco"

### Na integração com backend (Etapa 1):
- [ ] 1.10 - Salvar respostas de questionários no Supabase com timestamps
- [ ] 1.11 - Calcular ACWR via query ou função no Supabase
- [ ] 1.12 - Conectar gráficos a dados reais
- [ ] 1.13 - Implementar alertas automáticos baseados em regras
