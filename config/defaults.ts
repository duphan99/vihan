
import type { CommissionPolicy } from '../types';

export const DEFAULT_POLICY: CommissionPolicy = {
  revenueTiers: [
    { id: 't1', threshold: 60000000, rate: 0.01 },
    { id: 't2', threshold: 250000000, rate: 0.013 },
    { id: 't3', threshold: 500000000, rate: 0.016 },
    { id: 't4', threshold: 700000000, rate: 0.018 },
    { id: 't5', threshold: 1000000000, rate: 0.02 },
    { id: 't6', threshold: 1250000000, rate: 0.025 },
    { id: 't7', threshold: 1450000000, rate: 0.03 },
  ],
  debtModifiers: [
    // Note: daysEnd is relative to the end of the order month.
    // E.g., daysEnd: 4 means payment by the 4th of the *next* month.
    { id: 'd1', daysEnd: 4, modifier: 1.0, status: '100%' },
    { id: 'd2', daysEnd: 10, modifier: 0.85, status: '85%' },
    { id: 'd3', daysEnd: 30, modifier: 0.70, status: '70%' },
    { id: 'd4', daysEnd: 60, modifier: 0, status: '0%' }, // Assuming > 30 days and < 2 months is 0%.
  ],
  hospitalChannel: {
    rateMultiplier: 0.8,
    customerKeywords: ['bệnh viện', 'bv.'],
  },
  importedEquipment: {
    rate: 0.1,
    productKeywords: ['nhập khẩu'],
    skuPrefixes: ['NK-'],
  },
  commercialEquipment: {
    rate: 0.3,
    productKeywords: ['thương mại'],
    skuPrefixes: ['TM-'],
  },
  bonuses: {
    newCustomer: {
      amount: 500000,
      minOrderValue: 10000000,
    },
    fitme: {
      amountPerUnit: 500000,
      productKeywords: ['fitme'],
    },
  },
  nonCommissionableRules: {
    skuContains: ['OSTEO'],
  }
};