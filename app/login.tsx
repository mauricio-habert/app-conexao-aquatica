import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth, UserRole } from '@/constants/AuthContext';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('coach');

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert('Preencha seu email');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Preencha sua senha');
      return;
    }
    const name = email.split('@')[0].replace(/[._]/g, ' ');
    login(name, email.trim(), role);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <LinearGradient
          colors={['#1A7A7A', '#E87A1E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}>
          <Image
            source={require('../img/logo_instagram_sem_fundo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Conexão Aquática</Text>
          <Text style={styles.headerSubtitle}>Bem-vindo!</Text>
        </LinearGradient>

        <View style={styles.form}>
          {/* Role selector (prototype only) */}
          <View style={[styles.roleBar, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'coach' && { backgroundColor: colors.tint },
              ]}
              onPress={() => setRole('coach')}>
              <Text
                style={[
                  styles.roleOptionText,
                  { color: role === 'coach' ? '#FFFFFF' : colors.textSecondary },
                ]}>
                Técnico
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'athlete' && { backgroundColor: colors.accent },
              ]}
              onPress={() => setRole('athlete')}>
              <Text
                style={[
                  styles.roleOptionText,
                  { color: role === 'athlete' ? '#FFFFFF' : colors.textSecondary },
                ]}>
                Atleta
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.roleNotice, { color: colors.textSecondary }]}>
            Na versão final, o perfil será automático pelo cadastro
          </Text>

          {/* Email */}
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="email@exemplo.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          {/* Password */}
          <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Senha</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Sua senha"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.tint }]}
            onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          {/* Mock notice */}
          <Text style={[styles.mockNotice, { color: colors.textSecondary }]}>
            Protótipo — qualquer email/senha funciona
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: Fonts.titleBold,
    fontSize: 28,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 16,
    color: '#FFFFFFCC',
    marginTop: 4,
  },
  form: {
    padding: 24,
    paddingTop: 28,
  },
  roleBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 4,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  roleOptionText: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 14,
  },
  roleNotice: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 15,
    marginBottom: 8,
  },
  input: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  loginButtonText: {
    fontFamily: Fonts.titleSemiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  mockNotice: {
    fontFamily: Fonts.bodyRegular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
