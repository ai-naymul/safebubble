// src/components/organisms/BubbleChart/BubbleLayout.ts
import { Token } from '../../../domain/models/Token';
import { colors } from '../../../theme';

export interface BubbleData {
  token: Token;
  x: number;
  y: number;
  radius: number;
  color: string;
}

/**
 * Calculate bubble layout using a simple grid-based approach
 * More performant than force simulation on mobile
 */
export const calculateBubbleLayout = (
  tokens: Token[],
  width: number,
  height: number
): BubbleData[] => {
  
  // Sort tokens by risk score (lowest risk first - safer tokens get priority)
  const sortedTokens = [...tokens].sort((a, b) => a.riskScore.totalScore - b.riskScore.totalScore);

  // Calculate bubble sizes based on risk assessment score (0-100) - INVERTED: safer tokens get bigger bubbles
  const riskScores = tokens.map(t => t.riskScore.totalScore);
  const maxRiskScore = Math.max(...riskScores);
  const minRiskScore = Math.min(...riskScores);
  const minRadius = 30; // Increased minimum for better text visibility
  const maxRadius = 70; // Increased maximum for better text visibility

  const bubbles: BubbleData[] = sortedTokens.map((token, index) => {
    // Calculate radius based on risk assessment score (INVERTED: lower risk = bigger bubble)
    const riskScoreRange = maxRiskScore - minRiskScore;
    const normalizedRiskScore = riskScoreRange > 0 
      ? 1 - ((token.riskScore.totalScore - minRiskScore) / riskScoreRange) // Invert: 1 - normalized
      : 0.5; // Default to middle if all scores are the same
    
    // Use linear scaling for more balanced size differences
    const radius = minRadius + (maxRadius - minRadius) * normalizedRiskScore;
    
    // Debug logging to verify size differences
    if (index < 5) {
      console.log(`Token ${token.symbol}: RiskScore=${token.riskScore.totalScore}, Normalized=${normalizedRiskScore.toFixed(3)}, Radius=${radius.toFixed(1)} (SAFER = BIGGER)`);
    }

    // Determine color based on risk level
    let color: string;
    switch (token.riskScore.riskLevel) {
      case 'SAFE':
        color = colors.risk.safe.primary;
        break;
      case 'MEDIUM':
        color = colors.risk.medium.primary;
        break;
      case 'DANGER':
        color = colors.risk.danger.primary;
        break;
      default:
        color = colors.text.tertiary;
    }

    // Improved grid layout that accounts for bubble sizes
    const columns = 3;
    const row = Math.floor(index / columns);
    const col = index % columns;
    
    const cellWidth = width / columns;
    const cellHeight = 160; // Increased to accommodate larger bubbles and prevent overlap
    
    // Add some randomness to prevent perfect grid alignment, but keep it smaller
    const randomOffsetX = (Math.random() - 0.5) * 15;
    const randomOffsetY = (Math.random() - 0.5) * 15;
    
    const x = col * cellWidth + cellWidth / 2 + randomOffsetX;
    const y = row * cellHeight + cellHeight / 2 + 60 + randomOffsetY; // Offset for header

    return {
      token,
      x,
      y,
      radius,
      color,
    };
  });

  return bubbles;
};