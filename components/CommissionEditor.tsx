
import React, { useState, useEffect } from 'react';
import type { CommissionReport, RepCommissionDetails } from '../types';
import { formatCurrency } from '../utils/formatter';
import { exportReportToCSV } from '../utils/exporter';

interface CommissionEditorProps {
    report: CommissionReport;
    onUpdate: (updatedReport: CommissionReport) => void;
}

export const CommissionEditor: React.FC<CommissionEditorProps> = ({ report, onUpdate }) => {
    const [editedData, setEditedData] = useState<RepCommissionDetails[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        // Deep copy to avoid mutating original report state directly
        setEditedData(JSON.parse(JSON.stringify(report.byRep)));
        setHasChanges(false);
    }, [report]);

    const handleAdjustmentChange = (repName: string, value: string) => {
        const adjustment = parseInt(value, 10) || 0;
        setEditedData(prevData =>
            prevData.map(rep =>
                rep.repName === repName ? { ...rep, adjustment } : rep
            )
        );
        setHasChanges(true);
    };

    const handleNotesChange = (repName: string, value: string) => {
        setEditedData(prevData =>
            prevData.map(rep =>
                rep.repName === repName ? { ...rep, notes: value } : rep
            )
        );
        setHasChanges(true);
    };

    const handleSaveChanges = () => {
        const updatedByRep = editedData.map(rep => ({
            ...rep,
            finalCommission: rep.baseCommission + rep.totalBonus + rep.adjustment,
        }));

        const totalCommission = updatedByRep.reduce((sum, rep) => sum + rep.finalCommission, 0);

        const updatedReport: CommissionReport = {
            ...report,
            summary: {
                ...report.summary,
                totalCommission,
            },
            byRep: updatedByRep,
        };
        onUpdate(updatedReport);
        setHasChanges(false);
        alert('Đã lưu các thay đổi!');
    };
    
    const handleExport = () => {
        exportReportToCSV(editedData);
    };


    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold">Chỉnh sửa Hoa hồng và Xuất Báo cáo</h3>
                    <p className="text-sm text-slate-500">Thực hiện điều chỉnh thủ công và thêm ghi chú cho từng nhân viên.</p>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                    <button
                        onClick={handleSaveChanges}
                        disabled={!hasChanges}
                        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Lưu thay đổi
                    </button>
                    <button
                        onClick={handleExport}
                        className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                         </svg>
                        Xuất ra CSV
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Nhân viên Bán hàng</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Hoa hồng Cơ bản</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Thưởng</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Công nợ</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider" style={{width: '150px'}}>Điều chỉnh (+/-)</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Ghi chú</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Hoa hồng Cuối cùng</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {editedData.map(rep => {
                            const finalCommission = rep.baseCommission + rep.totalBonus + rep.adjustment;
                            return (
                                <tr key={rep.repName}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{rep.repName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(rep.baseCommission)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(rep.totalBonus)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-orange-600 font-medium">{formatCurrency(rep.totalDebt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="number"
                                            value={rep.adjustment}
                                            onChange={e => handleAdjustmentChange(rep.repName, e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-md text-right focus:ring-blue-500 focus:border-blue-500"
                                            step="1000"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="text"
                                            value={rep.notes}
                                            onChange={e => handleNotesChange(rep.repName, e.target.value)}
                                            placeholder="Thêm ghi chú..."
                                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-lg text-green-700">{formatCurrency(finalCommission)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};