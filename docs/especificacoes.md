# Especificações Funcionais - Conexão Aquática

## Fase 1 - Primeira Entrega

### 1. Autenticação (Etapa 1.2)
- Dois perfis: **Técnico** e **Atleta**
- Técnico: acesso total (criar treinos, ver dados de todos, postar recados, criar competições)
- Atleta: acesso ao próprio perfil, responder questionários, ver treinos e recados, ver calendário
- Cadastro: nome, email, senha, tipo de perfil
- Recuperação de senha por email

### 2. Questionário Pré-Treino - Avaliação de Recuperação (Etapa 1.3)
**Objetivo**: avaliar como o atleta está chegando para o treino.
**Quando**: atleta preenche antes do treino.
**Perguntas (escala 1-5)**:
| Pergunta | 1 | 5 |
|---|---|---|
| Qualidade do sono | Muito ruim | Excelente |
| Dor muscular | Muita dor | Nenhuma dor |
| Nível de fadiga | Muito cansado | Muito descansado |
| Humor | Muito mal | Muito bem |
| Nível de estresse | Muito estressado | Nenhum estresse |

**Resultado**: Soma das 5 respostas (5-25 pontos).
- 5-10: Recuperação muito baixa (alerta vermelho)
- 11-15: Recuperação baixa (alerta amarelo)
- 16-20: Recuperação boa (verde)
- 21-25: Recuperação excelente (verde escuro)

**Regras**:
- Apenas 1 resposta por atleta por dia
- Técnico vê todas as respostas do dia no dashboard com alertas visuais

### 3. Questionário Pós-Treino - Controle de Intensidade (Etapa 1.4)
**Objetivo**: monitorar a intensidade de treino da equipe.
**Quando**: atleta preenche ~30 minutos após o treino.
**Campos**:
- **Nível de esforço**: escala 0-10
  - 0: Nenhum
  - 1-2: Muito leve / Leve
  - 3-4: Moderado / Moderado+
  - 5-6: Forte / Forte+
  - 7-8: Muito forte / Muito forte+
  - 9-10: Extremo / Máximo
- **Duração do treino** (em minutos): preenchido automaticamente pelo técnico ao criar o treino, ou manualmente pelo atleta

**Cálculo**: Intensidade = Esforço x Duração (em minutos)
- Exemplo: Esforço 7 x 90 min = 630 pontos
- (Nota técnica: internamente é PSE × duração = carga em UA, mas no app usamos linguagem acessível)

**Regras**:
- Apenas 1 resposta por atleta por treino
- Técnico vê tabela/dashboard com a carga de todos os atletas do dia

### 4. Mural de Recados (Etapa 1.5)
- Apenas o técnico pode criar recados
- Todos os atletas visualizam
- Ordenados por data (mais recente primeiro)
- Opção de marcar como "importante" (fixar no topo)
- Cada recado tem: título (opcional), texto, data de publicação, flag importante

### 5. Treinos (Etapa 1.6)
**Treino Geral**:
- Técnico cria o treino do dia, visível para todos os atletas
- Campos: data, título, descrição/conteúdo do treino, duração prevista (minutos)
- O conteúdo é texto livre (o técnico escreve como quiser: séries, metragens, etc.)

**Treino Individualizado**:
- Técnico cria treino específico para um ou mais atletas selecionados
- Mesmo formato do treino geral, mas vinculado ao(s) atleta(s)
- Atleta vê o treino geral + seu treino individualizado (se houver)
- Se houver treino individualizado, ele aparece destacado como "Seu treino específico"

### 6. Calendário de Competições (Etapa 1.7)
- Técnico cadastra competições
- Campos: nome da competição, data(s), local, descrição/observações
- Visualização em calendário mensal com marcadores nos dias de competição
- Ao tocar no dia, exibe detalhes da competição
- Atletas visualizam, apenas técnico cria/edita

### 7. Dashboard do Técnico (Etapa 1.8)
- Visão consolidada do dia:
  - Resumo de recuperação: quantos responderam, quantos faltam, alertas (vermelho/amarelo)
  - Intensidade do treino: tabela com esforço e pontuação de cada atleta
  - Último recado postado
  - Próxima competição
  - Acesso rápido: criar treino, criar recado

### 8. Home do Atleta (Etapa 1.8)
- Treino do dia (geral + individualizado se houver)
- Botão para responder questionário pré-treino (se ainda não respondeu)
- Botão para responder questionário pós-treino (se ainda não respondeu)
- Últimos recados
- Próxima competição
