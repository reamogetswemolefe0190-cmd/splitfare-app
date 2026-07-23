import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, LAYOUT, SHADOWS } from '../styles/theme';

export default function LandingScreen({ onCreateGroup }) {
  const { width, height } = useWindowDimensions();
  const scrollViewRef = useRef(null);

  // Responsive breakpoints
  const isDesktop = width > 768;

  // Layout Y positions for scrolling
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

  // Hero Phone float animation (8-second loop translateY: 0 -> -6 -> 0)
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const floatSequence = Animated.sequence([
      Animated.timing(floatAnim, {
        toValue: -6,
        duration: 4000,
        useNativeDriver: true,
      }),
      Animated.timing(floatAnim, {
        toValue: 0,
        duration: 4000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(floatSequence).start();
  }, [floatAnim]);

  // Interactive Demo State
  const [demoSplitType, setDemoSplitType] = useState('Dinner'); // 'Dinner' | 'Trip' | 'Rent' | 'Event'
  const [demoAmount, setDemoAmount] = useState('800');
  const [demoGuests, setDemoGuests] = useState('4');
  const [demoPayer, setDemoPayer] = useState('Rea');
  const [demoCalculating, setDemoCalculating] = useState(false);
  const [demoShowResults, setDemoShowResults] = useState(false);

  // Count-up animation value for splits
  const [animatedShare, setAnimatedShare] = useState(0);

  const handleDemoSplit = () => {
    const amt = parseFloat(demoAmount);
    const guests = parseInt(demoGuests);

    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Bill', 'Please enter a valid amount.');
      return;
    }
    if (isNaN(guests) || guests <= 1) {
      Alert.alert('Invalid Guests', 'Please enter a valid number of guests (at least 2).');
      return;
    }

    setDemoCalculating(true);
    setDemoShowResults(false);

    // Simulate network/calculating delay (1 second)
    setTimeout(() => {
      setDemoCalculating(false);
      setDemoShowResults(true);

      const targetShare = amt / guests;
      // Smooth count up animation
      let currentVal = 0;
      const step = targetShare / 25;
      const interval = setInterval(() => {
        currentVal += step;
        if (currentVal >= targetShare) {
          setAnimatedShare(targetShare);
          clearInterval(interval);
        } else {
          setAnimatedShare(currentVal);
        }
      }, 20);
    }, 1000);
  };

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
              onPress={() => Alert.alert('100% Free', 'SplitFare is completely free. We do not charge anything for group ledger splits.')} 
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
        {/* 2. HERO SECTION (100vh height approximation for web) */}
        <View style={[
          styles.heroSection, 
          isDesktop ? styles.rowLayout : styles.columnLayout,
          Platform.OS === 'web' && isDesktop && { minHeight: height - 70 }
        ]}>
          {/* Subtle Radial Gradient overlay */}
          <View style={styles.heroGradientOverlay} />

          <View style={[styles.heroLeft, isDesktop ? { marginRight: 40 } : { marginBottom: 60 }]}>
            <Text style={[styles.heroTitle, { fontSize: width > 1200 ? 64 : width > 480 ? 48 : 36 }]}>
              Stop calculating{"\n"}who owes who.
            </Text>
            <Text style={styles.heroSubtitle}>
              SplitFare tracks shared expenses, calculates settlements instantly, and keeps everyone accountable.
            </Text>
            
            <View style={styles.heroCtaRow}>
              <TouchableOpacity style={styles.heroPrimaryBtn} onPress={onCreateGroup} activeOpacity={0.85}>
                <Text style={styles.heroPrimaryBtnText}>Start Splitting</Text>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.heroSecondaryBtn} 
                onPress={() => scrollToSection(howItWorksY)}
                activeOpacity={0.8}
              >
                <Text style={styles.heroSecondaryBtnText}>Try Demo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FLOATING PHONE MOCKUP (occupies 60% visual space on desktop) */}
          <View style={[styles.heroRight, isDesktop ? { flex: 1.5 } : { width: '100%' }]}>
            <Animated.View style={[styles.phoneMockupContainer, { transform: [{ translateY: floatAnim }] }]}>
              <View style={styles.phoneMockup}>
                {/* Phone Speaker Notch */}
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

                  {/* Phone Header */}
                  <View style={styles.phoneHeader}>
                    <Text style={styles.phoneTripTitle}>Cape Town Weekend</Text>
                    <Text style={styles.phoneTripTotal}>Total Expenses</Text>
                    <Text style={styles.phoneTripTotalVal}>R4,200</Text>
                  </View>

                  {/* Contributors Ledger */}
                  <View style={styles.phoneList}>
                    <View style={styles.phoneListItem}>
                      <Text style={styles.phoneListText}><Text style={{ fontWeight: '700' }}>Rea</Text> paid</Text>
                      <Text style={[styles.phoneListAmount, { color: COLORS.accent }]}>R2,500</Text>
                    </View>
                    <View style={styles.phoneListItem}>
                      <Text style={styles.phoneListText}><Text style={{ fontWeight: '700' }}>John</Text> paid</Text>
                      <Text style={styles.phoneListAmount}>R900</Text>
                    </View>
                    <View style={styles.phoneListItem}>
                      <Text style={styles.phoneListText}><Text style={{ fontWeight: '700' }}>Sarah</Text> paid</Text>
                      <Text style={styles.phoneListAmount}>R800</Text>
                    </View>
                  </View>

                  {/* Settlement Card */}
                  <View style={styles.phoneSettlementCard}>
                    <Text style={styles.phoneSettlementTitle}>Settlement</Text>
                    <View style={styles.phoneSettlementRow}>
                      <Text style={styles.phoneSettlementText}>John owes Rea</Text>
                      <Text style={styles.phoneSettlementValue}>R500</Text>
                    </View>
                    <View style={styles.phoneSettlementRow}>
                      <Text style={styles.phoneSettlementText}>Sarah owes Rea</Text>
                      <Text style={styles.phoneSettlementValue}>R600</Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View style={styles.phoneStatusBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.accent} style={{ marginRight: 4 }} />
                    <Text style={styles.phoneStatusText}>Ready to settle</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>

        {/* 3. INTERACTIVE DEMO (THE CENTERPIECE) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeadingLabel}>INTERACTIVE DEMO</Text>
          <Text style={styles.sectionTitleText}>Experience SplitFare Live</Text>

          <View style={[styles.demoOuterCard, isDesktop ? { width: 680 } : { width: '100%' }]}>
            <Text style={styles.demoCardHeader}>Quick Splitting Sandbox</Text>
            
            <View style={isDesktop ? styles.demoGridRow : styles.demoGridColumn}>
              {/* Left Form */}
              <View style={{ flex: 1, gap: 16 }}>
                {/* Split Type Selector */}
                <View style={styles.demoInputGroup}>
                  <Text style={styles.demoLabel}>What are you splitting?</Text>
                  <View style={styles.demoSplitSelector}>
                    {['Dinner', 'Trip', 'Rent', 'Event'].map(type => (
                      <TouchableOpacity 
                        key={type}
                        style={[styles.demoSplitTab, demoSplitType === type && styles.demoSplitTabActive]}
                        onPress={() => setDemoSplitType(type)}
                      >
                        <Text style={[styles.demoSplitTabText, demoSplitType === type && styles.demoSplitTabTextActive]}>
                          {type === 'Dinner' ? '🍔 Dinner' : type === 'Trip' ? '✈ Trip' : type === 'Rent' ? '🏠 Rent' : '🎉 Event'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Amount */}
                <View style={styles.demoInputGroup}>
                  <Text style={styles.demoLabel}>How much was spent?</Text>
                  <View style={styles.demoPriceBox}>
                    <Text style={styles.demoCurrency}>R</Text>
                    <TextInput 
                      style={styles.demoTextfield}
                      value={demoAmount}
                      onChangeText={setDemoAmount}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* People Count */}
                <View style={styles.demoInputGroup}>
                  <Text style={styles.demoLabel}>How many people?</Text>
                  <TextInput 
                    style={styles.demoInputSimple}
                    value={demoGuests}
                    onChangeText={setDemoGuests}
                    keyboardType="numeric"
                  />
                </View>

                {/* Who Paid */}
                <View style={styles.demoInputGroup}>
                  <Text style={styles.demoLabel}>Who paid?</Text>
                  <View style={styles.demoSplitSelector}>
                    {['Rea', 'John', 'Sarah'].map(p => (
                      <TouchableOpacity 
                        key={p}
                        style={[styles.demoPayerTab, demoPayer === p && styles.demoPayerTabActive]}
                        onPress={() => setDemoPayer(p)}
                      >
                        <Text style={[styles.demoPayerTabText, demoPayer === p && styles.demoPayerTabTextActive]}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity style={styles.demoCalcBtn} onPress={handleDemoSplit} activeOpacity={0.85}>
                  <Text style={styles.demoCalcBtnText}>Calculate</Text>
                </TouchableOpacity>
              </View>

              {/* Right Output Area */}
              <View style={[styles.demoOutputPanel, !isDesktop && { marginTop: 24 }]}>
                {demoCalculating ? (
                  <View style={styles.demoStatusBox}>
                    <Text style={styles.demoStatusText}>Calculating...</Text>
                  </View>
                ) : demoShowResults ? (
                  <View style={styles.demoResultsBox}>
                    <Text style={styles.demoResultsHeader}>Settlements</Text>
                    {['John', 'Sarah', 'Mike', 'Kate'].filter(p => p !== demoPayer).slice(0, parseInt(demoGuests) - 1).map((p, idx) => (
                      <View key={p} style={styles.demoResultRow}>
                        <Ionicons name="arrow-redo" size={14} color="#ef4444" style={{ marginRight: 6 }} />
                        <Text style={styles.demoResultText}>{p} owes {demoPayer}</Text>
                        <Text style={styles.demoResultValue}>R {animatedShare.toFixed(2)}</Text>
                      </View>
                    ))}
                    <View style={styles.demoResultSuccess}>
                      <Ionicons name="checkmark-done" size={16} color={COLORS.accent} style={{ marginRight: 6 }} />
                      <Text style={styles.demoResultSuccessText}>Values split automatically</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.demoPlaceholderBox}>
                    <Ionicons name="sparkles" size={32} color={COLORS.primary} style={{ marginBottom: 12 }} />
                    <Text style={styles.demoPlaceholderText}>Enter split values and click calculate to test settlements.</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* 5. HOW IT WORKS SECTION (TIMELINE LAYOUT) */}
        <View 
          onLayout={(e) => { setHowItWorksY(e.nativeEvent.layout.y); }}
          style={[styles.section, styles.darkBgSection]}
        >
          <Text style={styles.sectionHeadingLabel}>TIMELINE</Text>
          <Text style={styles.sectionTitleText}>How It Works</Text>

          {/* Timeline Wrapper */}
          <View style={[styles.timelineContainer, isDesktop ? styles.rowLayout : styles.columnLayout]}>
            {/* Node 1 */}
            <View style={styles.timelineNode}>
              <View style={styles.timelineIconBox}>
                <Ionicons name="people" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.timelineNodeTitle}>Create Group</Text>
              <Text style={styles.timelineNodeText}>Start a group for trips, roommates or events.</Text>
            </View>

            {isDesktop && <View style={styles.timelineArrow}><Ionicons name="arrow-forward" size={18} color={COLORS.primary} /></View>}

            {/* Node 2 */}
            <View style={styles.timelineNode}>
              <View style={styles.timelineIconBox}>
                <Ionicons name="card" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.timelineNodeTitle}>Add Expenses</Text>
              <Text style={styles.timelineNodeText}>Record who paid and how much.</Text>
            </View>

            {isDesktop && <View style={styles.timelineArrow}><Ionicons name="arrow-forward" size={18} color={COLORS.primary} /></View>}

            {/* Node 3 */}
            <View style={styles.timelineNode}>
              <View style={styles.timelineIconBox}>
                <Ionicons name="git-compare" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.timelineNodeTitle}>Split Automatically</Text>
              <Text style={styles.timelineNodeText}>Split equally or customize shares.</Text>
            </View>

            {isDesktop && <View style={styles.timelineArrow}><Ionicons name="arrow-forward" size={18} color={COLORS.primary} /></View>}

            {/* Node 4 */}
            <View style={styles.timelineNode}>
              <View style={styles.timelineIconBox}>
                <Ionicons name="cash" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.timelineNodeTitle}>Settle Up</Text>
              <Text style={styles.timelineNodeText}>Know exactly who owes who.</Text>
            </View>
          </View>
        </View>

        {/* 6. USE CASES SECTION (2x2 GRID) */}
        <View 
          onLayout={(e) => { setUseCasesY(e.nativeEvent.layout.y); }}
          style={styles.section}
        >
          <Text style={styles.sectionHeadingLabel}>USE CASES</Text>
          <Text style={styles.sectionTitleText}>Built For Every Occasion</Text>

          <View style={styles.useCases2x2}>
            <View style={[styles.useCaseCardPremium, isDesktop ? { width: '48%' } : { width: '100%' }]}>
              <View style={styles.useCaseHeaderRow}>
                <Text style={styles.useCaseTitleTextPremium}>Travel</Text>
                <Text style={styles.useCaseEmojiPremium}>✈</Text>
              </View>
              <Text style={styles.useCaseDescPremium}>Track holiday expenses without spreadsheets.</Text>
            </View>

            <View style={[styles.useCaseCardPremium, isDesktop ? { width: '48%' } : { width: '100%' }]}>
              <View style={styles.useCaseHeaderRow}>
                <Text style={styles.useCaseTitleTextPremium}>Roommates</Text>
                <Text style={styles.useCaseEmojiPremium}>🏠</Text>
              </View>
              <Text style={styles.useCaseDescPremium}>Split rent, groceries and utilities.</Text>
            </View>

            <View style={[styles.useCaseCardPremium, isDesktop ? { width: '48%' } : { width: '100%' }]}>
              <View style={styles.useCaseHeaderRow}>
                <Text style={styles.useCaseTitleTextPremium}>Dining</Text>
                <Text style={styles.useCaseEmojiPremium}>🍔</Text>
              </View>
              <Text style={styles.useCaseDescPremium}>One friend pays. Everyone settles later.</Text>
            </View>

            <View style={[styles.useCaseCardPremium, isDesktop ? { width: '48%' } : { width: '100%' }]}>
              <View style={styles.useCaseHeaderRow}>
                <Text style={styles.useCaseTitleTextPremium}>Events</Text>
                <Text style={styles.useCaseEmojiPremium}>🎉</Text>
              </View>
              <Text style={styles.useCaseDescPremium}>Manage group spending for parties and outings.</Text>
            </View>
          </View>
        </View>

        {/* 7. TRUST SECTION (PRODUCT PRINCIPLES) */}
        <View style={[styles.section, styles.darkBgSection]}>
          <Text style={styles.sectionHeadingLabel}>PRINCIPLES</Text>
          <Text style={styles.sectionTitleText}>Built For Transparency</Text>

          <View style={[styles.trustGridRow, isDesktop ? styles.rowLayout : styles.columnLayout]}>
            <View style={styles.trustCard}>
              <Ionicons name="flash-outline" size={24} color={COLORS.primary} style={{ marginBottom: 12 }} />
              <Text style={styles.trustCardTitle}>No complicated setup</Text>
              <Text style={styles.trustCardDesc}>No registration, email validation or logins needed. Split instantly.</Text>
            </View>

            <View style={styles.trustCard}>
              <Ionicons name="calculator-outline" size={24} color={COLORS.primary} style={{ marginBottom: 12 }} />
              <Text style={styles.trustCardTitle}>Instant calculations</Text>
              <Text style={styles.trustCardDesc}>Your ledgers and splits calculate in real-time as you enter items.</Text>
            </View>

            <View style={styles.trustCard}>
              <Ionicons name="chatbox-outline" size={24} color={COLORS.primary} style={{ marginBottom: 12 }} />
              <Text style={styles.trustCardTitle}>Clear settlements</Text>
              <Text style={styles.trustCardDesc}>WhatsApp deep links compose requesting messages without friction.</Text>
            </View>

            <View style={styles.trustCard}>
              <Ionicons name="people-circle-outline" size={24} color={COLORS.primary} style={{ marginBottom: 12 }} />
              <Text style={styles.trustCardTitle}>Designed for groups</Text>
              <Text style={styles.trustCardDesc}>Easily split costs evenly or customise percentages by person.</Text>
            </View>
          </View>
        </View>

        {/* 8. FINAL CTA SECTION (DARK BACKGROUND, TYPOGRAPHY) */}
        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>Ready to stop{"\n"}chasing people for money?</Text>
          <Text style={styles.ctaSubtitle}>Create your first expense group in under a minute.</Text>
          <TouchableOpacity style={styles.ctaPrimaryBtn} onPress={onCreateGroup} activeOpacity={0.85}>
            <Text style={styles.ctaPrimaryBtnText}>Start Splitting</Text>
          </TouchableOpacity>
        </View>

        {/* 9. FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>SPLITFARE</Text>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} SplitFare. Built for transparent, free calculations. No tracking telemetry, no cloud accounts, absolute privacy.
          </Text>
        </View>
      </ScrollView>
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
    paddingVertical: 140, // Expanded breathing room as requested!
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
    position: 'relative',
    overflow: 'hidden',
  },
  heroGradientOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    // Native fallback structure for radial gradient
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        backgroundImage: 'radial-gradient(circle at top right, rgba(124,58,237,0.12), transparent 60%)',
      }
    })
  },
  heroLeft: {
    flex: 1,
    alignItems: 'flex-start',
    zIndex: 2,
  },
  heroTitle: {
    color: '#ffffff',
    fontWeight: '800',
    lineHeight: 56,
    marginBottom: 20,
    letterSpacing: -1,
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
  },
  heroPrimaryBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 8,
  },
  heroPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: COLORS.border,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 8,
  },
  heroSecondaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  heroRight: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  phoneMockupContainer: {
    width: '100%',
    alignItems: 'center',
  },
  phoneMockup: {
    width: 300,
    height: 580,
    backgroundColor: '#16152b',
    borderRadius: 36,
    padding: 8,
    borderWidth: 1,
    borderColor: '#2d274c',
    ...SHADOWS.card,
  },
  phoneNotch: {
    width: 100,
    height: 18,
    backgroundColor: '#0a0b12',
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
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  phoneTripTotalVal: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  phoneList: {
    gap: 8,
    marginBottom: 20,
  },
  phoneListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#141322',
    borderWidth: 1,
    borderColor: '#1f1b33',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  phoneListText: {
    color: '#f8fafc',
    fontSize: 13,
  },
  phoneListAmount: {
    fontSize: 13,
    color: '#f8fafc',
    fontWeight: '700',
  },
  phoneSettlementCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    borderColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  phoneSettlementTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  phoneSettlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  phoneSettlementText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  phoneSettlementValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  phoneStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },
  phoneStatusText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
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
  // FROSTED GLASS CARDS (Light glass backing pop)
  demoOuterCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Light glass backing as specified!
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderWidth: 1,
    borderRadius: 28, // R28 rounded corners
    padding: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08, // Subtle soft shadow
    shadowRadius: 60,
    elevation: 8,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
      }
    })
  },
  demoCardHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a', // Deep dark slate for contrast on light glass
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  demoGridRow: {
    flexDirection: 'row',
    gap: 30,
  },
  demoGridColumn: {
    flexDirection: 'column',
  },
  demoInputGroup: {
    width: '100%',
  },
  demoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569', // Muted slate gray
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  demoSplitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  demoSplitTab: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  demoSplitTabActive: {
    backgroundColor: '#7c3aed', // Purple Brand active highlight
    borderColor: '#7c3aed',
  },
  demoSplitTabText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  demoSplitTabTextActive: {
    color: '#ffffff',
  },
  demoPayerTab: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  demoPayerTabActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  demoPayerTabText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  demoPayerTabTextActive: {
    color: '#ffffff',
  },
  demoPriceBox: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 12,
  },
  demoCurrency: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  demoTextfield: {
    flex: 1,
    height: '100%',
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
    paddingLeft: 4,
    outlineStyle: 'none',
  },
  demoInputSimple: {
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 12,
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
    outlineStyle: 'none',
  },
  demoCalcBtn: {
    backgroundColor: '#7c3aed',
    height: 46,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  demoCalcBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  // Demo Output Right Panel
  demoOutputPanel: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    padding: 20,
    justifyContent: 'center',
    minHeight: 250,
  },
  demoPlaceholderBox: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  demoPlaceholderText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  demoStatusBox: {
    alignItems: 'center',
  },
  demoStatusText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '700',
  },
  demoResultsBox: {
    width: '100%',
  },
  demoResultsHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    paddingBottom: 6,
  },
  demoResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  demoResultText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  demoResultValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
  demoResultSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  demoResultSuccessText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  // TIMELINE HOW IT WORKS
  timelineContainer: {
    width: '100%',
    maxWidth: 1100,
    gap: 20,
    alignSelf: 'center',
  },
  timelineNode: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
      }
    })
  },
  timelineIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineNodeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  timelineNodeText: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
  },
  timelineArrow: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  // 2x2 USE CASES GRID
  useCases2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1100,
    justifyContent: 'center',
  },
  useCaseCardPremium: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderWidth: 1,
    borderRadius: 28,
    padding: 30,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
      }
    })
  },
  useCaseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  useCaseTitleTextPremium: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  useCaseEmojiPremium: {
    fontSize: 24,
  },
  useCaseDescPremium: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  // TRUST SECTION PRINCIPLES
  trustGridRow: {
    width: '100%',
    maxWidth: 1100,
    gap: 20,
    alignSelf: 'center',
  },
  trustCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 28,
    padding: 30,
    alignItems: 'flex-start',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
      }
    })
  },
  trustCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  trustCardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  // CTA SECTION (DARK BACKGROUND)
  ctaSection: {
    paddingVertical: 140,
    backgroundColor: '#0a0b12',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ctaTitle: {
    color: '#ffffff',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  ctaSubtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 16,
  },
  ctaPrimaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 8,
    alignSelf: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
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
});
