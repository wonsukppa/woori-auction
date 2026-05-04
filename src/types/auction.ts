export interface AuctionProperty {
  id: number;
  caseNo: string;
  type: string;
  address: string;
  name: string;
  price: number;
  minPrice: number;
  ratio: number;
  date: string;
  status: string;
  risk: 'safe' | 'warning' | 'danger';
  image: string;
  images?: string[];
  area: number;             // Building or land area (m2)
  appraisalPrice: number;   // Original appraisal price
  auctionDate: string;
  coords: [number, number];
  lat?: number;
  lng?: number;
  marketPrice: number;       // Current average market price
  estimatedRent: number;     // Estimated monthly rent
  nearbySold: {
    date: string;
    price: number;
    name: string;
  }[];
  // New AI Analysis Metrics
  analysis: {
    score: number;           // Total score 0-100
    profitScore: number;     // Profitability 0-100
    safetyScore: number;     // Safety 0-100
    marketScore: number;     // Marketability 0-100
    livingScore: number;     // Livability 0-100
    verdict: string;         // AI One-liner recommendation
    isIllegal: boolean;      // Violation status
    avgMaintenance: number;  // Avg maintenance fee
    subwayInfo?: string;     // Subway station & distance
    schoolInfo?: string;     // School name & distance
    commerceGrade?: string;  // Neighborhood commerce level
  };
}

export interface AuctionSummary {
  total: number;
  averagePrice: number;
  safeCount: number;
}
