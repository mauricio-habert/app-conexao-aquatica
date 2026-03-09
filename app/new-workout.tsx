import { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';

import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/components/useColorScheme';
import { MOCK_ATHLETES } from '@/constants/MockData';
import { useMockData } from '@/constants/MockContext';

type WorkoutType = 'general' | 'individual';

export default function NewWorkoutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { addWorkout } = useMockData();

  const [type, setType] = useState<WorkoutType>('general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState('90');
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  const toggleAthlete = (id: string) => {
    setSelectedAthletes((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const athlete = type === 'individual' && selectedAthletes.length > 0
      ? MOCK_ATHLETES.find((a) => a.id === selectedAthletes[0])
      : undefined;
    addWorkout({
      date: new Date().toISOString().split('T')[0],
      title,
      duration: Number(duration),
      content,
      type,
      athleteId: athlete?.id,
      athleteName: athlete?.name,
    });
    const typeLabel = type === 'general' ? 'geral' : 'específico';
    Alert.alert('Treino criado!', `Treino ${typeLabel} publicado.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      {/* Type Selector */}
      <View style={[styles.typeRow, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.typeTab, type === 'general' && { backgroundColor: colors.tint }]}
          onPress={() => setType('general')}>
          <Text
            style={[styles.typeText, { color: type === 'general' ? '#FFFFFF' : colors.textSecondary }]}>
            Geral
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeTab, type === 'individual' && { backgroundColor: colors.accent }]}
          onPress={() => setType('individual')}>
          <Text
            style={[styles.typeText, { color: type === 'individual' ? '#FFFFFF' : colors.textSecondary }]}>
            Individualizado
          </Text>
        </TouchableOpacity>
      </View>

      {/* Athlete Selection (individual only) */}
      {type === 'individual' && (
        <>
          <Text style={[styles.label, { color: colors.text }]}>Selecionar atleta(s)</Text>
          <View style={styles.athleteGrid}>
            {MOCK_ATHLETES.map((a) => {
              const selected = selectedAthletes.includes(a.id);
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[
                    styles.athleteChip,
                    {
                      backgroundColor: selected ? colors.accent : colors.card,
                      borderColor: selected ? colors.accent : colors.border,
                    },
                  ]}
                  onPress={() => toggleAthlete(a.id)}>
                  <Text
                    style={[
                      styles.athleteChipText,
                      { color: selected ? '#FFFFFF' : colors.text },
                    ]}>
                    {a.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <Text style={[styles.label, { color: colors.text }]}>Título do treino</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Ex: Treino de Base Aeróbia"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={[styles.label, { color: colors.text }]}>Duração (minutos)</Text>
      <View style={styles.durationRow}>
        <TouchableOpacity
          style={[styles.durationBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setDuration(String(Math.max(15, Number(duration) - 15)))}>
          <Text style={[styles.durationBtnText, { color: colors.text }]}>-15</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.durationInput, { backgroundColor: colors.card, color: colors.accent, borderColor: colors.border }]}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          textAlign="center"
        />
        <TouchableOpacity
          style={[styles.durationBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setDuration(String(Number(duration) + 15))}>
          <Text style={[styles.durationBtnText, { color: colors.text }]}>+15</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Conteúdo do treino</Text>
      <TextInput
        style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder={'Aquecimento:\n400m crawl solto\n\nParte Principal:\n8x200m crawl\n\nVolta à calma:\n200m solto'}
        placeholderTextColor={colors.textSecondary}
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={12}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: canSubmit ? colors.tint : colors.border }]}
        disabled={!canSubmit}
        onPress={handleSubmit}>
        <Text style={styles.submitText}>Publicar Treino</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  typeRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeText: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 14,
  },
  label: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 15,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 200,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationBtn: {
    width: 50,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
  },
  durationInput: {
    fontFamily: Fonts.titleBold,
    fontSize: 24,
    borderWidth: 1,
    borderRadius: 10,
    width: 80,
    height: 56,
    paddingTop: 12,
    paddingBottom: 4,
  },
  athleteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  athleteChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  athleteChipText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
