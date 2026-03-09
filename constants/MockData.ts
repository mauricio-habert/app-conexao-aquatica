export const MOCK_ATHLETES = [
  { id: '1', name: 'Ana Silva', age: 32, mainStroke: 'Crawl' },
  { id: '2', name: 'Bruno Costa', age: 45, mainStroke: 'Costas' },
  { id: '3', name: 'Carla Mendes', age: 28, mainStroke: 'Peito' },
  { id: '4', name: 'Diego Oliveira', age: 52, mainStroke: 'Borboleta' },
  { id: '5', name: 'Elena Ferreira', age: 38, mainStroke: 'Medley' },
];

export const MOCK_RECOVERY_RESPONSES = [
  { athleteId: '1', name: 'Ana Silva', sleep: 4, soreness: 3, fatigue: 4, mood: 5, stress: 4, total: 20 },
  { athleteId: '2', name: 'Bruno Costa', sleep: 2, soreness: 2, fatigue: 1, mood: 3, stress: 2, total: 10 },
  { athleteId: '3', name: 'Carla Mendes', sleep: 5, soreness: 4, fatigue: 5, mood: 5, stress: 5, total: 24 },
  { athleteId: '5', name: 'Elena Ferreira', sleep: 3, soreness: 3, fatigue: 3, mood: 4, stress: 3, total: 16 },
];

export const MOCK_LOAD_RESPONSES = [
  { athleteId: '1', name: 'Ana Silva', rpe: 7, duration: 90, load: 630 },
  { athleteId: '3', name: 'Carla Mendes', rpe: 6, duration: 90, load: 540 },
  { athleteId: '5', name: 'Elena Ferreira', rpe: 8, duration: 90, load: 720 },
];

export const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Horário alterado sexta-feira',
    text: 'Pessoal, na sexta o treino será às 7h em vez de 6h devido à manutenção da piscina.',
    date: '2026-03-08',
    important: true,
  },
  {
    id: '2',
    title: 'Material novo',
    text: 'Chegaram as palmar novas e os snorkels. Vamos começar a usar a partir de segunda.',
    date: '2026-03-07',
    important: false,
  },
  {
    id: '3',
    title: 'Parabéns Ana!',
    text: 'A Ana bateu seu recorde pessoal nos 100m crawl ontem. Tempo: 1:02.34. Parabéns!',
    date: '2026-03-05',
    important: false,
  },
];

export const MOCK_WORKOUT_GENERAL = {
  id: '1',
  date: '2026-03-08',
  title: 'Treino de Base Aeróbia',
  duration: 90,
  content: `Aquecimento:
400m crawl solto
4x100m medley (25m de cada nado)

Parte Principal:
8x200m crawl - ritmo A2 (aeróbio)
Saída a cada 3:30
Intervalo: 15s entre séries

4x100m perna crawl com prancha
Saída a cada 2:15

Volta à calma:
200m costas solto
100m mergulho livre`,
};

export const MOCK_WORKOUT_INDIVIDUAL = {
  id: '2',
  date: '2026-03-08',
  title: 'Treino Específico - Bruno',
  athleteId: '2',
  athleteName: 'Bruno Costa',
  duration: 90,
  content: `Aquecimento:
400m costas solto
4x50m drill costas (braçada unilateral)

Parte Principal:
6x200m costas - ritmo A2
Saída a cada 3:45

4x100m costas - ritmo A3 (limiar)
Saída a cada 2:00

4x50m costas sprint
Saída a cada 1:30

Volta à calma:
200m crawl solto`,
};

export const MOCK_COMPETITIONS = [
  {
    id: '1',
    name: 'Campeonato Estadual Master',
    startDate: '2026-04-15',
    endDate: '2026-04-17',
    location: 'Parque Aquático Júlio Delamare, Rio de Janeiro',
    description: 'Campeonato estadual de natação máster. Inscrições até 01/04.',
  },
  {
    id: '2',
    name: 'Copa Regional de Inverno',
    startDate: '2026-06-20',
    endDate: '2026-06-21',
    location: 'Clube Atlético, São Paulo',
    description: 'Competição regional. Categorias: 25-29 até 55+.',
  },
  {
    id: '3',
    name: 'Troféu Primavera',
    startDate: '2026-09-12',
    endDate: '2026-09-12',
    location: 'SESC Interlagos, São Paulo',
    description: 'Evento de um dia. Provas de 50m e 100m todos os nados.',
  },
];

export function getRecoveryColor(total: number): string {
  if (total <= 10) return '#E74C3C';
  if (total <= 15) return '#F5C542';
  if (total <= 20) return '#46C696';
  return '#2D8A5F';
}

export function getRecoveryLabel(total: number): string {
  if (total <= 10) return 'Muito baixa';
  if (total <= 15) return 'Baixa';
  if (total <= 20) return 'Boa';
  return 'Excelente';
}

export function getRpeColor(rpe: number): string {
  if (rpe <= 2) return '#46C696';
  if (rpe <= 4) return '#8BC34A';
  if (rpe <= 6) return '#F5C542';
  if (rpe <= 8) return '#E87A1E';
  return '#E74C3C';
}
