import { MOCK_ATHLETES } from './MockData';

// --- Types ---

export type DailyLoad = {
  date: string;
  athleteId: string;
  rpe: number;
  duration: number;
  load: number;
};

export type DailyRecovery = {
  date: string;
  athleteId: string;
  sleep: number;
  soreness: number;
  fatigue: number;
  mood: number;
  stress: number;
  total: number;
};

export type AcwrPoint = {
  date: string;
  athleteId: string;
  acwr: number;
  ewmaAcute: number;
  ewmaChronic: number;
};

// --- Helpers ---

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Seeded pseudo-random for consistent mock data
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// --- Generate 30 days of data per athlete ---

const DAYS = 35; // 35 days to have enough for ACWR (needs 28+)
const rand = seededRandom(42);

function generateAthleteLoads(athleteId: string, baseRpe: number): DailyLoad[] {
  const loads: DailyLoad[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    // Skip some sundays (rest day ~70% chance)
    const date = new Date();
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 && rand() < 0.7) continue;

    const rpe = clamp(Math.round(baseRpe + (rand() - 0.5) * 4), 1, 10);
    const duration = [60, 75, 90, 90, 90, 105, 120][Math.floor(rand() * 7)];
    loads.push({
      date: dateStr(i),
      athleteId,
      rpe,
      duration,
      load: rpe * duration,
    });
  }
  return loads;
}

function generateAthleteRecovery(athleteId: string, baseScore: number): DailyRecovery[] {
  const recoveries: DailyRecovery[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const vary = () => clamp(Math.round(baseScore + (rand() - 0.5) * 2.5), 1, 5);
    const sleep = vary();
    const soreness = vary();
    const fatigue = vary();
    const mood = vary();
    const stress = vary();
    recoveries.push({
      date: dateStr(i),
      athleteId,
      sleep,
      soreness,
      fatigue,
      mood,
      stress,
      total: sleep + soreness + fatigue + mood + stress,
    });
  }
  return recoveries;
}

// Each athlete has a different baseline
const ATHLETE_PROFILES: Record<string, { baseRpe: number; baseRecovery: number }> = {
  '1': { baseRpe: 6, baseRecovery: 4 },   // Ana - consistent
  '2': { baseRpe: 7, baseRecovery: 2.5 },  // Bruno - pushes hard, recovers poorly
  '3': { baseRpe: 5, baseRecovery: 4.5 },  // Carla - moderate, great recovery
  '4': { baseRpe: 6, baseRecovery: 3 },    // Diego - inconsistent
  '5': { baseRpe: 7, baseRecovery: 3.5 },  // Elena - high intensity
};

// --- Export generated data ---

export const MOCK_DAILY_LOADS: DailyLoad[] = MOCK_ATHLETES.flatMap((a) => {
  const profile = ATHLETE_PROFILES[a.id] || { baseRpe: 6, baseRecovery: 3.5 };
  return generateAthleteLoads(a.id, profile.baseRpe);
});

export const MOCK_DAILY_RECOVERY: DailyRecovery[] = MOCK_ATHLETES.flatMap((a) => {
  const profile = ATHLETE_PROFILES[a.id] || { baseRpe: 6, baseRecovery: 3.5 };
  return generateAthleteRecovery(a.id, profile.baseRecovery);
});

// --- ACWR Calculation (EWMA method) ---

const LAMBDA_ACUTE = 2 / (7 + 1);   // 0.25
const LAMBDA_CHRONIC = 2 / (28 + 1); // ~0.069

