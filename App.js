import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Platform, useWindowDimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './src/styles/theme';
import LandingScreen from './src/screens/LandingScreen';
import HomeScreen from './src/screens/HomeScreen';
import TripScreen from './src/screens/TripScreen';
import DinnerScreen from './src/screens/DinnerScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import PaymentScreen from './src/screens/PaymentScreen';

export default function App() {
  const { width } = useWindowDimensions();
  const [fontsLoaded] = useFonts({
    Ionicons: require('./assets/fonts/Ionicons.ttf'),
  });

  // Navigation stack state
  const [currentScreen, setCurrentScreen] = useState(Platform.OS === 'web' ? 'LANDING' : 'HOME'); // 'LANDING' | 'HOME' | 'TRIP' | 'DINNER' | 'RESULTS' | 'PAYMENT'
  const [mode, setMode] = useState(null); // 'trip' | 'dinner'

  // Calculations/Results State
  const [results, setResults] = useState([]); // Array of { name, amount, detailText }

  // Persisted Session Payment Method State (selected once per session)
  const [paymentMethod, setPaymentMethod] = useState(null); // { type: 'PayShap'|'BankEFT', details: {...} }

  // Current selected person for payment request
  const [selectedPerson, setSelectedPerson] = useState(null); // { name, amount }
  const [payerName, setPayerName] = useState('');

  // Detect if we are on a desktop/tablet web viewport
  const isLargeWeb = Platform.OS === 'web' && width > 480;

  // Navigation handlers
  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
    setCurrentScreen(selectedMode === 'trip' ? 'TRIP' : 'DINNER');
  };

  const handleBackToHome = () => {
    setMode(null);
    setCurrentScreen('HOME');
  };

  const handleCalculate = (calculatedResults, appMode) => {
    setResults(calculatedResults);
    setMode(appMode);
    setCurrentScreen('RESULTS');
  };

  const handleSelectPerson = (name, amount, activePayer) => {
    setPayerName(activePayer);
    setSelectedPerson({ name, amount });
    setCurrentScreen('PAYMENT');
  };

  const handleBackToResults = () => {
    setSelectedPerson(null);
    setCurrentScreen('RESULTS');
  };

  const handleResetSession = () => {
    setMode(null);
    setResults([]);
    setPaymentMethod(null);
    setSelectedPerson(null);
    setPayerName('');
    setCurrentScreen('HOME');
  };

  // Render active screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'LANDING':
        return <LandingScreen onCreateGroup={() => setCurrentScreen('HOME')} />;
      case 'HOME':
        return <HomeScreen onSelectMode={handleSelectMode} />;
      case 'TRIP':
        return (
          <TripScreen
            onBack={handleBackToHome}
            onCalculate={handleCalculate}
          />
        );
      case 'DINNER':
        return (
          <DinnerScreen
            onBack={handleBackToHome}
            onCalculate={handleCalculate}
          />
        );
      case 'RESULTS':
        return (
          <ResultsScreen
            results={results}
            mode={mode}
            onSelectPerson={handleSelectPerson}
            onReset={handleResetSession}
          />
        );
      case 'PAYMENT':
        return (
          <PaymentScreen
            personName={selectedPerson?.name}
            amount={selectedPerson?.amount || 0}
            payerName={payerName}
            paymentMethod={paymentMethod}
            onSavePaymentMethod={setPaymentMethod}
            onResetPaymentMethod={() => setPaymentMethod(null)}
            onBack={handleBackToResults}
          />
        );
      default:
        return <HomeScreen onSelectMode={handleSelectMode} />;
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      !isLargeWeb && { backgroundColor: COLORS.background } // Full screen color on mobile
    ]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      {currentScreen === 'LANDING' ? (
        <View style={{ flex: 1, width: '100%' }}>
          {renderScreen()}
        </View>
      ) : (
        <View style={[
          styles.appWrapper,
          isLargeWeb ? styles.desktopWrapper : styles.mobileWrapper
        ]}>
          {renderScreen()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070c', // Dark outer backing for desktop browser center-alignment
    alignItems: 'center',
    justifyContent: 'center',
  },
  appWrapper: {
    backgroundColor: COLORS.background,
  },
  mobileWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  desktopWrapper: {
    width: 450,
    height: 850,
    maxHeight: '90%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    // Modern drop shadow for the desktop web frame
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  }
});
