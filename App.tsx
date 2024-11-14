import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function App() {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const G20_CURRENCIES = [
    'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD',
    'NZD', 'KRW', 'INR', 'RUB', 'BRL', 'ZAR', 'SGD', 'MXN', 'IDR',
    'TRY', 'SAR',
  ];

  const fetchConversionRate = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Invalid Input', 'Please enter a valid amount.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/53f60c78d24a45d576180bd5/latest/${fromCurrency}`
      );
      const rate = response.data.conversion_rates[toCurrency];
      if (rate) {
        setResult(Number(amount) * rate);
      } else {
        setResult(null);
        Alert.alert('Error', 'Conversion rate not found.');
      }
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      Alert.alert('Network Error', 'Unable to fetch conversion rate. Please try again.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger conversion when "From Currency" or "To Currency" changes
  useEffect(() => {
    fetchConversionRate();
  }, [fromCurrency, toCurrency]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="auto" />
        <View style={styles.container}>
          <Text style={styles.title}>Currency Converter</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>From Currency</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={fromCurrency}
                onValueChange={(value) => setFromCurrency(value)}
                style={[styles.picker, Platform.OS === 'ios' && { padding: 10 }]}
              >
                {G20_CURRENCIES.map((currency) => (
                  <Picker.Item label={currency} value={currency} key={currency} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>To Currency</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={toCurrency}
                onValueChange={(value) => setToCurrency(value)}
                style={styles.picker}
              >
                {G20_CURRENCIES.map((currency) => (
                  <Picker.Item label={currency} value={currency} key={currency} />
                ))}
              </Picker>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={fetchConversionRate}
            >
              <Text style={styles.buttonText}>Convert</Text>
            </Pressable>

            {isLoading ? (
              <ActivityIndicator
                style={styles.result}
                size="large"
                color="#0A84FF"
              />
            ) : result !== null ? (
              <Text style={styles.result}>
                {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
              </Text>
            ) : (
              <Text style={styles.error}>
                Unable to fetch conversion rate. Try again.
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 24,
    color: '#000',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: {
    height: 200,
    width: '100%',
  },
  button: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  result: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0A84FF',
  },
  error: {
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
});