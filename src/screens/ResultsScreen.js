import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, LAYOUT, SHADOWS } from '../styles/theme';

export default function ResultsScreen({ results, mode, onSelectPerson, onReset }) {
  const totalBill = results.reduce((sum, r) => sum + r.amount, 0);

  const handleResetPress = () => {
    if (Platform.OS === 'web') {
      const confirmReset = window.confirm(
        'Reset Session?\nThis will erase all passenger/dinner item data. This action cannot be undone.'
      );
      if (confirmReset) {
        onReset();
      }
    } else {
      Alert.alert(
        'Reset Session?',
        'This will erase all passenger/dinner item data. This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reset', style: 'destructive', onPress: onReset }
        ]
      );
    }
  };

  // Helper to get initial
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Helper to assign a color to initials
  const getAvatarBg = (name) => {
    const code = name.charCodeAt(0) % 3;
    if (code === 0) return COLORS.primary;
    if (code === 1) return COLORS.secondary;
    return COLORS.accent;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Split Summary</Text>
        <Text style={styles.headerSubtitle}>
          {mode === 'trip' ? '🚗 Trip Mode Split' : '🍔 Dinner Mode Split'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Grand Total Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Grand Total Split</Text>
          <Text style={styles.totalAmount}>R{totalBill.toFixed(2)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Tap a person to request payment</Text>

        {/* People list */}
        <View style={styles.listContainer}>
          {results.map((item) => {
            const avatarBg = getAvatarBg(item.name);
            const initials = getInitials(item.name);

            return (
              <TouchableOpacity
                key={item.name}
                style={styles.personCard}
                onPress={() => onSelectPerson(item.name, item.amount)}
                activeOpacity={0.75}
              >
                {/* Avatar Bubble */}
                <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>

                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{item.name}</Text>
                  {item.detailText ? (
                    <Text style={styles.personDetails} numberOfLines={1}>
                      {item.detailText}
                    </Text>
                  ) : null}
                </View>
                
                <View style={styles.amountContainer}>
                  <Text style={styles.personAmount}>R{item.amount.toFixed(2)}</Text>
                  <View style={styles.requestLinkRow}>
                    <Text style={styles.payActionText}>Request</Text>
                    <Ionicons name="chevron-forward" size={12} color={COLORS.primary} style={{ marginLeft: 2 }} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer controls */}
      <View style={[styles.footer, Platform.OS === 'ios' && { paddingBottom: 30 }]}>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetPress} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={16} color={COLORS.danger} style={{ marginRight: 6 }} />
          <Text style={styles.resetButtonText}>Reset & Start New Split</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.titleMedium,
    color: '#ffffff',
  },
  headerSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: LAYOUT.padding,
    paddingBottom: 40,
  },
  totalCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: LAYOUT.borderRadiusLarge,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    ...SHADOWS.glow,
  },
  totalLabel: {
    ...FONTS.label,
    marginBottom: 6,
  },
  totalAmount: {
    ...FONTS.titleLarge,
    fontSize: 36,
    color: COLORS.accent,
  },
  sectionTitle: {
    ...FONTS.label,
    fontSize: 12,
    marginBottom: 12,
  },
  listContainer: {
    gap: 12,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: LAYOUT.borderRadiusMedium,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    ...SHADOWS.card,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  personInfo: {
    flex: 1,
    marginRight: 8,
  },
  personName: {
    ...FONTS.titleSmall,
    color: '#ffffff',
  },
  personDetails: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  personAmount: {
    ...FONTS.bodyLarge,
    fontWeight: '700',
    color: '#ffffff',
  },
  requestLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  payActionText: {
    ...FONTS.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    padding: LAYOUT.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  resetButton: {
    borderColor: COLORS.danger,
    borderWidth: 1,
    backgroundColor: 'rgba(244, 63, 94, 0.03)',
    height: 50,
    borderRadius: LAYOUT.borderRadiusLarge,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.danger,
    fontWeight: '600',
  },
});
