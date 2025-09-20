
import { RepCommissionDetails } from '../types';

const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) {
        return '';
    }
    let str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};


export const exportReportToCSV = (data: RepCommissionDetails[]) => {
    const headers = [
        'Nhân viên Bán hàng',
        'Tháng',
        'Doanh thu Tổng',
        'Doanh thu tính HH',
        'Công nợ',
        'Tỷ lệ HH',
        'Hoa hồng Cơ bản',
        'Thưởng FitME',
        'Thưởng Khách hàng Mới',
        'Tổng Thưởng',
        'Điều chỉnh',
        'Ghi chú',
        'Hoa hồng Cuối cùng',
    ];

    const rows = data.map(rep => {
         const finalCommission = rep.baseCommission + rep.totalBonus + rep.adjustment;
         return [
            escapeCSV(rep.repName),
            escapeCSV(rep.month),
            rep.totalRevenue,
            rep.commissionableRevenue,
            rep.totalDebt,
            rep.commissionRate,
            rep.baseCommission,
            rep.fitmeBonus,
            rep.newCustomerBonus,
            rep.totalBonus,
            rep.adjustment,
            escapeCSV(rep.notes),
            finalCommission,
        ];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Bao_cao_hoa_hong_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};