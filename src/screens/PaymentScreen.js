import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
  Platform
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, LAYOUT, SHADOWS } from '../styles/theme';

export default function PaymentScreen({
  personName,
  amount,
  payerName,
  paymentMethod,
  onSavePaymentMethod,
  onResetPaymentMethod,
  onBack
}) {
  // Local state for configuration form (only used if paymentMethod is null)
  const [selectedType, setSelectedType] = useState('PayShap'); // 'PayShap' | 'BankEFT'
  const [shapID, setShapID] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isInput1Focused, setIsInput1Focused] = useState(false);
  const [isInput2Focused, setIsInput2Focused] = useState(false);

  // Active view tab for the request: 'QR' | 'WhatsApp'
  const [actionTab, setActionTab] = useState('WhatsApp');

  // Handle saving payment details to session
  const handleSave = () => {
    if (selectedType === 'PayShap') {
      if (!shapID.trim()) {
        Alert.alert('Required Info', 'Please enter your ShapID or Cell Number.');
        return;
      }
      onSavePaymentMethod({
        type: 'PayShap',
        details: { shapID: shapID.trim() }
      });
    } else if (selectedType === 'BankEFT') {
      if (!bankName.trim() || !accountNumber.trim()) {
        Alert.alert('Required Info', 'Please enter both Bank Name and Account Number.');
        return;
      }
      onSavePaymentMethod({
        type: 'BankEFT',
        details: {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim()
        }
      });
    }
  };

  // Helper to copy text to clipboard
  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', `${label} copied to clipboard.`);
  };

  // Build details based on the selected method
  let paymentDetailsText = '';
  let paymentLink = '';
  let qrCodeValue = '';
  let whatsappMessage = '';

  if (paymentMethod) {
    const { type, details } = paymentMethod;
    const payerText = payerName ? ` ${payerName}` : '';

    if (type === 'PayShap') {
      // Experimental PayShap URI format
      paymentLink = `payshap://pay?id=${details.shapID}&amount=${amount.toFixed(2)}`;
      qrCodeValue = paymentLink;
      paymentDetailsText = `PayShap ID: ${details.shapID}\nLink (Experimental): ${paymentLink}`;
      whatsappMessage = `Hi ${personName}, you owe${payerText} R${amount.toFixed(2)} for the split. Please pay using PayShap to ShapID: ${details.shapID}. (Link: ${paymentLink})`;
    } else if (type === 'BankEFT') {
      paymentDetailsText = `Bank: ${details.bankName}\nAccount: ${details.accountNumber}\nAmount: R${amount.toFixed(2)}`;
      whatsappMessage = `Hi ${personName}, you owe${payerText} R${amount.toFixed(2)} for the split. Please pay via Bank EFT.\nBank: ${details.bankName}\nAccount Number: ${details.accountNumber}\nAmount: R${amount.toFixed(2)}`;
    }
  }

  // Handle WhatsApp action
  const handleWhatsAppShare = async () => {
    const encodedMsg = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `whatsapp://send?text=${encodedMsg}`;
    const webFallbackUrl = `https://wa.me/?text=${encodedMsg}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to web link wa.me
        await Linking.openURL(webFallbackUrl);
      }
    } catch (err) {
      // If even wa.me fails, let them copy the message
      if (Platform.OS === 'web') {
        window.alert('WhatsApp Not Found\nCould not open WhatsApp. The payment request message has been copied to your clipboard instead.');
        Clipboard.setStringAsync(whatsappMessage);
      } else {
        Alert.alert(
          'WhatsApp Not Found',
          'Could not open WhatsApp. The payment request message has been copied to your clipboard instead.',
          [
            {
              text: 'OK',
              onPress: () => Clipboard.setStringAsync(whatsappMessage)
            }
          ]
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          <Text style={styles.backButtonText}>Summary</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Payment</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Recipient summary banner */}
        <View style={styles.recipientBanner}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {personName ? personName.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.recipientName}>{personName}</Text>
          <Text style={styles.recipientAmount}>Owes R{amount.toFixed(2)}</Text>
        </View>

        {/* SECTION A: PAYMENT METHOD NOT SET -> SETUP FORM */}
        {!paymentMethod ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Set Your Payment Details</Text>
            <Text style={styles.cardDescription}>
              Configure your receiving payment details. You only need to do this once per session.
            </Text>

            {/* Selection Tabs */}
            <View style={styles.methodSelector}>
              {[
                { key: 'PayShap', name: 'PayShap', icon: 'flash-outline' },
                { key: 'BankEFT', name: 'Bank EFT', icon: 'business-outline' }
              ].map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.methodTab,
                    selectedType === m.key && styles.methodTabActive
                  ]}
                  onPress={() => setSelectedType(m.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={m.icon} 
                    size={16} 
                    color={selectedType === m.key ? '#ffffff' : COLORS.textSecondary} 
                    style={{ marginBottom: 4 }}
                  />
                  <Text style={[
                    styles.methodTabText,
                    selectedType === m.key && styles.methodTabTextActive
                  ]}>
                    {m.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedType === 'PayShap' && (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>ShapID or Cell Number</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    isInput1Focused && styles.textInputFocused
                  ]}
                  placeholder="e.g. 0821234567@fnb or 0821234567"
                  placeholderTextColor={COLORS.textMuted}
                  value={shapID}
                  onChangeText={setShapID}
                  onFocus={() => setIsInput1Focused(true)}
                  onBlur={() => setIsInput1Focused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.inputHelper}>
                  Enter your registered ShapID or cell number. We will build an experimental PayShap deep link.
                </Text>
              </View>
            )}

            {selectedType === 'BankEFT' && (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Bank Name</Text>
                <TextInput
                  style={[
                    styles.textInput, 
                    { marginBottom: 12 },
                    isInput1Focused && styles.textInputFocused
                  ]}
                  placeholder="e.g. First National Bank"
                  placeholderTextColor={COLORS.textMuted}
                  value={bankName}
                  onChangeText={setBankName}
                  onFocus={() => setIsInput1Focused(true)}
                  onBlur={() => setIsInput1Focused(false)}
                />

                <Text style={styles.inputLabel}>Account Number</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    isInput2Focused && styles.textInputFocused
                  ]}
                  placeholder="e.g. 62890123456"
                  placeholderTextColor={COLORS.textMuted}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  onFocus={() => setIsInput2Focused(true)}
                  onBlur={() => setIsInput2Focused(false)}
                  keyboardType="number-pad"
                />
                <Text style={styles.inputHelper}>
                  Note: There is no standard QR code deep link for South African EFT. Details will be shown as text.
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>Save and Generate Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* SECTION B: PAYMENT METHOD SET -> SHOW ACTIONS */
          <View>
            {/* Display Configured Method Banner */}
            <View style={styles.configuredBanner}>
              <View style={styles.configuredIconWrapper}>
                <Ionicons 
                  name={
                    paymentMethod.type === 'PayShap' ? 'flash-outline' : 'business-outline'
                  } 
                  size={20} 
                  color={COLORS.primary} 
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.configuredTitle}>
                  Receiving via: <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                    {paymentMethod.type === 'BankEFT' ? 'Bank EFT' : paymentMethod.type}
                  </Text>
                </Text>
                <Text style={styles.configuredDetails} numberOfLines={1}>
                  {paymentMethod.type === 'PayShap' && `ShapID: ${paymentMethod.details.shapID}`}
                  {paymentMethod.type === 'BankEFT' && `${paymentMethod.details.bankName} (${paymentMethod.details.accountNumber})`}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.changeDetailsBtn}
                onPress={onResetPaymentMethod}
                activeOpacity={0.7}
              >
                <Text style={styles.changeDetailsBtnText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* MESSAGE PREVIEW CARD */}
            <View style={styles.messagePreviewCard}>
              <Text style={styles.previewLabel}>Message Preview (WhatsApp)</Text>
              <View style={styles.previewBox}>
                <Text style={styles.previewText}>{whatsappMessage}</Text>
              </View>
            </View>

            {/* PRIMARY WHATSAPP ACTION BUTTON */}
            <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsAppShare} activeOpacity={0.85}>
              <Ionicons name="logo-whatsapp" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.whatsappBtnText}>Send Request via WhatsApp</Text>
            </TouchableOpacity>

            {/* SECONDARY COPY BUTTON */}
            <TouchableOpacity
              style={styles.copyMessageBtn}
              onPress={() => copyToClipboard(whatsappMessage, 'Request message')}
              activeOpacity={0.7}
            >
              <Ionicons name="copy-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.copyMessageBtnText}>Copy Message Text</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  recipientBanner: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    ...SHADOWS.glow,
  },
  avatarLargeText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 26,
  },
  recipientName: {
    ...FONTS.titleMedium,
    fontSize: 22,
    color: '#ffffff',
  },
  recipientAmount: {
    ...FONTS.titleLarge,
    color: COLORS.accent,
    marginTop: 4,
    fontSize: 28,
  },
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: LAYOUT.borderRadiusLarge,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardTitle: {
    ...FONTS.titleSmall,
    color: '#ffffff',
    marginBottom: 6,
  },
  cardDescription: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  methodSelector: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: LAYOUT.borderRadiusMedium,
    padding: 4,
    marginBottom: 20,
  },
  methodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: LAYOUT.borderRadiusMedium - 2,
  },
  methodTabActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.card,
  },
  methodTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  methodTabTextActive: {
    color: '#ffffff',
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    ...FONTS.label,
    fontSize: 11,
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: LAYOUT.borderRadiusSmall,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 15,
  },
  textInputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
  },
  inputHelper: {
    ...FONTS.bodySmall,
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: LAYOUT.borderRadiusMedium,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  saveBtnText: {
    ...FONTS.buttonText,
  },
  configuredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceCard,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: LAYOUT.borderRadiusMedium,
    padding: 14,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  configuredIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  configuredTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  configuredDetails: {
    ...FONTS.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
    fontSize: 11,
  },
  changeDetailsBtn: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeDetailsBtnText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  actionTabsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionTab: {
    flex: 1,
    backgroundColor: COLORS.surfaceCard,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: LAYOUT.borderRadiusMedium,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  actionTabActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.04)',
  },
  actionTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  actionTabTextActive: {
    color: '#ffffff',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  qrCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: LAYOUT.borderRadiusLarge,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    ...SHADOWS.card,
  },
  alertWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderWidth: 1,
    borderRadius: LAYOUT.borderRadiusSmall,
    padding: 10,
    width: '100%',
    marginBottom: 16,
  },
  alertWarningText: {
    ...FONTS.bodySmall,
    color: '#ffffff',
    flex: 1,
    lineHeight: 16,
  },
  qrWrapper: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: LAYOUT.borderRadiusMedium,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  qrLinkText: {
    ...FONTS.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    fontSize: 11,
  },
  copyLinkBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: LAYOUT.borderRadiusSmall,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyLinkBtnText: {
    ...FONTS.bodySmall,
    color: '#ffffff',
    fontWeight: '600',
  },
  noQrCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: LAYOUT.borderRadiusLarge,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    ...SHADOWS.card,
  },
  eftTicketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noQrTitle: {
    ...FONTS.titleSmall,
    color: '#ffffff',
  },
  noQrText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  eftDetailsBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: LAYOUT.borderRadiusMedium,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  eftDetailLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eftLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  eftValue: {
    ...FONTS.bodyMedium,
    color: '#ffffff',
    fontWeight: '600',
  },
  copyDetailsBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: LAYOUT.borderRadiusSmall,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyDetailsBtnText: {
    ...FONTS.bodySmall,
    color: '#ffffff',
    fontWeight: '600',
  },
  whatsappContainer: {
    width: '100%',
    marginTop: 4,
  },
  messagePreviewCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: LAYOUT.borderRadiusLarge,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  previewLabel: {
    ...FONTS.label,
    fontSize: 10,
    marginBottom: 8,
  },
  previewBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: LAYOUT.borderRadiusSmall,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewText: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  whatsappBtn: {
    backgroundColor: '#25D366', // Brand green for WhatsApp
    height: 50,
    borderRadius: LAYOUT.borderRadiusLarge,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOWS.glow,
    shadowColor: '#25D366',
  },
  whatsappBtnText: {
    ...FONTS.buttonText,
    color: '#ffffff',
  },
  copyMessageBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyMessageBtnText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
