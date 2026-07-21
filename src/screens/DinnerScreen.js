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
import * as ImagePicker from 'expo-image-picker';
import Tesseract from 'tesseract.js';
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
 
  // Receipt scanning states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedItems, setScannedItems] = useState([]); // List of parsed items from OCR
 
  // Helper to parse receipt text using regex
  const parseReceiptText = (text) => {
    const lines = text.split('\n');
    const parsedItems = [];
    const priceRegex = /(?:R\s*)?(\d+[\.,]\d{2})\b/;
    const ignoreKeywords = [
      'total', 'subtotal', 'vat', 'tax', 'balance', 'change', 'cash', 'card', 
      'slip', 'merchant', 'tel', 'phone', 'date', 'time', 'thank', 'you', 'invoice'
    ];

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      const match = cleanLine.match(priceRegex);
      if (match) {
        const priceStr = match[1].replace(',', '.');
        const price = parseFloat(priceStr);
        if (!isNaN(price) && price > 0) {
          let name = cleanLine.substring(0, match.index).trim();
          name = name.replace(/^\d+x\s*/i, ''); // Clean "1x Pizza" -> "Pizza"
          name = name.replace(/^[\s\-\*\.\+#\d]+/, ''); // Clean leading non-letters
          name = name.trim();

          const isIgnored = ignoreKeywords.some(keyword => 
            name.toLowerCase().includes(keyword)
          );

          if (name.length > 2 && !isIgnored && price < 10000) {
            parsedItems.push({
              id: String(Math.random()),
              name: name,
              price: price,
              selected: true,
              assignedPeople: [...people] // Default assign to all current guests
            });
          }
        }
      }
    });

    return parsedItems;
  };

  const handleScanReceipt = async () => {
    if (people.length === 0) {
      Alert.alert('No Guests', 'Please add at least one guest first so we can assign items to them.');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to scan receipt photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1.0,
      });

      if (result.canceled) return;
      const imageUri = result.assets[0].uri;

      setIsScanning(true);
      setScanProgress(0);

      const ocrResult = await Tesseract.recognize(
        imageUri,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setScanProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const itemsFound = parseReceiptText(ocrResult.data.text);
      if (itemsFound.length === 0) {
        Alert.alert(
          'No Items Detected',
          'We couldn\'t find any clear items and prices on this photo. Try taking a closer, well-lit picture.'
        );
      } else {
        setScannedItems(itemsFound);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      Alert.alert('Scan Failed', 'An error occurred while parsing the receipt. Please try again.');
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const toggleScannedItemSelect = (id) => {
    setScannedItems(scannedItems.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const togglePayerForScannedItem = (itemId, personName) => {
    setScannedItems(scannedItems.map(item => {
      if (item.id === itemId) {
        const alreadyAssigned = item.assignedPeople.includes(personName);
        let newAssigned;
        if (alreadyAssigned) {
          if (item.assignedPeople.length === 1) {
            Alert.alert('Warning', 'At least one person must be assigned to this item.');
            return item;
          }
          newAssigned = item.assignedPeople.filter(p => p !== personName);
        } else {
          newAssigned = [...item.assignedPeople, personName];
        }
        return { ...item, assignedPeople: newAssigned };
      }
      return item;
    }));
  };

  const importSelectedItems = () => {
    const selected = scannedItems.filter(item => item.selected);
    if (selected.length === 0) {
      Alert.alert('No Items Selected', 'Please check at least one item to import.');
      return;
    }

    const newItems = selected.map(item => ({
      id: String(Date.now() + Math.random()),
      name: item.name,
      price: item.price,
      assignedPeople: [...item.assignedPeople]
    }));

    setItems([...items, ...newItems]);
    setScannedItems([]);
    Alert.alert('Success!', `Imported ${selected.length} items to your bill list.`);
  };

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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={[styles.label, { marginBottom: 0 }]}>2. Add Bill Item</Text>
                <TouchableOpacity style={styles.scanReceiptBtn} onPress={handleScanReceipt} activeOpacity={0.75}>
                  <Ionicons name="camera-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.scanReceiptBtnText}>Scan Receipt</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.itemInputsRow}>
                <TextInput
                  style={[
                    styles.itemInput,
                    isItemNameFocused && styles.itemInputFocused
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

      {/* SCANNING PROGRESS OVERLAY */}
      {isScanning && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <Ionicons name="scan-outline" size={40} color={COLORS.primary} style={{ marginBottom: 16 }} />
            <Text style={styles.loadingText}>Analyzing Receipt...</Text>
            <Text style={styles.loadingSubtext}>{scanProgress}% complete</Text>
            <Text style={styles.loadingTip}>Tip: High contrast, well-lit photos work best.</Text>
          </View>
        </View>
      )}

      {/* ITEMS IMPORT SELECTION MODAL */}
      {scannedItems.length > 0 && (
        <View style={styles.importModalContainer}>
          <View style={styles.importModalCard}>
            <View style={styles.importModalHeader}>
              <Text style={styles.importModalTitle}>Select Items to Import</Text>
              <TouchableOpacity onPress={() => setScannedItems([])}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.importModalList}>
              {scannedItems.map(item => (
                <View key={item.id} style={styles.importItemCard}>
                  <View style={styles.importItemMainRow}>
                    <TouchableOpacity
                      style={styles.importItemCheckbox}
                      onPress={() => toggleScannedItemSelect(item.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={item.selected ? "checkbox" : "square-outline"}
                        size={20}
                        color={item.selected ? COLORS.primary : COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[
                        styles.importItemName,
                        !item.selected && { color: COLORS.textMuted, textDecorationLine: 'line-through' }
                      ]}>{item.name}</Text>
                      <Text style={[
                        styles.importItemPrice,
                        !item.selected && { color: COLORS.textMuted }
                      ]}>R{item.price.toFixed(2)}</Text>
                    </View>
                  </View>
                  
                  {item.selected && (
                    <View style={styles.importAssignContainer}>
                      <Text style={styles.importAssignLabel}>Split among:</Text>
                      <View style={styles.importAssignChips}>
                        {people.map(p => {
                          const isAssigned = item.assignedPeople.includes(p);
                          return (
                            <TouchableOpacity
                              key={p}
                              style={[
                                styles.importAssignChip,
                                isAssigned && styles.importAssignChipActive
                              ]}
                              onPress={() => togglePayerForScannedItem(item.id, p)}
                              activeOpacity={0.8}
                            >
                              <Text style={[
                                styles.importAssignChipText,
                                isAssigned && styles.importAssignChipTextActive
                              ]}>{p}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.importModalActions}>
              <TouchableOpacity
                style={styles.importConfirmBtn}
                onPress={importSelectedItems}
                activeOpacity={0.85}
              >
                <Text style={styles.importConfirmBtnText}>Import {scannedItems.filter(i => i.selected).length} Items</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 15,
    outlineStyle: 'none',
  },
  itemInput: {
    flex: 2,
    height: 44,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: LAYOUT.borderRadiusSmall,
    borderWidth: 1,
    borderColor: COLORS.border,
    outlineStyle: 'none',
  },
  itemInputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
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
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
  },
  priceInput: {
    flex: 1,
    height: 44,
    color: '#ffffff',
    fontSize: 15,
    paddingLeft: 8,
    outlineStyle: 'none',
  },
  currencySymbol: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 2,
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
  scanReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scanReceiptBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 23, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingBox: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: LAYOUT.borderRadiusLarge,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
    ...SHADOWS.card,
  },
  loadingText: {
    ...FONTS.titleMedium,
    color: '#ffffff',
    marginBottom: 8,
  },
  loadingSubtext: {
    ...FONTS.bodyLarge,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: 12,
  },
  loadingTip: {
    ...FONTS.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  importModalContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 23, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 998,
    padding: 16,
  },
  importModalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadiusLarge,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    maxHeight: '85%',
    ...SHADOWS.card,
  },
  importModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  importModalTitle: {
    ...FONTS.titleMedium,
    color: '#ffffff',
  },
  importModalList: {
    padding: 16,
  },
  importItemCard: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: LAYOUT.borderRadiusMedium,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 12,
  },
  importItemMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  importItemCheckbox: {
    padding: 4,
  },
  importItemName: {
    ...FONTS.titleSmall,
    color: '#ffffff',
  },
  importItemPrice: {
    ...FONTS.bodyMedium,
    color: COLORS.accent,
    fontWeight: '600',
    marginTop: 2,
  },
  importAssignContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  importAssignLabel: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  importAssignChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  importAssignChip: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  importAssignChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: COLORS.primary,
  },
  importAssignChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  importAssignChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  importModalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  importConfirmBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: LAYOUT.borderRadiusMedium,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  importConfirmBtnText: {
    ...FONTS.buttonText,
  },
});
