import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';

import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/components/useColorScheme';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { useMockData } from '@/constants/MockContext';
import { useAuth } from '@/constants/AuthContext';

export default function AnnouncementsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { announcements, removeAnnouncement } = useMockData();
  const { user } = useAuth();
  const isCoach = user?.role === 'coach';

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Excluir recado?', `"${title}"`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => removeAnnouncement(id) },
    ]);
  };

  const important = announcements.filter((a) => a.important);
  const regular = announcements.filter((a) => !a.important);
  const sorted = [...important, ...regular];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      {isCoach && (
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/new-announcement')}>
          <Text style={styles.createButtonText}>+ Novo Recado</Text>
        </TouchableOpacity>
      )}

      {sorted.map((announcement) => (
        <TouchableOpacity
          key={announcement.id}
          onLongPress={isCoach ? () => handleDelete(announcement.id, announcement.title) : undefined}
          activeOpacity={isCoach ? 0.8 : 1}>
        <Card
          style={[
            { backgroundColor: colors.card },
            announcement.important && {
              borderLeftWidth: 4,
              borderLeftColor: colors.danger,
            },
          ]}>
          <View style={styles.cardHeader}>
            {announcement.important && (
              <Badge label="Fixado" color={colors.danger} />
            )}
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {new Date(announcement.date).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {announcement.title}
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {announcement.text}
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
  createButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
  },
  title: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 16,
    marginBottom: 4,
  },
  body: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
});
