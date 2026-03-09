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
import { useMockData } from '@/constants/MockContext';

export default function NewCompetitionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { addCompetition } = useMockData();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const canSubmit = name.trim().length > 0 && startDate.trim().length > 0;

  const parseDate = (dateStr: string): string => {
    const parts = dateStr.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateStr;
  };

  const handleSubmit = () => {
    addCompetition({
      name,
      startDate: parseDate(startDate),
      endDate: endDate ? parseDate(endDate) : parseDate(startDate),
      location,
      description,
    });
    Alert.alert('Competição criada!', `"${name}" adicionada ao calendário.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: colors.text }]}>Nome da competição</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Ex: Campeonato Estadual Master"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
      />

      <Text style={[styles.label, { color: colors.text }]}>Data de início</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="DD/MM/AAAA"
        placeholderTextColor={colors.textSecondary}
        value={startDate}
        onChangeText={setStartDate}
        keyboardType="numeric"
      />

      <Text style={[styles.label, { color: colors.text }]}>Data de término (se diferente)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="DD/MM/AAAA"
        placeholderTextColor={colors.textSecondary}
        value={endDate}
        onChangeText={setEndDate}
        keyboardType="numeric"
      />

      <Text style={[styles.label, { color: colors.text }]}>Local</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Ex: Parque Aquático, Rio de Janeiro"
        placeholderTextColor={colors.textSecondary}
        value={location}
        onChangeText={setLocation}
      />

      <Text style={[styles.label, { color: colors.text }]}>Observações (opcional)</Text>
      <TextInput
        style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Inscrições, categorias, informações extras..."
        placeholderTextColor={colors.textSecondary}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: canSubmit ? colors.tint : colors.border }]}
        disabled={!canSubmit}
        onPress={handleSubmit}>
        <Text style={styles.submitText}>Adicionar Competição</Text>
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
    minHeight: 100,
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
