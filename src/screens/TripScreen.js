import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, LAYOUT, SHADOWS } from '../styles/theme';

export default function TripScreen({ onBack, onCalculate }) {
  const [fare, setFare] = useState('');
  const [isFareFocused, setIsFareFocused] = useState(false);
  const [stops, setStops] = useState([
    { id: '1', name: 'Stop 1', passengers: [] }
  ]);
  const [passengerInputs, setPassengerInputs] = useState({ '1': '' });
  const [focusedInputs, setFocusedInputs] = useState({});

  // Add a new stop at the end of the sequence
  const addStop = () => {
    const newId = String(stops.length + 1);
    setStops([
      ...stops,
      { id: newId, name: `Stop ${newId}`, passengers: [] }
    ]);
    setPassengerInputs({
      ...passengerInputs,
      [newId]: ''
    });
  };

  // Remove the last stop
  const removeLastStop = () => {
    if (stops.length <= 1) return;
    const newStops = stops.slice(0, -1);
    setStops(newStops);
  };

  // Add passenger to a specific stop
  const addPassenger = (stopId) => {
    const name = passengerInputs[stopId]?.trim();
    if (!name) return;

    // Check if name is already added in any stop to prevent duplicate passenger names
    const nameExists = stops.some(stop =>
      stop.passengers.some(p => p.toLowerCase() === name.toLowerCase())
    );

    if (nameExists) {
      Alert.alert('Duplicate Name', 'A passenger with this name is already in the trip.');
      return;
    }

    setStops(
      stops.map(stop => {
        if (stop.id === stopId) {
          return { ...stop, passengers: [...stop.passengers, name] };
        }
        return stop;
      })
    );

    setPassengerInputs({
      ...passengerInputs,
      [stopId]: ''
    });
  };

  // Remove passenger from a specific stop
  const removePassenger = (stopId, passengerName) => {
    setStops(
      stops.map(stop => {
        if (stop.id === stopId) {
          return {
            ...stop,
            passengers: stop.passengers.filter(p => p !== passengerName)
          };
        }
        return stop;
      })
    );
  };

  // Calculate live summary
  const totalFare = parseFloat(fare) || 0;
  let totalStopsTraveled = 0;
  const passengerList = [];

  stops.forEach((stop, index) => {
    const stopsTraveled = index + 1; // 1-indexed stop number represents stops traveled
    stop.passengers.forEach(p => {
      totalStopsTraveled += stopsTraveled;
      passengerList.push({
        name: p,
        stopsTraveled,
      });
    });
  });

  const ratePerStop = totalStopsTraveled > 0 ? totalFare / totalStopsTraveled : 0;

  const handleCalculatePress = () => {
    if (totalFare <= 0) {
      Alert.alert('Invalid Fare', 'Please enter a valid fare amount.');
      return;
    }
    if (passengerList.length === 0) {
      Alert.alert('No Passengers', 'Please add at least one passenger to a stop.');
      return;
    }

    // Build the results payload
    const results = passengerList.map(p => ({
      name: p.name,
      amount: p.stopsTraveled * ratePerStop,
      detailText: `${p.stopsTraveled} stop${p.stopsTraveled > 1 ? 's' : ''} (Rate: R${ratePerStop.toFixed(2)}/stop)`
    }));

    onCalculate(results, 'trip');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trip Mode</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Fare Input Card */}
          <View style={styles.card}>
            <Text style={styles.label}>Total Fare Amount</Text>
            <View style={[
              styles.inputWrapper,
              isFareFocused && styles.inputWrapperFocused
            ]}>
              <Text style={[
                styles.currencySymbol,
                isFareFocused && { color: COLORS.primary }
              ]}>R</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                value={fare}
                onChangeText={setFare}
                onFocus={() => setIsFareFocused(true)}
                onBlur={() => setIsFareFocused(false)}
              />
            </View>
          </View>

          {/* Stops List */}
          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Trip Stops (in order)</Text>
          {stops.map((stop, index) => {
            const stopNumber = index + 1;
            const isStopInputFocused = focusedInputs[stop.id];

            return (
              <View key={stop.id} style={styles.stopCard}>
                <View style={styles.stopHeader}>
                  <View style={styles.stopTitleRow}>
                    <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.stopTitle}>
                      Stop {stopNumber} <Text style={styles.stopSubtitle}>({stopNumber} stop{stopNumber > 1 ? 's' : ''} traveled)</Text>
                    </Text>
                  </View>
                </View>

                {/* Add Passenger Input */}
                <View style={[
                  styles.addPassengerRow,
                  isStopInputFocused && styles.addPassengerRowFocused
                ]}>
                  <TextInput
                    style={styles.passengerInput}
                    placeholder="Enter passenger name"
                    placeholderTextColor={COLORS.textMuted}
                    value={passengerInputs[stop.id] || ''}
                    onChangeText={(val) =>
                      setPassengerInputs({ ...passengerInputs, [stop.id]: val })
                    }
                    onFocus={() => setFocusedInputs({ ...focusedInputs, [stop.id]: true })}
                    onBlur={() => setFocusedInputs({ ...focusedInputs, [stop.id]: false })}
                    onSubmitEditing={() => addPassenger(stop.id)}
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addPassenger(stop.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                {/* Passenger Chips */}
                <View style={styles.chipsContainer}>
                  {stop.passengers.length === 0 ? (
                    <Text style={styles.emptyStopText}>No passengers getting off here yet.</Text>
                  ) : (
                    stop.passengers.map((p) => (
                      <View key={p} style={styles.chip}>
                        <Text style={styles.chipText}>{p}</Text>
                        <TouchableOpacity
                          style={styles.chipDelete}
                          onPress={() => removePassenger(stop.id, p)}
                        >
                          <Ionicons name="close" size={14} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              </View>
            );
          })}

          {/* Stop Controls */}
          <View style={styles.stopControlsRow}>
            {stops.length > 1 && (
              <TouchableOpacity
                style={[styles.controlButton, styles.removeStopBtn]}
                onPress={removeLastStop}
                activeOpacity={0.7}
              >
                <Ionicons name="remove-circle-outline" size={18} color={COLORS.danger} style={{ marginRight: 6 }} />
                <Text style={styles.removeStopBtnText}>Remove Stop</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.controlButton, styles.addStopBtn]}
              onPress={addStop}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.addStopBtnText}>Add Next Stop</Text>
            </TouchableOpacity>
          </View>

          {/* Live Calculations Summary Card */}
          {passengerList.length > 0 && (
            <View style={[styles.card, styles.summaryCard]}>
              <Text style={styles.summaryTitle}>Live Split Calculations</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Stops Traveled:</Text>
                <Text style={styles.summaryValue}>{totalStopsTraveled}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Rate per Stop:</Text>
                <Text style={[styles.summaryValue, { color: COLORS.accent }]}>
                  R{ratePerStop.toFixed(2)}
                </Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.summaryListTitle}>Preview Split:</Text>
              {passengerList.map((p) => {
                const cost = p.stopsTraveled * ratePerStop;
                return (
                  <View key={p.name} style={styles.summaryListRow}>
                    <Text style={styles.summaryListName}>{p.name} ({p.stopsTraveled} stops)</Text>
                    <Text style={styles.summaryListCost}>R{cost.toFixed(2)}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Calculate Button */}
        <View style={[styles.footer, Platform.OS === 'ios' && { paddingBottom: 30 }]}>
          <TouchableOpacity
            style={[
              styles.calculateButton,
              (totalFare <= 0 || passengerList.length === 0) && styles.calculateButtonDisabled
            ]}
            onPress={handleCalculatePress}
            disabled={totalFare <= 0 || passengerList.length === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.calculateButtonText}>Calculate Split & View Results</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  backButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 2,
  },
  headerTitle: {
    ...FONTS.titleMedium,
    textAlign: 'center',
  },
  scrollContent: {
    padding: LAYOUT.padding,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: LAYOUT.borderRadiusMedium,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  label: {
    ...FONTS.label,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: LAYOUT.borderRadiusSmall,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  currencySymbol: {
    ...FONTS.titleMedium,
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    ...FONTS.label,
    marginBottom: 12,
  },
  stopCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: LAYOUT.borderRadiusMedium,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  stopHeader: {
    marginBottom: 12,
  },
  stopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stopTitle: {
    ...FONTS.titleSmall,
    color: '#ffffff',
  },
  stopSubtitle: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: 'normal',
  },
  addPassengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: LAYOUT.borderRadiusSmall,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingRight: 4,
    marginBottom: 12,
  },
  addPassengerRowFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
  },
  passengerInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: LAYOUT.borderRadiusSmall - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyStopText: {
    ...FONTS.bodySmall,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 4,
  },
  chipText: {
    ...FONTS.bodyMedium,
    color: '#ffffff',
    fontWeight: '500',
    marginRight: 4,
  },
  chipDelete: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopControlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  controlButton: {
    flex: 1,
    height: 44,
    borderRadius: LAYOUT.borderRadiusMedium,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  addStopBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderColor: COLORS.primary,
  },
  addStopBtnText: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    fontWeight: '600',
  },
  removeStopBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.03)',
    borderColor: COLORS.danger,
  },
  removeStopBtnText: {
    ...FONTS.bodyMedium,
    color: COLORS.danger,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: 'rgba(9, 14, 26, 0.4)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
  },
  summaryTitle: {
    ...FONTS.titleSmall,
    color: '#ffffff',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    ...FONTS.bodyMedium,
    color: '#ffffff',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  summaryListTitle: {
    ...FONTS.label,
    fontSize: 11,
    marginBottom: 8,
  },
  summaryListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryListName: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  summaryListCost: {
    ...FONTS.bodyMedium,
    color: '#ffffff',
    fontWeight: '600',
  },
  footer: {
    padding: LAYOUT.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  calculateButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: LAYOUT.borderRadiusLarge,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  calculateButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  calculateButtonText: {
    ...FONTS.buttonText,
  },
});
