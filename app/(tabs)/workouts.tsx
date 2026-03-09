import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';

import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/components/useColorScheme';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useMockData } from '@/constants/MockContext';
import { useAuth } from '@/constants/AuthContext';

export default function WorkoutsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { workouts, removeWorkout } = useMockData();
  const { user } = useAuth();
  const isCoach = user?.role === 'coach';

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Excluir treino?', `"${title}"`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => removeWorkout(id) },
    ]);
  };

  const generalWorkouts = workouts.filter((w) => w.type === 'general');
  const individualWorkouts = workouts.filter((w) => w.type === 'individual');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      {isCoach && (
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/new-workout')}>
          <Text style={styles.createButtonText}>+ Novo Treino</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.dateText, { color: colors.textSecondary }]}>
        {new Date().toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </Text>

      {/* General Workouts */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Treino Geral
      </Text>
      {generalWorkouts.length > 0 ? (
        generalWorkouts.map((w) => (
          <TouchableOpacity key={w.id} onLongPress={isCoach ? () => handleDelete(w.id, w.title) : undefined} activeOpacity={isCoach ? 0.8 : 1}>
          <Card style={{ backgroundColor: colors.card }}>
            <View style={styles.workoutHeader}>
              <Text style={[styles.workoutTitle, { color: colors.tint }]}>
                {w.title}
              </Text>
              <Badge label={`${w.duration} min`} color={colors.accent} />
            </View>
            <Text style={[styles.workoutContent, { color: colors.text }]}>
              {w.content}
            </Text>
          </Card>
          </TouchableOpacity>
        ))
      ) : (
        <Card style={{ backgroundColor: colors.card }}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhum treino geral cadastrado
          </Text>
        </Card>
      )}

      {/* Individual Workouts */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Treino Específico
      </Text>
      {individualWorkouts.length > 0 ? (
        individualWorkouts.map((w) => (
          <TouchableOpacity key={w.id} onLongPress={isCoach ? () => handleDelete(w.id, w.title) : undefined} activeOpacity={isCoach ? 0.8 : 1}>
          <Card
            style={[{ backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: colors.accent }]}>
            <View style={styles.workoutHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.workoutTitle, { color: colors.accent }]}>
                  {w.title}
                </Text>
                {w.athleteName && (
                  <Text style={[styles.athleteLabel, { color: colors.textSecondary }]}>
                    Atleta: {w.athleteName}
                  </Text>
                )}
              </View>
              <Badge label={`${w.duration} min`} color={colors.accent} />
            </View>
            <Text style={[styles.workoutContent, { color: colors.text }]}>
              {w.content}
            </Text>
          </Card>
          </TouchableOpacity>
        ))
      ) : (
        <Card style={{ backgroundColor: colors.card }}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhum treino específico cadastrado
          </Text>
        </Card>
      )}

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
  createButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  createButtonText: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  dateText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutTitle: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 16,
    flex: 1,
  },
  athleteLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
    marginTop: 2,
  },
  workoutContent: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 22,
  },
  emptyText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
