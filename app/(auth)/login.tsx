import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/colors';
import { Radius, Shadow, Spacing, FontSize } from '../../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }
    const error = await signIn(email.trim(), password);
    if (error) {
      Alert.alert('Login Gagal', 'Email atau password salah');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>X</Text>
        </View>
        <Text style={styles.title}>XPOS</Text>
        <Text style={styles.subtitle}>Masuk ke akun Anda</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.gray[400]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.gray[400]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Masuk</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Shadow.card,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: Radius.button,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: Colors.white,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: FontSize.h1,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSize.body2,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderRadius: Radius.button,
    paddingHorizontal: Spacing.md,
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSize.body1,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    backgroundColor: Colors.gray[50],
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  buttonText: {
    color: Colors.white,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: FontSize.body1,
  },
});
