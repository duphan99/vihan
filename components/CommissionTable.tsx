import React, { useState } from 'react';
import type { RepCommissionDetails, SaleCommissionDetail } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatter';

const SaleDetailRow: React.FC<{ detail: SaleCommissionDetail }> = ({ detail }) => {
    const commissionableClass = detail.isCommissionable ? 'text-green-600' : 'text-red-600';
    return (
        <tr className="bg-slate-50 hover:bg-slate-100 text-sm">
            <td className="px-4 py-2 border-b border-slate-200">{detail.productName}</td>
            <td className="px-4 py-2 border-b border-slate-200">{detail.invoiceId}</td>
            <td className="px-4 py-2 border-b border-slate-200 text-right">{formatCurrency(detail.total)}</td>
            <td className={`px-4 py-2 border-b border-slate-200 text-right font-semibold ${commissionableClass}`}>
                {formatCurrency(detail.commissionableAmount)}
            </td>
            <td className="px-4 py-2 border-b border-slate-200 text-center">{detail.debtStatus}</td>
            <td className="px-4 py-2 border-b border-slate-200">{detail.commissionRule}</td>
            <td className="px-4 py-2 border-b border-slate-200 text-right font-bold text-blue-700">{formatCurrency(detail.commissionEarned)}</td>
        </tr>
    );
};

const RepRow: React.FC<{ repData: RepCommissionDetails }> = ({ repData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'commissionable' | 'non-commissionable'>('all');
  const [filterText, setFilterText] = useState('');

  const filteredSales = repData.salesBreakdown.filter(detail => {
    const statusMatch =
      filterStatus === 'all' ||
      (filterStatus === 'commissionable' && detail.isCommissionable) ||
      (filterStatus === 'non-commissionable' && !detail.isCommissionable);

    const textMatch =
      !filterText.trim() ||
      detail.productName.toLowerCase().includes(filterText.toLowerCase()) ||
      detail.invoiceId.toLowerCase().includes(filterText.toLowerCase()) ||
      detail.commissionRule.toLowerCase().includes(filterText.toLowerCase());

    return statusMatch && textMatch;
  });

  return (
    <>
      <tr className="bg-white hover:bg-slate-50 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <td className="px-6 py-4 whitespace-nowrap border-b border-slate-200 font-medium text-slate-900 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
           </svg>
           {repData.repName}
        </td>
        <td className="px-6 py-4 whitespace-nowrap border-b border-slate-200 text-right">{formatCurrency(repData.commissionableRevenue)}</td>
        <td className="px-6 py-4 whitespace-nowrap border-b border-slate-200 text-right text-orange-600 font-medium">{formatCurrency(repData.totalDebt)}</td>
        <td className="px-6 py-4 whitespace-nowrap border-b border-slate-200 text-center">{formatPercentage(repData.commissionRate)}</td>
        <td className="px-6 py-4 whitespace-nowrap border-b border-slate-200 text-right">{formatCurrency(repData.baseCommission)}</td>
        <td className="px-6 py-4 whitespace-nowrap border-b border-slate-200 text-right">{formatCurrency(repData.totalBonus)}</td>
        <td className="px-6 py-4 whitespace-nowrap border-b border-slate-200 text-right font-bold text-lg text-green-700">{formatCurrency(repData.finalCommission)}</td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={7} className="p-0">
            <div className="p-4 bg-slate-50">
              <h4 className="font-bold text-md mb-2 text-slate-700">Chi tiết Bán hàng của {repData.repName}</h4>
              
              <div className="bg-white p-3 rounded-lg border border-slate-200 mb-4 flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-grow w-full md:w-auto">
                      <input
                          type="text"
                          placeholder="Tìm theo sản phẩm, số HĐ, quy tắc..."
                          value={filterText}
                          onChange={e => setFilterText(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-medium text-slate-600">Lọc theo:</span>
                      <button onClick={() => setFilterStatus('all')} className={`px-3 py-1 text-sm rounded-md transition-colors ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>Tất cả</button>
                      <button onClick={() => setFilterStatus('commissionable')} className={`px-3 py-1 text-sm rounded-md transition-colors ${filterStatus === 'commissionable' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>Được tính HH</button>
                      <button onClick={() => setFilterStatus('non-commissionable')} className={`px-3 py-1 text-sm rounded-md transition-colors ${filterStatus === 'non-commissionable' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>Không được tính HH</button>
                  </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full">
                    <thead className="bg-slate-200 text-slate-600 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-2 text-left">Sản phẩm</th>
                            <th className="px-4 py-2 text-left">Số HĐ</th>
                            <th className="px-4 py-2 text-right">Số tiền Bán</th>
                            <th className="px-4 py-2 text-right">Tính HH</th>
                            <th className="px-4 py-2 text-center">Tình trạng Công nợ</th>
                            <th className="px-4 py-2 text-left">Quy tắc Hoa hồng</th>
                            <th className="px-4 py-2 text-right">Hoa hồng Nhận được</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.length > 0 ? (
                            filteredSales.map((detail, index) => (
                               <SaleDetailRow key={`${detail.invoiceId}-${index}`} detail={detail} />
                            ))
                        ) : (
                             <tr className="bg-white">
                                <td colSpan={7} className="text-center py-4 text-slate-500 italic">
                                    Không tìm thấy chi tiết bán hàng nào phù hợp với bộ lọc.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};


export const CommissionTable: React.FC<{ byRep: RepCommissionDetails[] }> = ({ byRep }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
            <h3 className="text-xl font-bold">Hoa hồng theo Nhân viên Bán hàng</h3>
        </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                Nhân viên Bán hàng
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                Doanh thu tính HH
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                Công nợ
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                Tỷ lệ
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                Hoa hồng Cơ bản
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                Thưởng
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                Hoa hồng Cuối cùng
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {byRep.sort((a,b) => b.finalCommission - a.finalCommission).map((repData) => (
              <RepRow key={repData.repName} repData={repData} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};