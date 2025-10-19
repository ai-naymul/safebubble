// src/screens/SwapScreen/SwapScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '../../components/atoms/Text';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner';
import { RouteInfoCard } from '../../components/molecules/RouteInfoCard';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { Token } from '../../domain/models/Token';
import { Linking, Alert } from 'react-native';
import { 
  getJupiterQuote, 
  includesRaydium,
  formatPriceImpact,
  getPriceImpactSeverity,
  JupiterQuote,
} from '../../services/JupiterService';
import { openRaydiumSwap } from '../../utils/raydiumLink';
import { useWallet, WalletReadyGuard } from '../../contexts/WalletContext';

type SwapScreenRouteProp = RouteProp<
  { SwapScreen: { token: Token } },
  'SwapScreen'
>;

const SOL_MINT = 'So11111111111111111111111111111111111111112';

const SwapScreenContent: React.FC = () => {
  const route = useRoute<SwapScreenRouteProp>();
  const navigation = useNavigation();
  const { token } = route.params;

  const walletContext = useWallet();

  const {
    walletConnected,
    walletAddress,
    authToken,
    connectWallet,
    loading: walletLoading
  } = walletContext;

  const [inputAmount, setInputAmount] = useState('1');
  const [outputAmount, setOutputAmount] = useState('0');
  const [quote, setQuote] = useState<JupiterQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Connect wallet
  const handleConnectWallet = async () => {
    // Check if wallet context is properly available
    if (!walletContext || !connectWallet) {
      console.error('Wallet context not available for connection');
      Alert.alert('Error', 'Wallet system is not ready yet. Please try again in a moment.');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await connectWallet();
      Alert.alert('Success', `Wallet connected successfully!\n${walletAddress?.slice(0, 8)}...${walletAddress?.slice(-8)}`);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      Alert.alert('Connection Failed', error.message || 'Failed to connect wallet. Make sure you have a MWA-compatible wallet installed.');
    }
  };

  // Get quote whenever input amount changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (inputAmount && parseFloat(inputAmount) > 0) {
        fetchQuote();
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [inputAmount]);

  // Fetch Jupiter quote for transparency
  const fetchQuote = async () => {
    try {
      setLoadingQuote(true);
      setQuoteError(null);

      const amountInLamports = Math.floor(parseFloat(inputAmount) * Math.pow(10, 9)); // SOL to lamports
      const quote = await getJupiterQuote({
        inputMint: SOL_MINT,
        outputMint: token.mint,
        amount: amountInLamports.toString(),
        slippageBps: 50, // 0.5%
      });

      setQuote(quote);

      // Convert output to human-readable
      const outputInTokens = parseInt(quote.outAmount) / Math.pow(10, token.decimals);
      setOutputAmount(outputInTokens.toFixed(6));
    } catch (error: any) {
      console.error('Quote fetch error:', error);
      setQuoteError(error.message || 'Failed to get quote');
      setOutputAmount('0');
    } finally {
      setLoadingQuote(false);
    }
  };

      const handleSwap = async () => {
        if (token.riskScore.riskLevel === 'DANGER') {
          Alert.alert(
            'High Risk Token',
            'This token has high-risk indicators and cannot be swapped.',
            [{ text: 'OK', style: 'cancel' }]
          );
          return;
        }

        try {
          await openRaydiumSwap(SOL_MINT, token.mint);
        } catch (error) {
          console.error('Error opening Raydium:', error);
          Alert.alert('Error', 'Could not open browser');
        }
      };

  const priceImpactSeverity = quote ? getPriceImpactSeverity(quote.priceImpactPct) : 'low';
  const showRaydium = quote ? includesRaydium(quote) : false;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
        {/* Header */}
        <LinearGradient
          colors={[colors.brand.primary, colors.brand.light]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text variant="h2" weight="bold" style={styles.headerTitle}>
            Swap to {token.symbol}
          </Text>
          <Text variant="body" style={styles.headerSubtitle}>
            Powered by Jupiter Aggregator
          </Text>
        </LinearGradient>

        {/* Wallet Connection */}
        {!walletConnected ? (
          <Card variant="elevated" padding="base" style={styles.section}>
            <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
              Connect Wallet
            </Text>
            <Text variant="body" color="secondary" style={styles.sectionDescription}>
              Connect your Solana wallet to start swapping{'\n'}
              Note: You need some SOL in your wallet for transaction fees
            </Text>
            <Button
              title={walletLoading ? "Connecting..." : "Connect Wallet"}
              onPress={handleConnectWallet}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.connectButton}
              disabled={walletLoading}
            />
          </Card>
        ) : (
          <Card variant="default" padding="sm" style={styles.walletCard}>
            <View style={styles.walletInfo}>
              <Text variant="caption" color="secondary">
                Connected
              </Text>
              <Text variant="body" weight="semibold">
                {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
              </Text>
            </View>
          </Card>
        )}

        {/* Input Amount */}
        <Card variant="elevated" padding="base" style={styles.section}>
          <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
            Swap Amount
          </Text>
          <View style={styles.amountContainer}>
            <View style={styles.amountInput}>
              <TextInput
                style={styles.input}
                value={inputAmount}
                onChangeText={setInputAmount}
                placeholder="0.0"
                keyboardType="numeric"
                placeholderTextColor={colors.text.secondary}
              />
              <Text variant="body" weight="semibold" style={styles.inputLabel}>
                SOL
              </Text>
            </View>
            <View style={styles.arrow}>
              <Text variant="h2">→</Text>
            </View>
            <View style={styles.amountOutput}>
              {loadingQuote ? (
                <ActivityIndicator color={colors.brand.primary} />
              ) : (
                <>
                  <Text variant="body" style={styles.outputAmount}>
                    {outputAmount}
                  </Text>
                  <Text variant="body" weight="semibold" style={styles.outputLabel}>
                    {token.symbol}
                  </Text>
                </>
              )}
            </View>
          </View>
          {quoteError && (
            <Text variant="caption" color="primary" style={styles.errorText}>
              {quoteError}
            </Text>
          )}
        </Card>

        {/* Route Info */}
        {quote && (
          <RouteInfoCard
            quote={quote}
            includesRaydium={showRaydium}
          />
        )}

        {/* Risk Assessment */}
        <Card variant="elevated" padding="base" style={styles.section}>
          <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
            Risk Assessment
          </Text>
          <View style={styles.riskContainer}>
            <View style={styles.riskBadge}>
              <Text variant="h2" weight="bold" style={[
                styles.riskLevel,
                {
                  color: token.riskScore.riskLevel === 'SAFE' ? colors.risk.safe.primary :
                         token.riskScore.riskLevel === 'MEDIUM' ? colors.risk.medium.primary :
                         colors.risk.danger.primary
                }
              ]}>
                {token.riskScore.riskLevel}
              </Text>
              <Text variant="body" style={styles.riskScore}>
                Score: {token.riskScore.totalScore}/150
              </Text>
            </View>
          </View>
          {token.riskScore.riskLevel === 'DANGER' && (
            <View style={styles.warningCard}>
              <Text variant="body" weight="bold" style={styles.warningText}>
                ⚠️ HIGH RISK TOKEN DETECTED
              </Text>
              <Text variant="caption" color="secondary" style={styles.warningSubtext}>
                This token shows dangerous risk indicators. Swapping is disabled for safety.
              </Text>
            </View>
          )}
        </Card>

        {/* Swap Button */}
        <Button
          title={'Open in Raydium'}
          onPress={handleSwap}
          variant="primary"
          size="lg"
          fullWidth
          disabled={token.riskScore.riskLevel === 'DANGER'}
          style={styles.swapButton}
        />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export const SwapScreen: React.FC = () => {
  return (
    <WalletReadyGuard>
      <SwapScreenContent />
    </WalletReadyGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    minHeight: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  header: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  headerTitle: {
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    marginBottom: spacing.base,
  },
  connectButton: {
    marginTop: spacing.sm,
  },
  walletCard: {
    marginBottom: spacing.lg,
  },
  walletInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.base,
  },
  amountInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    padding: 0,
  },
  inputLabel: {
    marginLeft: spacing.sm,
    color: colors.text.primary,
  },
  arrow: {
    marginHorizontal: spacing.base,
  },
  amountOutput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    minHeight: 50,
  },
  outputAmount: {
    flex: 1,
    fontSize: 16,
    color: colors.text.secondary,
  },
  outputLabel: {
    marginLeft: spacing.sm,
    color: colors.text.primary,
  },
  errorText: {
    marginTop: spacing.sm,
    color: colors.risk.danger.primary,
  },
  riskContainer: {
    marginTop: spacing.base,
  },
  riskBadge: {
    alignItems: 'center',
  },
  riskLevel: {
    marginBottom: spacing.xs,
  },
  riskScore: {
    color: colors.text.secondary,
  },
  warningCard: {
    marginTop: spacing.base,
    padding: spacing.base,
    backgroundColor: colors.risk.danger.background,
    borderRadius: borderRadius.md,
  },
  warningText: {
    color: colors.risk.danger.primary,
    marginBottom: spacing.xs,
  },
  warningSubtext: {
    color: colors.text.secondary,
  },
  swapButton: {
    marginTop: spacing.sm,
  },
});
