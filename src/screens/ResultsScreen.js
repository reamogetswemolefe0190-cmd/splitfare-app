import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, LAYOUT, SHADOWS } from '../styles/theme';

export default function ResultsScreen({ results, mode, onSelectPerson, onReset }) {
  const [activePayer, setActivePayer] = useState(results[0]?.name || '');
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

  // Helper to get initials
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

        {/* Payer Selector */}
        <View style={styles.payerSelectorCard}>
          <Text style={styles.payerSelectorLabel}>Who paid the total bill?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.payerChipsRow}>
            {results.map((r) => (
              <TouchableOpacity
                key={r.name}
                style={[
                  styles.payerChip,
                  activePayer === r.name && styles.payerChipActive
                ]}
                onPress={() => setActivePayer(r.name)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={activePayer === r.name ? "checkmark-circle" : "ellipse-outline"}
                  size={13}
                  color={activePayer === r.name ? COLORS.primary : COLORS.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text style={[
                  styles.payerChipText,
                  activePayer === r.name && styles.payerChipTextActive
                ]}>
                  {r.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.sectionTitle}>Tap a person to request payment</Text>

        {/* People list */}
        <View style={styles.listContainer}>
          {results.map((item) => {
            const isPayer = item.name === activePayer;
            const avatarBg = getAvatarBg(item.name);
            const initials = getInitials(item.name);

            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.personCard,
                  isPayer && styles.personCardPayer
                ]}
                onPress={() => {
                  if (!isPayer) {
                    onSelectPerson(item.name, item.amount, activePayer);
                  }
                }}
                disabled={isPayer}
                activeOpacity={0.75}
              >
                {/* Avatar Bubble */}
                <View style={[styles.avatar, { backgroundColor: isPayer ? COLORS.border : avatarBg }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>

                <View style={styles.personInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.personName}>{item.name}</Text>
                    {isPayer && (
                      <View style={styles.payerBadge}>
                        <Text style={styles.payerBadgeText}>Payer</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.personDetails} numberOfLines={1}>
                    {isPayer ? `Paid full bill (Portion: R${item.amount.toFixed(2)})` : `Owes ${activePayer} • ${item.detailText}`}
                  </Text>
                </View>
                
                <View style={styles.amountContainer}>
                  <Text style={[styles.personAmount, isPayer && { color: COLORS.textMuted }]}>
                    R{item.amount.toFixed(2)}
                  </Text>
                  {!isPayer ? (
                    <View style={styles.requestLinkRow}>
                      <Text style={styles.payActionText}>Request</Text>
                      <Ionicons name="chevron-forward" size={12} color={COLORS.primary} style={{ marginLeft: 2 }} />
                    </View>
                  ) : (
                    <Text style={styles.paidText}>Your Share</Text>
                  )}
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
    marginBottom: 20,
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
  payerSelectorCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: LAYOUT.borderRadiusLarge,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 24,
    ...SHADOWS.card,
  },
  payerSelectorLabel: {
    ...FONTS.label,
    fontSize: 12,
    marginBottom: 10,
    color: COLORS.textSecondary,
  },
  payerChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  payerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  payerChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  payerChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  payerChipTextActive: {
    color: '#ffffff',
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
  personCardPayer: {
    borderColor: 'rgba(99, 102, 241, 0.25)',
    backgroundColor: 'rgba(99, 102, 241, 0.02)',
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
  payerBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  payerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
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
  paidText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 4,
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
