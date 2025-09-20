
import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsDashboard } from './components/ResultsDashboard';
import { parseCSV } from './services/csvParser';
import { calculateCommissions } from './services/commissionCalculator';
import type { CommissionReport, SaleRecord, CommissionPolicy } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DEFAULT_POLICY } from './config/defaults';


const App: React.FC = () => {
  const [commissionReport, setCommissionReport] = useState<CommissionReport | null>(null);
  const [salesRecords, setSalesRecords] = useState<SaleRecord[] | null>(null);
  const [commissionPolicy, setCommissionPolicy] = useState<CommissionPolicy>(DEFAULT_POLICY);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileProcess = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setCommissionReport(null);
    setSalesRecords(null);
    setFileName(file.name);

    try {
      const records: SaleRecord[] = await parseCSV(file);
      setSalesRecords(records);
      const report = calculateCommissions(records, commissionPolicy);
      setCommissionReport(report);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Lỗi xử lý tệp: ${err.message}`);
      } else {
        setError('Đã xảy ra lỗi không xác định.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [commissionPolicy]);

  const handleReset = () => {
    setCommissionReport(null);
    setError(null);
    setIsLoading(false);
    setFileName('');
    setSalesRecords(null);
    setCommissionPolicy(DEFAULT_POLICY);
  };

  const handleReportUpdate = (updatedReport: CommissionReport) => {
    setCommissionReport(updatedReport);
  };
  
  const handlePolicyUpdate = useCallback((newPolicy: CommissionPolicy) => {
    if (!salesRecords) return;

    setCommissionPolicy(newPolicy);
    setIsLoading(true);
    setError(null);

    // Use a short timeout to allow the UI to update to the loading state
    setTimeout(() => {
      try {
        const report = calculateCommissions(salesRecords, newPolicy);
        setCommissionReport(report);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Lỗi tính toán lại: ${err.message}`);
        } else {
          setError('Đã xảy ra lỗi không xác định khi tính toán lại.');
        }
      } finally {
        setIsLoading(false);
      }
    }, 50);
  }, [salesRecords]);


  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-800">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!commissionReport && (
          <FileUpload onFileProcess={handleFileProcess} isLoading={isLoading} error={error} />
        )}

        {isLoading && (
          <div className="text-center p-8">
             <div className="flex justify-center items-center mb-4">
                <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
             </div>
            <p className="text-lg text-slate-600">Đang phân tích dữ liệu bán hàng và tính hoa hồng...</p>
            <p className="text-sm text-slate-500">Quá trình này có thể mất một chút thời gian đối với các tệp lớn.</p>
          </div>
        )}

        {commissionReport && !isLoading && (
          <ResultsDashboard
            report={commissionReport}
            fileName={fileName}
            onReset={handleReset}
            onReportUpdate={handleReportUpdate}
            policy={commissionPolicy}
            onPolicyUpdate={handlePolicyUpdate}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
