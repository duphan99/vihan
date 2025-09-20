
import type { CommissionReport, RepCommissionDetails, SaleCommissionDetail, SaleRecord, DebtStatus, CommissionPolicy, CommissionTier, DebtModifierRule } from '../types';

const containsKeyword = (text: string, keywords: string[]): boolean => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return keywords.some(kw => lowerText.includes(kw.toLowerCase()));
};

const startsWithPrefix = (text: string, prefixes: string[]): boolean => {
    if (!text) return false;
    const upperText = text.toUpperCase();
    return prefixes.some(p => upperText.startsWith(p.toUpperCase()));
};


const isHospitalSale = (customerName: string, policy: CommissionPolicy): boolean => {
    return containsKeyword(customerName, policy.hospitalChannel.customerKeywords);
};

const isImportedEquipment = (productName: string, sku: string, policy: CommissionPolicy): boolean => {
    return containsKeyword(productName, policy.importedEquipment.productKeywords) ||
           startsWithPrefix(sku, policy.importedEquipment.skuPrefixes);
};

const isCommercialEquipment = (productName: string, sku: string, policy: CommissionPolicy): boolean => {
    return containsKeyword(productName, policy.commercialEquipment.productKeywords) ||
           startsWithPrefix(sku, policy.commercialEquipment.skuPrefixes);
};


const getCommissionRate = (revenue: number, tiers: CommissionTier[]): number => {
    const sortedTiers = [...tiers].sort((a, b) => b.threshold - a.threshold);
    for (const tier of sortedTiers) {
        if (revenue >= tier.threshold) {
            return tier.rate;
        }
    }
    return 0;
};

const getDebtModifier = (orderDate: Date, paymentDate: Date, rules: DebtModifierRule[]): { modifier: number; status: DebtStatus } => {
    const orderMonth = orderDate.getMonth();
    const orderYear = orderDate.getFullYear();
    const sortedRules = [...rules].sort((a,b) => a.daysEnd - b.daysEnd);

    // Calculate the end of the order month
    const endOfOrderMonth = new Date(orderYear, orderMonth + 1, 0);

    for (const rule of sortedRules) {
        // Calculate the deadline date based on the end of the order month
        const deadline = new Date(endOfOrderMonth);
        deadline.setDate(endOfOrderMonth.getDate() + rule.daysEnd);
        
        if(paymentDate <= deadline) {
            return { modifier: rule.modifier, status: rule.status as DebtStatus };
        }
    }

    const lastRule = sortedRules[sortedRules.length - 1];
    if (lastRule && lastRule.modifier === 0) {
        return { modifier: 0, status: lastRule.status as DebtStatus };
    }
    
    return { modifier: 0, status: '0%'};
};


