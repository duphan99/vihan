
export interface RawSaleRecord {
  [key: string]: string;
}

export interface SaleRecord {
  productName: string;
  sku: string;
  customerName: string;
  invoiceId: string;
  orderDate: Date;
  quantity: number;
  unitPrice: number;
  total: number;
  paymentDate: Date | null;
  salesRepresentative: string;
}

export type DebtStatus = '100%' | '85%' | '70%' | '0%' | 'N/A' | 'Chưa thanh toán';

export interface SaleCommissionDetail extends SaleRecord {
  isCommissionable: boolean;
  commissionableAmount: number;
  debtStatus: DebtStatus;
  debtModifier: number;
  commissionEarned: number;
  commissionRule: string;
}

export interface RepCommissionDetails {
  repName: string;
  month: string;
  totalRevenue: number;
  commissionableRevenue: number;
  totalDebt: number;
  commissionRate: number;
  baseCommission: number;
  fitmeBonus: number;
  newCustomerBonus: number;
  totalBonus: number;
  finalCommission: number;
  salesBreakdown: SaleCommissionDetail[];
  adjustment: number;
  notes: string;
}

export interface CommissionReport {
  summary: {
    totalRevenue: number;
    totalCommissionableRevenue: number;
    totalCommission: number;
    totalBonus: number;
    salesRecordCount: number;
    paidInvoiceCount: number;
    totalRevenueAllLines: number;
    totalDebt: number;
  };
  byRep: RepCommissionDetails[];
}

// --- Commission Policy Types ---

export interface CommissionTier {
  id: string;
  threshold: number;
  rate: number;
}

export interface DebtModifierRule {
  id: string;
  daysEnd: number; // Paid within X days of the end of the month
  modifier: number;
  status: string;
}

export interface CommissionPolicy {
  revenueTiers: CommissionTier[];
  debtModifiers: DebtModifierRule[];
  hospitalChannel: {
    rateMultiplier: number;
    customerKeywords: string[];
  };
  importedEquipment: {
    rate: number;
    productKeywords: string[];
    skuPrefixes: string[];
  };
  commercialEquipment: {
    rate: number;
    productKeywords: string[];
    skuPrefixes: string[];
  };
  bonuses: {
    newCustomer: {
      amount: number;
      minOrderValue: number;
    };
    fitme: {
      amountPerUnit: number;
      productKeywords: string[];
    }
  };
  nonCommissionableRules: {
      skuContains: string[];
  };
}