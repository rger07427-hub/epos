import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: {
    label: string;
    onPress: () => void;
    color?: string;
  };
}

export default function AppHeader({
  title,
  subtitle,
  showBack,
  rightAction,
}: Props) {
  return (
    <>
      <StatusBar
        backgroundColor={Colors.primary}
        barStyle="light-content"
      />
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {rightAction ? (
          <TouchableOpacity
            style={styles.rightBtn}
            onPress={rightAction.onPress}
          >
            <Text style={[
              styles.rightText,
              rightAction.color
                ? { color: rightAction.color }
                : null,
            ]}>
              {rightAction.label}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 48,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  placeholder: {
    width: 36,
  },
  rightBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  rightText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '600',
  },
});
