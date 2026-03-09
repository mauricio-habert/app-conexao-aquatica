import { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';

import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/components/useColorScheme';
import { useMockData } from '@/constants/MockContext';

export default function NewAnnouncementScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { addAnnouncement } = useMockData();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [important, setImportant] = useState(false);

  const canSubmit = text.trim().length > 0;

  const handleSubmit = () => {
    addAnnouncement({
      title: title || 'Sem título',
      text,
      date: new Date().toISOString().split('T')[0],
      important,
    });
    Alert.alert('Recado criado!', 'O recado foi publicado para a equipe.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: colors.text }]}>Título (opcional)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Ex: Horário alterado"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={[styles.label, { color: colors.text }]}>Mensagem</Text>
      <TextInput
        style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        placeholder="Digite o recado para a equipe..."
        placeholderTextColor={colors.textSecondary}
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, { color: colors.text }]}>
          Fixar como importante
        </Text>
        <Switch
          value={important}
          onValueChange={setImportant}
          trackColor={{ false: colors.border, true: colors.danger + '88' }}
          thumbColor={important ? colors.danger : colors.textSecondary}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: canSubmit ? colors.tint : colors.border }]}
        disabled={!canSubmit}
        onPress={handleSubmit}>
        <Text style={styles.submitText}>Publicar Recado</Text>
      </TouchableOpacity>
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
    minHeight: 140,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  switchLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
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
