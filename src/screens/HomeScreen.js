import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, LAYOUT, SHADOWS } from '../styles/theme';

export default function HomeScreen({ onSelectMode }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="calculator-outline" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.logo}>SplitFare</Text>
          <Text style={styles.subtitle}>Split bills instantly, no math required</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.card, styles.tripCard]}
            onPress={() => onSelectMode('trip')}
            activeOpacity={0.85}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="car-outline" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Trip Mode</Text>
              <Text style={styles.cardDescription}>
                Split a ride or travel fare based on stops traveled. Perfect for road trips and Uber rides.
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.dinnerCard]}
            onPress={() => onSelectMode('dinner')}
            activeOpacity={0.85}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="restaurant-outline" size={32} color={COLORS.accent} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Dinner Mode</Text>
              <Text style={styles.cardDescription}>
                Assign individual items to guests. Share items split equally. Great for restaurants and bars.
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Session data is stored in memory and resets when closed.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: LAYOUT.padding,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  logo: {
    ...FONTS.titleLarge,
    fontSize: 34,
    color: '#ffffff',
  },
  subtitle: {
    ...FONTS.bodyLarge,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 15,
  },
  optionsContainer: {
    gap: 16,
    marginVertical: 40,
  },
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: LAYOUT.borderRadiusLarge,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  tripCard: {
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  dinnerCard: {
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: LAYOUT.borderRadiusMedium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    ...FONTS.titleMedium,
    color: '#ffffff',
    marginBottom: 4,
    fontSize: 18,
  },
  cardDescription: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    ...FONTS.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