export function calculateAcwr(athleteId: string): AcwrPoint[] {
  const loads = MOCK_DAILY_LOADS
    .filter((l) => l.athleteId === athleteId)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (loads.length === 0) return [];

  const points: AcwrPoint[] = [];
  let ewmaAcute = loads[0].load;
  let ewmaChronic = loads[0].load;

  // Build a map of date -> load for filling gaps
  const loadMap = new Map<string, number>();
  loads.forEach((l) => loadMap.set(l.date, l.load));

  // Get all dates from first to last
  const firstDate = new Date(loads[0].date);
  const lastDate = new Date(loads[loads.length - 1].date);
  const allDates: string[] = [];
  for (let d = new Date(firstDate); d <= lastDate; d.setDate(d.getDate() + 1)) {
    allDates.push(d.toISOString().split('T')[0]);
  }

  allDates.forEach((date, i) => {
    const dayLoad = loadMap.get(date) || 0; // rest day = 0

    if (i === 0) {
      ewmaAcute = dayLoad;
      ewmaChronic = dayLoad;
    } else {
      ewmaAcute = dayLoad * LAMBDA_ACUTE + (1 - LAMBDA_ACUTE) * ewmaAcute;
      ewmaChronic = dayLoad * LAMBDA_CHRONIC + (1 - LAMBDA_CHRONIC) * ewmaChronic;
    }

    const acwr = ewmaChronic > 0 ? ewmaAcute / ewmaChronic : 1;

    points.push({
      date,
      athleteId,
      acwr: Math.round(acwr * 100) / 100,
      ewmaAcute: Math.round(ewmaAcute),
      ewmaChronic: Math.round(ewmaChronic),
    });
  });

  return points;
}

// Pre-calculate ACWR for all athletes
export const MOCK_ACWR: AcwrPoint[] = MOCK_ATHLETES.flatMap((a) => calculateAcwr(a.id));

// --- Helper functions for analytics ---

export function getAcwrZone(acwr: number): { label: string; color: string } {
  if (acwr < 0.8) return { label: 'Sub-treinamento', color: '#3B82F6' };
  if (acwr <= 1.3) return { label: 'Zona ideal', color: '#46C696' };
  if (acwr <= 1.5) return { label: 'Atenção', color: '#F5C542' };
  return { label: 'Risco', color: '#E74C3C' };
}

export function filterByPeriod<T extends { date: string }>(data: T[], days: number): T[] {
  const cutoff = dateStr(days);
  return data.filter((d) => d.date >= cutoff);
}

export function filterByDateRange<T extends { date: string }>(data: T[], startDate: string, endDate: string): T[] {
  return data.filter((d) => d.date >= startDate && d.date <= endDate);
}

export function filterByAthlete<T extends { athleteId: string }>(data: T[], athleteId: string | null): T[] {
  if (!athleteId) return data;
  return data.filter((d) => d.athleteId === athleteId);
}

// Get unique dates sorted
export function getUniqueDates(data: { date: string }[]): string[] {
  return [...new Set(data.map((d) => d.date))].sort();
}

// Sum loads per date (for "all athletes" view)
export function sumLoadsByDate(loads: DailyLoad[]): { date: string; load: number }[] {
  const map = new Map<string, number>();
  loads.forEach((l) => {
    map.set(l.date, (map.get(l.date) || 0) + l.load);
  });
  return [...map.entries()]
    .map(([date, load]) => ({ date, load }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Average recovery per date (for "all athletes" view)
export function avgRecoveryByDate(recoveries: DailyRecovery[]): { date: string; avg: number }[] {
  const map = new Map<string, number[]>();
  recoveries.forEach((r) => {
    if (!map.has(r.date)) map.set(r.date, []);
    map.get(r.date)!.push(r.total);
  });
  return [...map.entries()]
    .map(([date, totals]) => ({
      date,
      avg: Math.round((totals.reduce((s, v) => s + v, 0) / totals.length) * 10) / 10,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Moving average (7-day window)
export function movingAverage(values: number[], window: number = 7): (number | null)[] {
  return values.map((_, i) => {
    if (i < window - 1) return null;
    const slice = values.slice(i - window + 1, i + 1);
    return Math.round(slice.reduce((s, v) => s + v, 0) / window);
  });
}
