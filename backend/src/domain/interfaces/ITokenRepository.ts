import { Token } from '../models/Token';

export interface ITokenRepository {
    getTokenSummary(mint: string): Promise<Token>;
    
    getTokens(mints: string[]): Promise<Token[]>;
    
    getTrendingTokens(limit?: number): Promise<Token[]>;
  }