export const calculateCommissions = (sales: SaleRecord[], policy: CommissionPolicy): CommissionReport => {
    const salesByRepAndMonth: { [key: string]: SaleRecord[] } = {};

    sales.forEach(sale => {
        if (sale.total <= 0) return; // Ignore sales with no value
        const month = `${sale.orderDate.getFullYear()}-${(sale.orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
        const key = `${sale.salesRepresentative}__${month}`;
        if (!salesByRepAndMonth[key]) {
            salesByRepAndMonth[key] = [];
        }
        salesByRepAndMonth[key].push(sale);
    });

    const reportByRep: RepCommissionDetails[] = [];
    
    const firstOrderDateByCustomer: { [key: string]: Date } = {};
    sales.forEach(s => {
        if(!s.customerName) return;
        if (!firstOrderDateByCustomer[s.customerName] || s.orderDate < firstOrderDateByCustomer[s.customerName]) {
            firstOrderDateByCustomer[s.customerName] = s.orderDate;
        }
    });

    for (const key in salesByRepAndMonth) {
        const [repName, monthStr] = key.split('__');
        const repSales = salesByRepAndMonth[key];
        
        const repTotalDebt = repSales
            .filter(s => !s.paymentDate)
            .reduce((sum, s) => sum + (s.total || 0), 0);

        const salesBreakdown: SaleCommissionDetail[] = [];
        let tieredCommissionableRevenue = 0;
        let totalCommissionableRevenue = 0;
        let totalRevenue = 0;
        let fitmeBonus = 0;
        let newCustomerBonus = 0;
        let flatRateCommissions = 0;

        for (const sale of repSales) {

            // Handle unpaid sales first. They are not commissionable and earn no bonuses.
            if (!sale.paymentDate) {
                salesBreakdown.push({
                    ...sale,
                    isCommissionable: false,
                    commissionableAmount: 0,
                    debtStatus: 'Chưa thanh toán',
                    debtModifier: 0,
                    commissionEarned: 0,
                    commissionRule: 'Chưa thanh toán',
                });
                continue;
            }

            // --- At this point, the sale is paid ---
            totalRevenue += sale.total;

            // Bonus calculations
            const fitmeRule = policy.bonuses.fitme;
            if (containsKeyword(sale.productName, fitmeRule.productKeywords)) {
                fitmeBonus += fitmeRule.amountPerUnit * sale.quantity;
            }
            
            const newCustomerRule = policy.bonuses.newCustomer;
            const firstOrderDate = firstOrderDateByCustomer[sale.customerName];
            if(firstOrderDate && firstOrderDate.getTime() === sale.orderDate.getTime() && sale.total >= newCustomerRule.minOrderValue) {
                newCustomerBonus += newCustomerRule.amount;
            }

            const { modifier, status } = getDebtModifier(sale.orderDate, sale.paymentDate!, policy.debtModifiers);
            let detail: SaleCommissionDetail;

            // --- Determine Commission Rule based on precedence ---
            const exclusionKeywords = policy.nonCommissionableRules.skuContains || [];
            const excludedKeyword = exclusionKeywords.find(kw => kw && sale.sku.toUpperCase().includes(kw.toUpperCase()));
            
            if (excludedKeyword) {
                detail = {
                    ...sale, isCommissionable: false, commissionableAmount: 0,
                    debtStatus: 'N/A', debtModifier: 0, commissionEarned: 0,
                    commissionRule: `Loại trừ SKU (${excludedKeyword})`,
                };
            } else if (isImportedEquipment(sale.productName, sale.sku, policy)) {
                totalCommissionableRevenue += sale.total;
                const commissionEarned = sale.total * policy.importedEquipment.rate * modifier;
                flatRateCommissions += commissionEarned;
                detail = {
                    ...sale, isCommissionable: true, commissionableAmount: sale.total,
                    debtStatus: status, debtModifier: modifier, commissionEarned,
                    commissionRule: `Hàng nhập khẩu (${policy.importedEquipment.rate * 100}%)`,
                };
            } else if (isCommercialEquipment(sale.productName, sale.sku, policy)) {
                totalCommissionableRevenue += sale.total;
                const commissionEarned = sale.total * policy.commercialEquipment.rate * modifier;
                flatRateCommissions += commissionEarned;
                detail = {
                    ...sale, isCommissionable: true, commissionableAmount: sale.total,
                    debtStatus: status, debtModifier: modifier, commissionEarned,
                    commissionRule: `Hàng thương mại (${policy.commercialEquipment.rate * 100}%)`,
                };
            } else {
                totalCommissionableRevenue += sale.total;
                tieredCommissionableRevenue += sale.total;
                detail = {
                    ...sale, isCommissionable: true, commissionableAmount: sale.total,
                    debtStatus: status, debtModifier: modifier,
                    commissionEarned: 0, // Calculated in the tiered step below
                    commissionRule: 'Tiêu chuẩn',
                };
                if (isHospitalSale(sale.customerName, policy)) {
                    detail.commissionRule = 'Kênh bệnh viện';
                    detail.debtModifier = 1.0;
                    detail.debtStatus = '100%';
                }
            }
            salesBreakdown.push(detail);
        }
        
        const commissionRate = getCommissionRate(tieredCommissionableRevenue, policy.revenueTiers);
        let tieredCommissions = 0;

        for (const detail of salesBreakdown) {
            if (detail.commissionRule === 'Tiêu chuẩn' || detail.commissionRule === 'Kênh bệnh viện') {
                if (detail.isCommissionable) {
                    let saleBaseCommission = detail.commissionableAmount * commissionRate;
                    if (detail.commissionRule === 'Kênh bệnh viện') {
                        saleBaseCommission *= policy.hospitalChannel.rateMultiplier;
                        detail.commissionRule = `Kênh BV (${policy.hospitalChannel.rateMultiplier * 100}% Tiêu chuẩn)`;
                    }
                    detail.commissionEarned = saleBaseCommission * detail.debtModifier;
                    tieredCommissions += detail.commissionEarned;
                }
            }
        }
        
        const totalBonus = fitmeBonus + newCustomerBonus;
        const baseCommission = tieredCommissions + flatRateCommissions;
        const finalCommission = baseCommission + totalBonus;

        reportByRep.push({
            repName,
            month: monthStr,
            totalRevenue,
            commissionableRevenue: totalCommissionableRevenue,
            totalDebt: repTotalDebt,
            commissionRate,
            baseCommission,
            fitmeBonus,
            newCustomerBonus,
            totalBonus,
            finalCommission,
            salesBreakdown,
            adjustment: 0,
            notes: '',
        });
    }

    const allSaleDetails: SaleCommissionDetail[] = reportByRep.flatMap(r => r.salesBreakdown);
    const paidSaleDetails = allSaleDetails.filter(d => d.paymentDate);

    const totalRevenueAllLines = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const totalDebt = sales
      .filter(s => !s.paymentDate)
      .reduce((sum, s) => sum + (s.total || 0), 0);

    const summary = {
        totalRevenue: paidSaleDetails.reduce((sum, s) => sum + s.total, 0),
        totalCommissionableRevenue: allSaleDetails.reduce((sum, d) => sum + d.commissionableAmount, 0),
        totalCommission: reportByRep.reduce((sum, r) => sum + r.finalCommission, 0),
        totalBonus: reportByRep.reduce((sum, r) => sum + r.totalBonus, 0),
        salesRecordCount: sales.length,
        paidInvoiceCount: paidSaleDetails.length,
        totalRevenueAllLines,
        totalDebt,
    };

    return {
        summary,
        byRep: reportByRep,
    };
};