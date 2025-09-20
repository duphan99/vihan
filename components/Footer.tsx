
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-white mt-8 py-4 border-t border-slate-200">
            <div className="container mx-auto px-4 md:px-8 text-center text-sm text-slate-500">
                <p>&copy; {new Date().getFullYear()} Hoa hồng Bán hàng Vihanmed. Bảo lưu mọi quyền.</p>
            </div>
        </footer>
    );
};