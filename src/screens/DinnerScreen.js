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

export default function DinnerScreen({ onBack, onCalculate }) {
  // State for people (participants)
  const [people, setPeople] = useState([]);
  const [personInput, setPersonInput] = useState('');
  const [isPersonInputFocused, setIsPersonInputFocused] = useState(false);

  // State for items
  const [items, setItems] = useState([]);
  const [itemNameInput, setItemNameInput] = useState('');
  const [itemPriceInput, setItemPriceInput] = useState('');
  const [isItemNameFocused, setIsItemNameFocused] = useState(false);
  const [isItemPriceFocused, setIsItemPriceFocused] = useState(false);
  const [selectedPeopleForNewItem, setSelectedPeopleForNewItem] = useState([]);

  // Add a participant
  const addPerson = () => {
    const name = personInput.trim();
    if (!name) return;

    if (people.some(p => p.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Duplicate Name', 'This person has already been added.');
      return;
    }

    setPeople([...people, name]);
    setPersonInput('');
  };

  // Remove a participant
  const removePerson = (name) => {
    // Alert warning if they are already assigned to items
    const assignedItems = items.filter(item => item.assignedPeople.includes(name));
    if (assignedItems.length > 0) {
      Alert.alert(
        'Cannot Remove',
        `${name} is assigned to items (e.g. ${assignedItems[0].name}). Remove them from those items first.`
      );
      return;
    }

    setPeople(people.filter(p => p !== name));
    setSelectedPeopleForNewItem(selectedPeopleForNewItem.filter(p => p !== name));
  };

  // Toggle person assignment for new item
  const togglePersonForNewItem = (name) => {
    if (selectedPeopleForNewItem.includes(name)) {
      setSelectedPeopleForNewItem(selectedPeopleForNewItem.filter(p => p !== name));
    } else {
      setSelectedPeopleForNewItem([...selectedPeopleForNewItem, name]);
    }
  };

  // Add a bill item
  const addItem = () => {
    const name = itemNameInput.trim();
    const price = parseFloat(itemPriceInput);

    if (!name) {
      Alert.alert('Invalid Item', 'Please enter an item name.');
      return;
    }
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price greater than 0.');
      return;
    }
    if (selectedPeopleForNewItem.length === 0) {
      Alert.alert('No One Selected', 'Please select at least one person to assign this item to.');
      return;
    }

    const newItem = {
      id: String(Date.now()),
      name,
      price,
      assignedPeople: [...selectedPeopleForNewItem]
    };

    setItems([...items, newItem]);
    setItemNameInput('');
    setItemPriceInput('');
    setSelectedPeopleForNewItem([]); // Reset selection
  };

  // Remove an item
  const removeItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // Calculations for preview
  const personTotals = {};
  people.forEach(p => {
    personTotals[p] = 0;
  });

  items.forEach(item => {
    const splitCount = item.assignedPeople.length;
    const splitPrice = item.price / splitCount;
    item.assignedPeople.forEach(p => {
      if (personTotals[p] !== undefined) {
        personTotals[p] += splitPrice;
      }
    });
  });

  const grandTotal = items.reduce((sum, item) => sum + item.price, 0);

  const handleCalculatePress = () => {
    if (people.length === 0) {
      Alert.alert('No People', 'Please add at least one person.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('No Items', 'Please add at least one item.');
      return;
    }

    // Build results payload
    const results = people.map(p => {
      // Find details of items this person is assigned to
      const itemDetails = items
        .filter(item => item.assignedPeople.includes(p))
        .map(item => {
          const count = item.assignedPeople.length;
          const share = item.price / count;
          return `${item.name} (R${share.toFixed(2)}${count > 1 ? ` split ${count} ways` : ''})`;
        });

      return {
        name: p,
        amount: personTotals[p],
        detailText: itemDetails.length > 0 ? itemDetails.join(', ') : 'No items assigned'
      };
    });

    onCalculate(results, 'dinner');
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
          <Text style={styles.headerTitle}>Dinner Mode</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* 1. Add People Section */}
          <View style={styles.card}>
            <Text style={styles.label}>1. Add Guests/Dinner Group</Text>
            <View style={[
              styles.addInputRow,
              isPersonInputFocused && styles.addInputRowFocused
            ]}>
              <TextInput
                style={styles.input}
                placeholder="Enter name (e.g. Alice)"
                placeholderTextColor={COLORS.textMuted}
                value={personInput}
                onChangeText={setPersonInput}
                onFocus={() => setIsPersonInputFocused(true)}
                onBlur={() => setIsPersonInputFocused(false)}
                onSubmitEditing={addPerson}
              />
              <TouchableOpacity style={styles.actionBtn} onPress={addPerson} activeOpacity={0.8}>
                <Text style={styles.actionBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* People Chips */}
            <View style={styles.chipsContainer}>
              {people.length === 0 ? (
                <Text style={styles.emptyText}>No guests added yet. Add people first!</Text>
              ) : (
                people.map(p => (
                  <View key={p} style={styles.chip}>
                    <Text style={styles.chipText}>{p}</Text>
                    <TouchableOpacity style={styles.chipDelete} onPress={() => removePerson(p)}>
                      <Ionicons name="close-circle" size={14} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* 2. Add Item Section */}
          {people.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.label}>2. Add Bill Item</Text>
              
              <View style={styles.itemInputsRow}>
                <TextInput
                  style={[
                    styles.input, 
                    { flex: 2 },
                    isItemNameFocused && styles.inputFocused
                  ]}
                  placeholder="Item name (e.g. Pizza)"
                  placeholderTextColor={COLORS.textMuted}
                  value={itemNameInput}
                  onChangeText={setItemNameInput}
                  onFocus={() => setIsItemNameFocused(true)}
                  onBlur={() => setIsItemNameFocused(false)}
                />
                <View style={[
                  styles.priceWrapper,
                  isItemPriceFocused && styles.priceWrapperFocused
                ]}>
                  <Text style={[
                    styles.currencySymbol,
                    isItemPriceFocused && { color: COLORS.secondary }
                  ]}>R</Text>
                  <TextInput
                    style={[styles.priceInput]}
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="decimal-pad"
                    value={itemPriceInput}
                    onChangeText={setItemPriceInput}
                    onFocus={() => setIsItemPriceFocused(true)}
                    onBlur={() => setIsItemPriceFocused(false)}
                  />
                </View>
              </View>

              <Text style={[styles.subLabel, { marginTop: 16 }]}>Assign to (select one or more):</Text>
              <View style={styles.selectionChipsContainer}>
                {people.map(p => {
                  const isSelected = selectedPeopleForNewItem.includes(p);
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.selectChip,
                        isSelected && styles.selectChipActive
                      ]}
                      onPress={() => togglePersonForNewItem(p)}
                      activeOpacity={0.8}
                    >
                      <Ionicons 
                        name={isSelected ? "checkbox" : "square-outline"} 
                        size={16} 
                        color={isSelected ? COLORS.secondary : COLORS.textSecondary} 
                        style={{ marginRight: 6 }} 
                      />
                      <Text style={[
                        styles.selectChipText,
                        isSelected && styles.selectChipTextActive
                      ]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.addItemBtn} onPress={addItem} activeOpacity={0.8}>
                <Ionicons name="add-circle" size={18} color={COLORS.secondary} style={{ marginRight: 6 }} />
                <Text style={styles.addItemBtnText}>Add Item to Bill</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 3. Items List */}
          {items.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Bill Items</Text>
              {items.map(item => {
                const count = item.assignedPeople.length;
                const splitCost = item.price / count;
                return (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemMainRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemSubText}>
                          Assigned to: {item.assignedPeople.join(', ')}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                        <Text style={styles.itemPrice}>R{item.price.toFixed(2)}</Text>
                        {count > 1 && (
                          <Text style={styles.itemSplitPrice}>
                            R{splitCost.toFixed(2)} each
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.deleteItemBtn}
                        onPress={() => removeItem(item.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* 4. Live Summary */}
          {items.length > 0 && (
            <View style={[styles.card, styles.summaryCard]}>
              <Text style={styles.summaryTitle}>Live Totals Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Bill:</Text>
                <Text style={[styles.summaryValue, { color: COLORS.accent, fontSize: 18 }]}>
                  R{grandTotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.divider} />
              {people.map(p => (
                <View key={p} style={styles.summaryListRow}>
                  <Text style={styles.summaryListName}>{p}</Text>
                  <Text style={styles.summaryListCost}>R{personTotals[p].toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Calculate Button */}
        <View style={[styles.footer, Platform.OS === 'ios' && { paddingBottom: 30 }]}>
          <TouchableOpacity
            style={[
              styles.calculateButton,
              (people.length === 0 || items.length === 0) && styles.calculateButtonDisabled
            ]}
            onPress={handleCalculatePress}
            disabled={people.length === 0 || items.length === 0}
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
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  label: {
    ...FONTS.label,
    marginBottom: 10,
  },
  subLabel: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  addInputRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: LAYOUT.borderRadiusSmall,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingRight: 4,
    marginBottom: 12,
    alignItems: 'center',
  },
  addInputRowFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 15,
  },
  inputFocused: {
    borderColor: COLORS.secondary,
    borderWidth: 1,
    borderRadius: LAYOUT.borderRadiusSmall,
    backgroundColor: 'rgba(168, 85, 247, 0.03)',
  },
  priceWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: LAYOUT.borderRadiusSmall,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
  },
  priceWrapperFocused: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(168, 85, 247, 0.03)',
  },
  priceInput: {
    flex: 1,
    height: 44,
    color: '#ffffff',
    fontSize: 15,
    paddingLeft: 4,
  },
  currencySymbol: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.borderRadiusSmall - 2,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  actionBtnText: {
    ...FONTS.buttonText,
    fontSize: 13,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyText: {
    ...FONTS.bodySmall,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 5,
  },
  chipText: {
    ...FONTS.bodyMedium,
    color: '#ffffff',
    fontWeight: '500',
    marginRight: 6,
  },
  chipDelete: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  selectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectChipActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderColor: COLORS.secondary,
  },
  selectChipText: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  selectChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  addItemBtn: {
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
    borderColor: COLORS.secondary,
    borderWidth: 1,
    height: 44,
    borderRadius: LAYOUT.borderRadiusMedium,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemBtnText: {
    ...FONTS.bodyMedium,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  sectionTitle: {
    ...FONTS.label,
    marginTop: 12,
    marginBottom: 8,
  },
  itemCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: LAYOUT.borderRadiusMedium,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 8,
    ...SHADOWS.card,
  },
  itemMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    ...FONTS.titleSmall,
    color: '#ffffff',
  },
  itemSubText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    ...FONTS.bodyLarge,
    color: '#ffffff',
    fontWeight: '700',
  },
  itemSplitPrice: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  deleteItemBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: 'rgba(9, 14, 26, 0.4)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderWidth: 1,
    marginTop: 16,
  },
  summaryTitle: {
    ...FONTS.titleSmall,
    color: '#ffffff',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  summaryListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
