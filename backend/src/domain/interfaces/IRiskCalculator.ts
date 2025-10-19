import { Token, RiskScore, RiskLevel } from '../models/Token';

export interface IRiskCalculator {
    calculateRiskScore(token: Partial<Token>): RiskScore;
    
    getRiskLevel(score: number): RiskLevel;
}