import axios from 'axios';

export type TokenOverview = {
  holder: number;        // CG doesn't have this -> we'll return 0
  v24hUSD: number;       // 24h volume in USD
  priceChange24h: number; // 24h % change
};

export class CoinGeckoService {
  private client = axios.create({
    baseURL: 'https://pro-api.coingecko.com/api/v3',
    headers: { 'x-cg-pro-api-key': "CG-sdoLr4PGov27HUa41mGwi8ii" },
    timeout: 10000,
  });

  async getTokenOverviewByAddress(
    mint: string,
    platformId: string = 'solana'
  ): Promise<TokenOverview | null> {
    try {
      const { data } = await this.client.get(
        `/coins/${platformId}/contract/${mint}`,
        {
          params: {
            localization: false,
            tickers: false,
            market_data: true,  // needed for price/volume/change
            community_data: false,
            developer_data: false,
            sparkline: false,
          },
        }
      );

      const md = data?.market_data;
      return {
        holder: 0, // CG doesn't expose holders
        v24hUSD: md?.total_volume?.usd ?? 0,
        priceChange24h: md?.price_change_percentage_24h ?? 0,
      };
    } catch (e) {
      console.error('CoinGecko token overview failed:', e);
      return null;
    }
  }
}
