# Design System - Conexão Aquática

## Referências Visuais
- **Freeletics**: dark mode, visual intenso/esportivo, cards limpos, sliders contextuais
- **Fast&Fun Swimming (Cesar Cielo)**: azul aquático, tipografia Poppins + Source Sans Pro, visual profissional
- **Estilo geral**: Esportivo/Vibrante (B) com gradientes, cards destacados, visual energético

## Paleta de Cores

### Light Mode
| Função | Cor | Hex |
|---|---|---|
| Fundo principal | Off-white | #F5F9FC |
| Fundo de cards | Branco | #FFFFFF |
| Cor primária (botões, ícones ativos) | Teal (do logo) | #1A7A7A |
| Cor de destaque/energia | Laranja (do logo) | #E87A1E |
| Texto principal | Navy escuro | #0A1929 |
| Texto secundário | Cinza | #6B7280 |
| Bordas/separadores | Cinza claro | #E5E7EB |
| Recuperação excelente | Verde escuro | #2D8A5F |
| Recuperação boa | Verde | #46C696 |
| Alerta/Recuperação baixa | Amarelo | #F5C542 |
| Perigo/Recuperação muito baixa | Vermelho | #E74C3C |

### Dark Mode (PADRÃO)
| Função | Cor | Hex |
|---|---|---|
| Fundo principal | Navy escuro | #0A1929 |
| Fundo de cards | Navy médio | #112240 |
| Cor primária (botões, ícones ativos) | Teal (do logo) | #1A7A7A |
| Cor de destaque/energia | Laranja (do logo) | #E87A1E |
| Texto principal | Branco | #FFFFFF |
| Texto secundário | Cinza claro | #9CA3AF |
| Bordas/separadores | Navy claro | #1E3A5F |
| Recuperação excelente | Verde escuro | #2D8A5F |
| Recuperação boa | Verde | #46C696 |
| Alerta/Recuperação baixa | Amarelo | #F5C542 |
| Perigo/Recuperação muito baixa | Vermelho | #E74C3C |

## Tipografia
- **Títulos/Headers**: Poppins (bold/semibold)
- **Corpo de texto**: Source Sans Pro (regular/medium)
- **Números/Dados**: Poppins (medium) - para destaque em dashboards

### Tamanhos
- H1 (título de tela): 28px, Poppins Bold
- H2 (título de seção): 22px, Poppins SemiBold
- H3 (título de card): 18px, Poppins SemiBold
- Body: 16px, Source Sans Pro Regular
- Caption: 14px, Source Sans Pro Regular
- Small: 12px, Source Sans Pro Regular

## Navegação
- **Barra inferior (bottom tabs)** com 5 abas:
  1. Home (ícone: casa) - dashboard do técnico / home do atleta
  2. Treinos (ícone: prancheta) - treino geral e individualizado
  3. Questionários (ícone: checklist) - pré e pós-treino
  4. Calendário (ícone: calendário) - competições
  5. Recados (ícone: megafone) - mural de comunicação
- Aba ativa: ícone + texto na cor teal (#1A7A7A)
- Abas inativas: ícone cinza

## Componentes

### Cards
- Cantos arredondados (border-radius: 16px)
- Sombra sutil no light mode, borda sutil no dark mode
- Cards de treino: gradiente laranja→teal no header
- Cards de recado importante: borda lateral laranja (4px)

### Botões
- Primário: fundo teal (#1A7A7A), texto branco, cantos arredondados (12px)
- Secundário: fundo transparente, borda teal, texto teal
- Destaque/CTA: fundo laranja (#E87A1E), texto branco
- Desabilitado: fundo cinza, texto cinza claro

### Questionário Pré-Treino (escala 1-5)
- 5 botões circulares em linha horizontal
- Cada botão: 48px de diâmetro (bom para toque preciso em todas as idades)
- Cores por valor:
  - 1: Vermelho (#E74C3C)
  - 2: Laranja (#E87A1E)
  - 3: Amarelo (#F5C542)
  - 4: Verde claro (#46C696)
  - 5: Verde escuro (#2D8A5F)
- Abaixo dos botões: texto descritivo que muda conforme a seleção
- Não selecionado: fundo cinza, apenas número visível

### Questionário Pós-Treino (PSE 0-10)
- Slider horizontal com marcadores de 0 a 10
- Ou 11 botões em 2 linhas (0-5 e 6-10) para facilitar toque
- Cor do slider muda gradualmente de verde (0) a vermelho (10)
- Campo de duração: input numérico com botões +/- de 5 minutos

### Splash Screen
- Fundo navy (#0A1929)
- Logo CA centralizado
- Nome "Conexão Aquática" abaixo em Poppins Bold, branco

## Iconografia
- Estilo: outline/linear (não preenchido)
- Peso: 1.5-2px
- Biblioteca sugerida: Phosphor Icons ou Feather Icons (consistentes e clean)

## Animações
- Transições entre telas: slide horizontal (300ms)
- Cards: fade-in ao carregar (200ms)
- Botões de questionário: scale up sutil ao selecionar (150ms)
- Pull-to-refresh nos murais e dashboards

## Público-Alvo e Considerações de UX
- Faixa etária: 30-50+ anos
- Botões e áreas de toque generosos (mínimo 44x44px)
- Textos legíveis (mínimo 14px)
- Contraste alto (WCAG AA no mínimo)
- Formulários rápidos (<30 segundos para completar)
- Feedback visual claro em todas as interações
