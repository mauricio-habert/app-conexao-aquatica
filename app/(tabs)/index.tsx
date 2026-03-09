import { StyleSheet, ScrollView, Text, View, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/components/useColorScheme';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useAuth } from '@/constants/AuthContext';
import { useMockData } from '@/constants/MockContext';
import {
  MOCK_RECOVERY_RESPONSES,
  MOCK_LOAD_RESPONSES,
  MOCK_COMPETITIONS,
  MOCK_ATHLETES,
  MOCK_WORKOUT_GENERAL,
  MOCK_WORKOUT_INDIVIDUAL,
  getRecoveryColor,
  getRecoveryLabel,
} from '@/constants/MockData';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user, logout } = useAuth();
  const { announcements } = useMockData();
  const isCoach = user?.role === 'coach';

  const nextCompetition = MOCK_COMPETITIONS[0];
  const latestAnnouncement = announcements[0];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      {/* Header */}
      <LinearGradient
        colors={isCoach ? ['#1A7A7A', '#E87A1E'] : ['#E87A1E', '#1A7A7A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <Image
            source={require('../../img/logo_instagram_sem_fundo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Conexão Aquática</Text>
            <Text style={styles.headerSubtitle}>
              Olá, {user?.name || 'Usuário'}!
            </Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {isCoach ? <CoachHome colors={colors} /> : <AthleteHome colors={colors} />}

      {/* Latest Announcement */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Último Recado
      </Text>
      {latestAnnouncement ? (
        <Card style={{ backgroundColor: colors.card }}>
          {latestAnnouncement.important && (
            <Badge label="Importante" color={colors.danger} />
          )}
          <Text style={[styles.announcementTitle, { color: colors.text }]}>
            {latestAnnouncement.title}
          </Text>
          <Text style={[styles.announcementText, { color: colors.textSecondary }]}>
            {latestAnnouncement.text}
          </Text>
        </Card>
      ) : (
        <Card style={{ backgroundColor: colors.card }}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhum recado ainda
          </Text>
        </Card>
      )}

      {/* Next Competition */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Próxima Competição
      </Text>
      <Card style={{ backgroundColor: colors.card }}>
        <Text style={[styles.competitionName, { color: colors.tint }]}>
          {nextCompetition.name}
        </Text>
        <Text style={[styles.competitionDetail, { color: colors.text }]}>
          {new Date(nextCompetition.startDate).toLocaleDateString('pt-BR')}
          {nextCompetition.endDate !== nextCompetition.startDate &&
            ` a ${new Date(nextCompetition.endDate).toLocaleDateString('pt-BR')}`}
        </Text>
        <Text style={[styles.competitionDetail, { color: colors.textSecondary }]}>
          {nextCompetition.location}
        </Text>
      </Card>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

/* ── Coach-specific content ── */
function CoachHome({ colors }: { colors: typeof Colors.dark }) {
  const respondedCount = MOCK_RECOVERY_RESPONSES.length;
  const totalCount = MOCK_ATHLETES.length;
  const pendingCount = totalCount - respondedCount;
  const alerts = MOCK_RECOVERY_RESPONSES.filter((r) => r.total <= 15);

  return (
    <>
      {/* Recovery Summary */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Recuperação Hoje
      </Text>
      <Card style={{ backgroundColor: colors.card }}>
        <View style={styles.recoveryHeader}>
          <View>
            <Text style={[styles.statNumber, { color: colors.tint }]}>
              {respondedCount}/{totalCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              responderam
            </Text>
          </View>
          {pendingCount > 0 && (
            <Badge label={`${pendingCount} pendente(s)`} color={colors.warning} />
          )}
        </View>

        {alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={[styles.alertTitle, { color: colors.danger }]}>
              Atenção
            </Text>
            {alerts.map((a) => (
              <View key={a.athleteId} style={styles.alertRow}>
                <View
                  style={[
                    styles.alertDot,
                    { backgroundColor: getRecoveryColor(a.total) },
                  ]}
                />
                <Text style={[styles.alertName, { color: colors.text }]}>
                  {a.name}
                </Text>
                <Badge
                  label={`${a.total}/25 - ${getRecoveryLabel(a.total)}`}
                  color={getRecoveryColor(a.total)}
                />
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Training Load */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Intensidade do Treino Hoje
      </Text>
      <Card style={{ backgroundColor: colors.card }}>
        {MOCK_LOAD_RESPONSES.map((l) => (
          <View key={l.athleteId} style={styles.loadRow}>
            <Text style={[styles.loadName, { color: colors.text }]}>
              {l.name}
            </Text>
            <View style={styles.loadValues}>
              <Text style={[styles.loadDetail, { color: colors.textSecondary }]}>
                Esforço {l.rpe} x {l.duration}min
              </Text>
              <Text style={[styles.loadTotal, { color: colors.accent }]}>
                {l.load} pts
              </Text>
            </View>
          </View>
        ))}
      </Card>

    </>
  );
}

/* ── Athlete-specific content ── */
function AthleteHome({ colors }: { colors: typeof Colors.dark }) {
  const workout = MOCK_WORKOUT_GENERAL;
  const specificWorkout = MOCK_WORKOUT_INDIVIDUAL;
  // Mock: athlete "Bruno Costa" has a specific workout
  const hasSpecific = true;

  return (
    <>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/(tabs)/questionnaires')}>
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          <Text style={styles.quickButtonText}>Pré-Treino</Text>
          <Text style={styles.quickButtonHint}>Responder avaliação</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: colors.accent }]}
          onPress={() => router.push('/(tabs)/questionnaires')}>
          <Ionicons name="fitness" size={24} color="#FFFFFF" />
          <Text style={styles.quickButtonText}>Pós-Treino</Text>
          <Text style={styles.quickButtonHint}>Registrar esforço</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Workout */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Treino de Hoje
      </Text>
      <Card style={{ backgroundColor: colors.card }}>
        <View style={styles.workoutHeader}>
          <Text style={[styles.workoutTitle, { color: colors.tint }]}>
            {workout.title}
          </Text>
          <Badge label={`${workout.duration} min`} color={colors.accent} />
        </View>
        <Text style={[styles.workoutContent, { color: colors.text }]}>
          {workout.content}
        </Text>
      </Card>

      {/* Specific Workout */}
      {hasSpecific && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Seu Treino Específico
          </Text>
          <Card
            style={{
              backgroundColor: colors.card,
              borderLeftWidth: 4,
              borderLeftColor: colors.accent,
            }}>
            <View style={styles.workoutHeader}>
              <Text style={[styles.workoutTitle, { color: colors.accent }]}>
                {specificWorkout.title}
              </Text>
              <Badge label={`${specificWorkout.duration} min`} color={colors.accent} />
            </View>
            <Text style={[styles.workoutContent, { color: colors.text }]}>
              {specificWorkout.content}
            </Text>
          </Card>
        </>
      )}

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 52,
    height: 52,
    marginRight: 12,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF22',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    color: '#FFFFFFCC',
  },
  headerTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 16,
    color: '#FFFFFFCC',
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 18,
    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  /* Coach styles */
  recoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: Fonts.titleBold,
    fontSize: 28,
  },
  statLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
  },
  alertsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB22',
  },
  alertTitle: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 14,
    marginBottom: 8,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  alertName: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 15,
    flex: 1,
  },
  loadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB22',
  },
  loadName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    flex: 1,
  },
  loadValues: {
    alignItems: 'flex-end',
  },
  loadDetail: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 13,
  },
  loadTotal: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 16,
  },
  /* Athlete styles */
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
  },
  quickButton: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  quickButtonText: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  quickButtonHint: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11,
    color: '#FFFFFFAA',
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
  workoutContent: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 22,
  },
  /* Shared styles */
  announcementTitle: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 16,
    marginTop: 8,
  },
  announcementText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  competitionName: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 16,
  },
  competitionDetail: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
