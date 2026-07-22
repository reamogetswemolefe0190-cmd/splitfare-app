import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, LAYOUT, SHADOWS } from '../styles/theme';

export default function LandingScreen({ onCreateGroup }) {
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef(null);

  // Responsive breakpoints
  const isDesktop = width > 768;

  // Section positions for scrolling
  const [howItWorksY, setHowItWorksY] = useState(0);
  const [useCasesY, setUseCasesY] = useState(0);

  const scrollToSection = (yOffset) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: yOffset,
        animated: true,
      });
    }
  };

  // Interactive Demo State
  const [billTotal, setBillTotal] = useState('800');
  const [peopleCount, setPeopleCount] = useState('4');
  const [demoResult, setDemoResult] = useState(null);

  const handleDemoCalculate = () => {
    const total = parseFloat(billTotal);
    const people = parseInt(peopleCount);

    if (isNaN(total) || total <= 0) {
      Alert.alert('Invalid Bill', 'Please enter a valid bill amount.');
      return;
    }
    if (isNaN(people) || people <= 0) {
      Alert.alert('Invalid People', 'Please enter a valid number of people.');
      return;
    }

    const share = total / people;
    setDemoResult(share);
  };

  // Watch Demo Modal State
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. NAVIGATION BAR */}
      <View style={styles.navBar}>
        <View style={styles.navLogoContainer}>
          <Ionicons name="calculator" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.navLogoText}>SPLITFARE</Text>
        </View>
        
        {isDesktop && (
          <View style={styles.navLinks}>
            <TouchableOpacity onPress={() => scrollToSection(howItWorksY)} style={styles.navLinkItem}>
              <Text style={styles.navLinkText}>How It Works</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => scrollToSection(useCasesY)} style={styles.navLinkItem}>
              <Text style={styles.navLinkText}>Use Cases</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => Alert.alert('100% Free', 'SplitFare is completely free to use. No hidden fees or subscriptions!')} 
              style={styles.navLinkItem}
            >
              <Text style={styles.navLinkText}>Pricing</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.navBtn} onPress={onCreateGroup} activeOpacity={0.85}>
          <Text style={styles.navBtnText}>Create Group</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 2. HERO SECTION */}
        <View style={[styles.section, styles.heroSection, isDesktop ? styles.rowLayout : styles.columnLayout]}>
          <View style={[styles.heroLeft, isDesktop ? { marginRight: 40 } : { marginBottom: 60 }]}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>INTRODUCING SPLITFARE</Text>
            </View>
            <Text style={[styles.heroTitle, { fontSize: width > 1200 ? 56 : width > 480 ? 44 : 32 }]}>
              Split expenses.{"\n"}Without awkward conversations.
            </Text>
            <Text style={styles.heroSubtitle}>
              Track shared expenses, split bills instantly, and settle up with friends.
            </Text>
            
            <View style={styles.heroCtaRow}>
              <TouchableOpacity style={styles.heroPrimaryBtn} onPress={onCreateGroup} activeOpacity={0.85}>
                <Text style={styles.heroPrimaryBtnText}>Create a Group</Text>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.heroSecondaryBtn} 
                onPress={() => setShowDemoVideo(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="play-circle-outline" size={20} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.heroSecondaryBtnText}>Watch Demo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ratingContainer}>
              <Text style={styles.starsText}>★★★★★</Text>
              <Text style={styles.ratingSubtext}>Used by students, roommates and travellers</Text>
            </View>
          </View>

          {/* PHONE MOCKUP (Right Side) */}
          <View style={styles.heroRight}>
            <View style={styles.phoneMockup}>
              {/* Phone Speaker & Camera notches */}
              <View style={styles.phoneNotch} />
              
              {/* Simulated Screen */}
              <View style={styles.phoneScreen}>
                {/* Phone Status Bar */}
                <View style={styles.phoneStatusBar}>
                  <Text style={styles.statusBarTime}>09:41</Text>
                  <View style={styles.statusBarIcons}>
                    <Ionicons name="wifi" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
                    <Ionicons name="battery-full" size={14} color="#94a3b8" />
                  </View>
                </View>

                {/* Simulated Screen Header */}
                <View style={styles.phoneHeader}>
                  <Text style={styles.phoneTripTitle}>Cape Town Trip</Text>
                  <Text style={styles.phoneTripTotal}>Total Spent: R3,200.00</Text>
                </View>

                {/* Simulated Contributors */}
                <View style={styles.phoneList}>
                  <View style={styles.phoneListItem}>
                    <View style={styles.avatarMini}><Text style={styles.avatarMiniText}>R</Text></View>
                    <Text style={styles.phoneListText}>Rea paid</Text>
                    <Text style={[styles.phoneListAmount, { color: COLORS.accent }]}>R1,500</Text>
                  </View>
                  <View style={styles.phoneListItem}>
                    <View style={styles.avatarMini}><Text style={styles.avatarMiniText}>J</Text></View>
                    <Text style={styles.phoneListText}>John paid</Text>
                    <Text style={styles.phoneListAmount}>R700</Text>
                  </View>
                  <View style={styles.phoneListItem}>
                    <View style={styles.avatarMini}><Text style={styles.avatarMiniText}>S</Text></View>
                    <Text style={styles.phoneListText}>Sarah paid</Text>
                    <Text style={styles.phoneListAmount}>R1,000</Text>
                  </View>
                </View>

                {/* Simulated Settlement Card */}
                <View style={styles.phoneSettlementCard}>
                  <Text style={styles.phoneSettlementTitle}>Settlement Ledger</Text>
                  <View style={styles.phoneSettlementRow}>
                    <Ionicons name="arrow-redo" size={12} color="#ef4444" style={{ marginRight: 6 }} />
                    <Text style={styles.phoneSettlementText}>John owes Rea</Text>
                    <Text style={styles.phoneSettlementValue}>R366</Text>
                  </View>
                  <View style={styles.phoneSettlementRow}>
                    <Ionicons name="arrow-redo" size={12} color="#ef4444" style={{ marginRight: 6 }} />
                    <Text style={styles.phoneSettlementText}>Sarah owes Rea</Text>
                    <Text style={styles.phoneSettlementValue}>R133</Text>
                  </View>

                  <TouchableOpacity style={styles.phoneSettleBtn} activeOpacity={0.8}>
                    <Text style={styles.phoneSettleBtnText}>Settle Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 3. HOW IT WORKS SECTION */}
        <View 
          onLayout={(e) => { setHowItWorksY(e.nativeEvent.layout.y); }}
          style={[styles.section, styles.darkBgSection]}
        >
          <Text style={styles.sectionHeadingLabel}>STEP-BY-STEP</Text>
          <Text style={styles.sectionTitleText}>How It Works</Text>
          
          <View style={[styles.howItWorksGrid, isDesktop ? styles.rowLayout : styles.columnLayout]}>
            <View style={styles.howItWorksCard}>
              <View style={styles.stepIconWrapper}>
                <Ionicons name="people-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.stepTitle}>1. Create Group</Text>
              <Text style={styles.stepDescription}>
                Planning a trip, moving in together, or sharing rent? Start a group in seconds.
              </Text>
            </View>

            <View style={styles.howItWorksCard}>
              <View style={styles.stepIconWrapper}>
                <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.stepTitle}>2. Add Expenses</Text>
              <Text style={styles.stepDescription}>
                Enter item totals, add who paid for them, and specify how much they cost.
              </Text>
            </View>

            <View style={styles.howItWorksCard}>
              <View style={styles.stepIconWrapper}>
                <Ionicons name="git-compare-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.stepTitle}>3. Split Automatically</Text>
              <Text style={styles.stepDescription}>
                Split equally among all members or customize individual contributions.
              </Text>
            </View>

            <View style={styles.howItWorksCard}>
              <View style={styles.stepIconWrapper}>
                <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.stepTitle}>4. Settle Up</Text>
              <Text style={styles.stepDescription}>
                See exactly who owes who, and request splits instantly via deep linked chat.
              </Text>
            </View>
          </View>
        </View>

        {/* 4. INTERACTIVE SPLIT DEMO SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeadingLabel}>EXPERIENCE THE CALCULATOR</Text>
          <Text style={styles.sectionTitleText}>Try An Interactive Split</Text>

          <View style={[styles.demoCard, { alignSelf: 'center', width: isDesktop ? 500 : '100%' }]}>
            <Text style={styles.demoCardTitle}>Dinner Bill Splitter</Text>
            
            <View style={styles.demoInputGroup}>
              <Text style={styles.demoInputLabel}>Dinner Bill Total</Text>
              <View style={styles.demoPriceInputBox}>
                <Text style={styles.demoCurrency}>R</Text>
                <TextInput
                  style={styles.demoInput}
                  value={billTotal}
                  onChangeText={setBillTotal}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            <View style={[styles.demoInputGroup, { marginTop: 16 }]}>
              <Text style={styles.demoInputLabel}>Number of Guests</Text>
              <TextInput
                style={styles.demoTextfield}
                value={peopleCount}
                onChangeText={setPeopleCount}
                keyboardType="numeric"
                placeholder="e.g. 4"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <TouchableOpacity 
              style={styles.demoCalcBtn} 
              onPress={handleDemoCalculate}
              activeOpacity={0.85}
            >
              <Text style={styles.demoCalcBtnText}>Calculate Split</Text>
            </TouchableOpacity>

            {demoResult !== null && (
              <View style={styles.demoResultContainer}>
                <Text style={styles.demoResultLabel}>Each Person Owes</Text>
                <Text style={styles.demoResultValue}>R {demoResult.toFixed(2)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 5. BENEFITS SECTION */}
        <View style={[styles.section, styles.darkBgSection]}>
          <Text style={styles.sectionHeadingLabel}>WHY CHOOSE US</Text>
          <Text style={styles.sectionTitleText}>Features Designed For Real Life</Text>

          <View style={styles.benefitsGrid}>
            <View style={[styles.benefitCard, isDesktop ? { width: '48%' } : { width: '100%' }]}>
              <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} style={{ marginBottom: 16 }} />
              <Text style={styles.benefitTitle}>Stop Chasing People</Text>
              <Text style={styles.benefitDesc}>
                Know exactly who owes what at a single glance. No more awkward text messages or phone calls.
              </Text>
            </View>

            <View style={[styles.benefitCard, isDesktop ? { width: '48%' } : { width: '100%' }]}>
              <Ionicons name="bar-chart" size={32} color={COLORS.primary} style={{ marginBottom: 16 }} />
              <Text style={styles.benefitTitle}>No More Spreadsheets</Text>
              <Text style={styles.benefitDesc}>
                Everything is calculated automatically inside our app. Focus on having fun, not compiling cells.
              </Text>
            </View>

            <View style={[styles.benefitCard, isDesktop ? { width: '48%' } : { width: '100%' }]}>
              <Ionicons name="git-merge" size={32} color={COLORS.primary} style={{ marginBottom: 16 }} />
              <Text style={styles.benefitTitle}>Fair Splits</Text>
              <Text style={styles.benefitDesc}>
                Split dinners, trip fuels, or rents equally or customize contributions based on stops and consumption.
              </Text>
            </View>

            <View style={[styles.benefitCard, isDesktop ? { width: '48%' } : { width: '100%' }]}>
              <Ionicons name="grid" size={32} color={COLORS.primary} style={{ marginBottom: 16 }} />
              <Text style={styles.benefitTitle}>Perfect For Groups</Text>
              <Text style={styles.benefitDesc}>
                Engineered for holidays, flatmates, dinner outings, concerts, events, and family splits.
              </Text>
            </View>
          </View>
        </View>

        {/* 6. USE CASES SECTION */}
        <View 
          onLayout={(e) => { setUseCasesY(e.nativeEvent.layout.y); }}
          style={styles.section}
        >
          <Text style={styles.sectionHeadingLabel}>USE CASES</Text>
          <Text style={styles.sectionTitleText}>Built For Every Occasion</Text>

          <View style={[styles.useCasesGrid, isDesktop ? styles.rowLayout : styles.columnLayout]}>
            <View style={styles.useCaseCard}>
              <Text style={styles.useCaseEmoji}>✈</Text>
              <Text style={styles.useCaseTitle}>Travel</Text>
              <Text style={styles.useCaseDesc}>Track holiday expenses, Airbnb shares, and fuel split ledgers on road trips.</Text>
            </View>

            <View style={styles.useCaseCard}>
              <Text style={styles.useCaseEmoji}>🏠</Text>
              <Text style={styles.useCaseTitle}>Roommates</Text>
              <Text style={styles.useCaseDesc}>Split monthly rents, utility bills, grocer bills, and house repairs seamlessly.</Text>
            </View>

            <View style={styles.useCaseCard}>
              <Text style={styles.useCaseEmoji}>🍔</Text>
              <Text style={styles.useCaseTitle}>Dining</Text>
              <Text style={styles.useCaseDesc}>Split restaurant checks, drinks tabs, tax rates, and tips cleanly among friends.</Text>
            </View>

            <View style={styles.useCaseCard}>
              <Text style={styles.useCaseEmoji}>🎉</Text>
              <Text style={styles.useCaseTitle}>Events</Text>
              <Text style={styles.useCaseDesc}>Manage tickets, drinks lists, birthday planning tabs, and shared concert costs.</Text>
            </View>
          </View>
        </View>

        {/* 7. SOCIAL PROOF SECTION */}
        <View style={[styles.section, styles.darkBgSection]}>
          <Text style={styles.sectionHeadingLabel}>TRUST & DESIGN</Text>
          <Text style={styles.sectionTitleText}>Loved By Social Groups</Text>
          <Text style={styles.socialProofLead}>Built for students, roommates and friend groups.</Text>

          <View style={[styles.proofCardsGrid, isDesktop ? styles.rowLayout : styles.columnLayout]}>
            <View style={styles.proofCard}>
              <Text style={styles.proofCardTitle}>Fast</Text>
              <Text style={styles.proofCardDesc}>Add expenses and split the check in less than 5 seconds.</Text>
            </View>
            <View style={styles.proofCard}>
              <Text style={styles.proofCardTitle}>Simple</Text>
              <Text style={styles.proofCardDesc}>Zero registration or logins required. Run splits instantly.</Text>
            </View>
            <View style={styles.proofCard}>
              <Text style={styles.proofCardTitle}>Transparent</Text>
              <Text style={styles.proofCardDesc}>Clear math equations shown cleanly to every passenger.</Text>
            </View>
          </View>
        </View>

        {/* 8. FINAL CTA SECTION */}
        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>Ready to stop arguing about money?</Text>
          <Text style={styles.ctaSubtitle}>Create your first group in less than a minute.</Text>
          <TouchableOpacity style={styles.ctaPrimaryBtn} onPress={onCreateGroup} activeOpacity={0.85}>
            <Text style={styles.ctaPrimaryBtnText}>Start Splitting Expenses</Text>
          </TouchableOpacity>
        </View>

        {/* 9. FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>SPLITFARE</Text>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} SplitFare. Built for simple group finance. All session data resides in your device's memory.
          </Text>
        </View>
      </ScrollView>

      {/* WATCH DEMO OVERLAY MODAL */}
      {showDemoVideo && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SplitFare Demo Walkthrough</Text>
              <TouchableOpacity onPress={() => setShowDemoVideo(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Ionicons name="play" size={60} color={COLORS.primary} style={{ alignSelf: 'center', marginVertical: 40 }} />
              <Text style={styles.modalText}>
                SplitFare lets you split rent, trip costs, and dinner tabs in real-time. Just enter your group names, input your items, and click calculate. Select who paid, configure PayShap or Bank EFT details, and tap "Request" to generate a pre-filled WhatsApp check!
              </Text>
            </View>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowDemoVideo(false)}>
              <Text style={styles.modalBtnText}>Got it, let's start!</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 70,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  navLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLogoText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLinkItem: {
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  navLinkText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  navBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingVertical: 120, // Double spacing as requested!
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  darkBgSection: {
    backgroundColor: COLORS.surface,
  },
  rowLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  columnLayout: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroSection: {
    paddingTop: 80,
    paddingBottom: 120,
  },
  heroLeft: {
    flex: 1.2,
    alignItems: 'flex-start',
  },
  heroBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#ffffff',
    fontWeight: '800',
    lineHeight: 48,
    marginBottom: 20,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 32,
  },
  heroCtaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  heroPrimaryBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  heroPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: COLORS.border,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  heroSecondaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  starsText: {
    color: '#fbbf24',
    fontSize: 16,
    letterSpacing: 2,
  },
  ratingSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  heroRight: {
    flex: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneMockup: {
    width: 300,
    height: 580,
    backgroundColor: '#1e293b',
    borderRadius: 36,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
    ...SHADOWS.card,
  },
  phoneNotch: {
    width: 100,
    height: 18,
    backgroundColor: '#0f172a',
    alignSelf: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    position: 'absolute',
    top: 8,
    zIndex: 100,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#0a0b12',
    borderRadius: 28,
    padding: 16,
    overflow: 'hidden',
  },
  phoneStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 20,
    marginBottom: 16,
  },
  statusBarTime: {
    color: '#f1f5f9',
    fontSize: 11,
    fontWeight: '600',
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneHeader: {
    marginBottom: 20,
  },
  phoneTripTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  phoneTripTotal: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  phoneList: {
    gap: 8,
    marginBottom: 20,
  },
  phoneListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141322',
    borderWidth: 1,
    borderColor: '#1f1b33',
    borderRadius: 8,
    padding: 10,
  },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarMiniText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  phoneListText: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 13,
  },
  phoneListAmount: {
    fontSize: 13,
    color: '#f8fafc',
    fontWeight: '600',
  },
  phoneSettlementCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderColor: 'rgba(124, 58, 237, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  phoneSettlementTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  phoneSettlementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  phoneSettlementText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  phoneSettlementValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  phoneSettleBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  phoneSettleBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeadingLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 60,
  },
  howItWorksGrid: {
    width: '100%',
    maxWidth: 1100,
    gap: 20,
    alignSelf: 'center',
  },
  howItWorksCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24, // Consistent R24 corners
    padding: 24,
    alignItems: 'flex-start',
    ...SHADOWS.card,
  },
  stepIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 10,
  },
  stepDescription: {
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontSize: 13,
  },
  demoCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 30,
    ...SHADOWS.card,
  },
  demoCardTitle: {
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  demoInputGroup: {
    width: '100%',
  },
  demoInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  demoPriceInputBox: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  demoCurrency: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  demoInput: {
    flex: 1,
    height: '100%',
    color: '#ffffff',
    fontSize: 15,
    paddingLeft: 8,
    outlineStyle: 'none',
  },
  demoTextfield: {
    height: 48,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 15,
    outlineStyle: 'none',
  },
  demoCalcBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    ...SHADOWS.glow,
  },
  demoCalcBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  demoResultContainer: {
    marginTop: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  demoResultLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  demoResultValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1100,
    justifyContent: 'center',
  },
  benefitCard: {
    backgroundColor: COLORS.surfaceCard,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 30,
  },
  benefitTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 10,
  },
  benefitDesc: {
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontSize: 13,
  },
  useCasesGrid: {
    width: '100%',
    maxWidth: 1100,
    gap: 20,
    alignSelf: 'center',
  },
  useCaseCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  useCaseEmoji: {
    fontSize: 32,
    marginBottom: 16,
  },
  useCaseTitle: {
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 15,
  },
  useCaseDesc: {
    color: COLORS.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
    fontSize: 13,
  },
  socialProofLead: {
    color: COLORS.textSecondary,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  proofCardsGrid: {
    width: '100%',
    maxWidth: 1100,
    gap: 20,
    alignSelf: 'center',
  },
  proofCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
  },
  proofCardTitle: {
    color: '#ffffff',
    fontWeight: '800',
    marginBottom: 12,
    fontSize: 20,
  },
  proofCardDesc: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 13,
  },
  ctaSection: {
    paddingVertical: 140,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ctaTitle: {
    fontSize: 38,
    color: '#ffffff',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaSubtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 16,
  },
  ctaPrimaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignSelf: 'center',
    ...SHADOWS.glow,
  },
  ctaPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerLogo: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  footerText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 12,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 11, 18, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    ...SHADOWS.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalText: {
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontSize: 14,
  },
  modalBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
