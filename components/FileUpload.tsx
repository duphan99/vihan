
import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onFileProcess: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileProcess, isLoading, error }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileProcess(e.dataTransfer.files[0]);
    }
  }, [onFileProcess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileProcess(e.target.files[0]);
    }
  };

  const borderColor = isDragOver ? 'border-blue-500' : 'border-slate-300';
  const bgColor = isDragOver ? 'bg-blue-50' : 'bg-white';

  return (
    <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-center text-slate-700 mb-2">Tải lên Dữ liệu Bán hàng</h2>
            <p className="text-center text-slate-500 mb-6">Kéo và thả tệp CSV của bạn vào đây hoặc nhấn để chọn.</p>
            
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center w-full h-64 border-2 ${borderColor} border-dashed rounded-lg cursor-pointer ${bgColor} transition-colors duration-200`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-4 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Nhấn để tải lên</span> hoặc kéo và thả</p>
                    <p className="text-xs text-slate-500">Yêu cầu tệp CSV</p>
                </div>
                <input id="dropzone-file" type="file" className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept=".csv" disabled={isLoading} />
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm">
                    <strong>Lỗi:</strong> {error}
                </div>
            )}
        </div>
    </div>
  );
};