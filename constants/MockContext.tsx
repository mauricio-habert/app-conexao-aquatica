import { createContext, useContext, useState, ReactNode } from 'react';
import {
  MOCK_ANNOUNCEMENTS,
  MOCK_WORKOUT_GENERAL,
  MOCK_WORKOUT_INDIVIDUAL,
  MOCK_COMPETITIONS,
} from './MockData';

type Announcement = {
  id: string;
  title: string;
  text: string;
  date: string;
  important: boolean;
};

type Workout = {
  id: string;
  date: string;
  title: string;
  duration: number;
  content: string;
  type: 'general' | 'individual';
  athleteId?: string;
  athleteName?: string;
};

type Competition = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
};

export type Question = {
  id: string;
  label: string;
  low: string;
  high: string;
};

const DEFAULT_PRE_QUESTIONS: Question[] = [
  { id: 'sleep', label: 'Qualidade do sono', low: 'Muito ruim', high: 'Excelente' },
  { id: 'soreness', label: 'Dor muscular', low: 'Muita dor', high: 'Nenhuma dor' },
  { id: 'fatigue', label: 'Nível de fadiga', low: 'Muito cansado', high: 'Descansado' },
  { id: 'mood', label: 'Humor', low: 'Muito mal', high: 'Muito bem' },
  { id: 'stress', label: 'Nível de estresse', low: 'Muito estressado', high: 'Nenhum' },
];

const DEFAULT_POST_QUESTIONS: Question[] = [];

type MockState = {
  announcements: Announcement[];
  workouts: Workout[];
  competitions: Competition[];
  preQuestions: Question[];
  postQuestions: Question[];
  addAnnouncement: (a: Omit<Announcement, 'id'>) => void;
  addWorkout: (w: Omit<Workout, 'id'>) => void;
  addCompetition: (c: Omit<Competition, 'id'>) => void;
  removeAnnouncement: (id: string) => void;
  removeWorkout: (id: string) => void;
  removeCompetition: (id: string) => void;
  addPreQuestion: (q: Omit<Question, 'id'>) => void;
  removePreQuestion: (id: string) => void;
  addPostQuestion: (q: Omit<Question, 'id'>) => void;
  removePostQuestion: (id: string) => void;
};

const MockContext = createContext<MockState>({} as MockState);

export function MockProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [workouts, setWorkouts] = useState<Workout[]>([
    { ...MOCK_WORKOUT_GENERAL, type: 'general' },
    { ...MOCK_WORKOUT_INDIVIDUAL, type: 'individual' },
  ]);
  const [competitions, setCompetitions] = useState<Competition[]>(MOCK_COMPETITIONS);
  const [preQuestions, setPreQuestions] = useState<Question[]>(DEFAULT_PRE_QUESTIONS);
  const [postQuestions, setPostQuestions] = useState<Question[]>(DEFAULT_POST_QUESTIONS);

  const addAnnouncement = (a: Omit<Announcement, 'id'>) => {
    setAnnouncements((prev) => [{ ...a, id: String(Date.now()) }, ...prev]);
  };

  const addWorkout = (w: Omit<Workout, 'id'>) => {
    setWorkouts((prev) => [{ ...w, id: String(Date.now()) }, ...prev]);
  };

  const addCompetition = (c: Omit<Competition, 'id'>) => {
    setCompetitions((prev) => [...prev, { ...c, id: String(Date.now()) }]);
  };

  const removeAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const removeWorkout = (id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  const removeCompetition = (id: string) => {
    setCompetitions((prev) => prev.filter((c) => c.id !== id));
  };

  const addPreQuestion = (q: Omit<Question, 'id'>) => {
    setPreQuestions((prev) => [...prev, { ...q, id: String(Date.now()) }]);
  };

  const removePreQuestion = (id: string) => {
    setPreQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addPostQuestion = (q: Omit<Question, 'id'>) => {
    setPostQuestions((prev) => [...prev, { ...q, id: String(Date.now()) }]);
  };

  const removePostQuestion = (id: string) => {
    setPostQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <MockContext.Provider
      value={{
        announcements, workouts, competitions,
        preQuestions, postQuestions,
        addAnnouncement, addWorkout, addCompetition,
        removeAnnouncement, removeWorkout, removeCompetition,
        addPreQuestion, removePreQuestion,
        addPostQuestion, removePostQuestion,
      }}>
      {children}
    </MockContext.Provider>
  );
}

export const useMockData = () => useContext(MockContext);
