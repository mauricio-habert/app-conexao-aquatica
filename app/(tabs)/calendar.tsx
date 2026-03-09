import { useState } from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';

import { router } from 'expo-router';

import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/components/useColorScheme';
import { Card } from '@/components/Card';
import { useMockData } from '@/constants/MockContext';
import { useAuth } from '@/constants/AuthContext';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const { competitions, removeCompetition } = useMockData();
  const { user } = useAuth();
  const isCoach = user?.role === 'coach';

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Excluir competição?', `"${name}"`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => removeCompetition(id) },
    ]);
  };

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const competitionDates = new Set<string>();
  competitions.forEach((c) => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      competitionDates.add(d.toISOString().split('T')[0]);
    }
  });

  const selectedCompetition = selectedDate
    ? competitions.find((c) => {
        const start = new Date(c.startDate);
        const end = new Date(c.endDate);
        const sel = new Date(selectedDate);
        return sel >= start && sel <= end;
      })
    : null;

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => navigateMonth(-1)}>
          <Text style={[styles.navArrow, { color: colors.tint }]}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {MONTHS[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity onPress={() => navigateMonth(1)}>
          <Text style={[styles.navArrow, { color: colors.tint }]}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekCell}>
            <Text style={[styles.weekText, { color: colors.textSecondary }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {days.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasCompetition = competitionDates.has(dateStr);
          const isSelected = selectedDate === dateStr;

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayCell,
                isSelected && { backgroundColor: colors.tint, borderRadius: 20 },
              ]}
              onPress={() => setSelectedDate(dateStr)}>
              <Text
                style={[
                  styles.dayText,
                  { color: isSelected ? '#FFFFFF' : colors.text },
                ]}>
                {day}
              </Text>
              {hasCompetition && !isSelected && (
                <View style={[styles.competitionDot, { backgroundColor: colors.accent }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Competition Details */}
      {selectedCompetition ? (
        <Card style={{ backgroundColor: colors.card, marginTop: 20 }}>
          <Text style={[styles.compName, { color: colors.tint }]}>
            {selectedCompetition.name}
          </Text>
          <Text style={[styles.compDetail, { color: colors.text }]}>
            {new Date(selectedCompetition.startDate).toLocaleDateString('pt-BR')}
            {selectedCompetition.endDate !== selectedCompetition.startDate &&
              ` a ${new Date(selectedCompetition.endDate).toLocaleDateString('pt-BR')}`}
          </Text>
          <Text style={[styles.compDetail, { color: colors.textSecondary }]}>
            {selectedCompetition.location}
          </Text>
          <Text style={[styles.compDescription, { color: colors.text }]}>
            {selectedCompetition.description}
          </Text>
        </Card>
      ) : selectedDate ? (
        <Card style={{ backgroundColor: colors.card, marginTop: 20 }}>
          <Text style={[styles.noEvent, { color: colors.textSecondary }]}>
            Nenhuma competição nesta data
          </Text>
        </Card>
      ) : null}

      {/* Add Competition Button */}
      {isCoach && (
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/new-competition')}>
          <Text style={styles.createButtonText}>+ Nova Competição</Text>
        </TouchableOpacity>
      )}

      {/* Upcoming Competitions List */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Próximas Competições
      </Text>
      {competitions.map((comp) => (
        <TouchableOpacity key={comp.id} onLongPress={isCoach ? () => handleDelete(comp.id, comp.name) : undefined} activeOpacity={isCoach ? 0.8 : 1}>
        <Card style={{ backgroundColor: colors.card }}>
          <Text style={[styles.compName, { color: colors.tint }]}>{comp.name}</Text>
          <Text style={[styles.compDetail, { color: colors.text }]}>
            {new Date(comp.startDate).toLocaleDateString('pt-BR')}
            {comp.endDate !== comp.startDate &&
              ` a ${new Date(comp.endDate).toLocaleDateString('pt-BR')}`}
          </Text>
          <Text style={[styles.compDetail, { color: colors.textSecondary }]}>
            {comp.location}
          </Text>
        </Card>
        </TouchableOpacity>
      ))}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 20,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navArrow: {
    fontFamily: Fonts.titleBold,
    fontSize: 24,
    paddingHorizontal: 16,
  },
  monthTitle: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 18,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
  },
  competitionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
  },
  compName: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 16,
  },
  compDetail: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    marginTop: 4,
  },
  compDescription: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  noEvent: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
  createButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
