import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export default function FormField({
  label,
  error,
  required,
  ...props
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={Colors.gray[400]}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
    marginBottom: 6,
  },
  required: {
    color: Colors.danger,
  },
  input: {
    backgroundColor: Colors.gray[50],
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.gray[800],
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
  },
});
