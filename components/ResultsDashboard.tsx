
import React, { useState } from 'react';
import type { CommissionReport, CommissionPolicy } from '../types';
import { CommissionTable } from './CommissionTable';
import { CommissionEditor } from './CommissionEditor';
import { PolicyEditor } from './PolicyEditor';
import { formatCurrency } from '../utils/formatter';

interface ResultsDashboardProps {
  report: CommissionReport;
  fileName: string;
  onReset: () => void;
  onReportUpdate: (updatedReport: CommissionReport) => void;
  policy: CommissionPolicy;
  onPolicyUpdate: (newPolicy: CommissionPolicy) => void;
}

const SummaryCard: React.FC<{ title: string; value: string; icon: JSX.Element }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex items-center space-x-4">
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
);

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ report, fileName, onReset, onReportUpdate, policy, onPolicyUpdate }) => {
  const { summary } = report;
  const [activeTab, setActiveTab] = useState<'report' | 'edit' | 'policy'>('report');

  const getTabClass = (tabName: 'report' | 'edit' | 'policy') => {
    return activeTab === tabName
      ? 'border-blue-600 text-blue-600'
      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Báo cáo Hoa hồng</h1>
          <p className="text-slate-500 mt-1">Kết quả cho tệp: <span className="font-semibold text-slate-600">{fileName}</span></p>
        </div>
        <button
          onClick={onReset}
          className="bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.691V5.006h-4.992a8.25 8.25 0 00-11.664 0l-3.181 3.183" />
          </svg>
          Xử lý tệp khác
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard 
            title="Tổng doanh thu (Tất cả các line)" 
            value={formatCurrency(summary.totalRevenueAllLines)}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
        />
        <SummaryCard 
            title="Doanh thu tính Hoa hồng" 
            value={formatCurrency(summary.totalCommissionableRevenue)}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v.75A.75.75 0 014.5 8.25h-.75m0 0h.75a.75.75 0 01.75.75v.75m0 0v.75a.75.75 0 01-.75.75h-.75m0 0H3A.75.75 0 012.25 9v-.75m0 0A.75.75 0 013 7.5h.75m0 0V6A.75.75 0 014.5 5.25h.75M6 12h12M6 12a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25h12A2.25 2.25 0 0120.25 6v3.75c0 .621-.258 1.2-1.258 1.5-1.288.3-6.443 1.5-6.443 1.5s-5.155-1.2-6.443-1.5c-.999-.3-1.258-.879-1.258-1.5V6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v3.75a2.25 2.25 0 01-2.25 2.25H6z" /></svg>}
        />
        <SummaryCard 
            title="Tổng công nợ" 
            value={formatCurrency(summary.totalDebt)}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <SummaryCard 
            title="Tổng Hoa hồng đã trả" 
            value={formatCurrency(summary.totalCommission)}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <SummaryCard 
            title="Tổng Thưởng" 
            value={formatCurrency(summary.totalBonus)}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a8.25 8.25 0 01-16.5 0v-8.25a8.25 8.25 0 0116.5 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3 3 0 003-3V4.5a3 3 0 00-6 0v8.25a3 3 0 003 3z" /></svg>}
        />
        <SummaryCard 
            title="Hóa đơn đã thanh toán" 
            value={summary.paidInvoiceCount.toLocaleString('vi-VN')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-1.125 0-2.062.938-2.062 2.063v7.812c0 1.125.937 2.063 2.062 2.063h10.25A2.062 2.062 0 0017.25 18V10.312c0-1.125-.937-2.063-2.062-2.063H8.25z" /></svg>}
        />
      </div>
      
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('report')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${getTabClass('report')}`}
            aria-current={activeTab === 'report' ? 'page' : undefined}
          >
            Báo cáo Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${getTabClass('edit')}`}
            aria-current={activeTab === 'edit' ? 'page' : undefined}
          >
            Chỉnh sửa & Xuất
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${getTabClass('policy')}`}
            aria-current={activeTab === 'policy' ? 'page' : undefined}
          >
            Chính sách Hoa hồng
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'report' && <CommissionTable byRep={report.byRep} />}
        {activeTab === 'edit' && <CommissionEditor report={report} onUpdate={onReportUpdate} />}
        {activeTab === 'policy' && <PolicyEditor policy={policy} onUpdate={onPolicyUpdate} />}
      </div>

    </div>
  );
};