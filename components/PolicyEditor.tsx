
import React, { useState, useEffect } from 'react';
import type { CommissionPolicy, CommissionTier, DebtModifierRule } from '../types';
import { DEFAULT_POLICY } from '../config/defaults';

interface PolicyEditorProps {
    policy: CommissionPolicy;
    onUpdate: (newPolicy: CommissionPolicy) => void;
}

const PolicyCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <h4 className="text-lg font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">{title}</h4>
        <div className="space-y-4">{children}</div>
    </div>
);

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <label className="text-sm font-medium text-slate-600">{label}</label>
        <div className="md:col-span-2">{children}</div>
    </div>
);


export const PolicyEditor: React.FC<PolicyEditorProps> = ({ policy, onUpdate }) => {
    const [localPolicy, setLocalPolicy] = useState<CommissionPolicy>(DEFAULT_POLICY);
    const [hasChanges, setHasChanges] = useState(false);
    const [newSkuKeyword, setNewSkuKeyword] = useState('');
    const [savedPolicyExists, setSavedPolicyExists] = useState(false);

    useEffect(() => {
        try {
            const savedPolicy = localStorage.getItem('commissionPolicy');
            setSavedPolicyExists(!!savedPolicy);
        } catch (error) {
            console.error("Không thể truy cập localStorage:", error);
            setSavedPolicyExists(false);
        }
    }, []);

    useEffect(() => {
        setLocalPolicy(JSON.parse(JSON.stringify(policy)));
        setHasChanges(false);
    }, [policy]);

    const handleFieldChange = <K extends keyof CommissionPolicy>(field: K, value: CommissionPolicy[K]) => {
        setLocalPolicy(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleNestedChange = (path: string, value: any) => {
        setLocalPolicy(prev => {
            const keys = path.split('.');
            const newState = JSON.parse(JSON.stringify(prev));
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
        setHasChanges(true);
    };
    
    // Handlers for Revenue Tiers
    const handleTierChange = (id: string, field: keyof CommissionTier, value: number) => {
        const updatedTiers = localPolicy.revenueTiers.map(tier =>
            tier.id === id ? { ...tier, [field]: value } : tier
        );
        handleFieldChange('revenueTiers', updatedTiers);
    };
    const addTier = () => {
        const newTier: CommissionTier = { id: `tier_${Date.now()}`, threshold: 0, rate: 0 };
        handleFieldChange('revenueTiers', [...localPolicy.revenueTiers, newTier]);
    };
    const removeTier = (id: string) => {
        handleFieldChange('revenueTiers', localPolicy.revenueTiers.filter(t => t.id !== id));
    };

    // Handlers for Debt Modifiers
    const handleDebtRuleChange = (id: string, field: keyof DebtModifierRule, value: string | number) => {
        const updatedRules = localPolicy.debtModifiers.map(rule =>
            rule.id === id ? { ...rule, [field]: value } : rule
        );
        handleFieldChange('debtModifiers', updatedRules);
    };
    
    // Handlers for SKU exclusion list
    const handleAddSkuKeyword = () => {
        const upperKeyword = newSkuKeyword.trim().toUpperCase();
        if (upperKeyword && !localPolicy.nonCommissionableRules.skuContains.includes(upperKeyword)) {
            const updatedKeywords = [...localPolicy.nonCommissionableRules.skuContains, upperKeyword];
            handleNestedChange('nonCommissionableRules.skuContains', updatedKeywords);
            setNewSkuKeyword('');
        }
    };

    const handleRemoveSkuKeyword = (keywordToRemove: string) => {
        const updatedKeywords = localPolicy.nonCommissionableRules.skuContains.filter(k => k !== keywordToRemove);
        handleNestedChange('nonCommissionableRules.skuContains', updatedKeywords);
    };

    const handleSave = () => {
        onUpdate(localPolicy);
        setHasChanges(false);
    };

    const handleReset = () => {
        setLocalPolicy(DEFAULT_POLICY);
        setHasChanges(true); // Allow user to save the reset state
    };
    
    const handleSavePolicyToStorage = () => {
        try {
            localStorage.setItem('commissionPolicy', JSON.stringify(localPolicy));
            setSavedPolicyExists(true);
            alert('Chính sách đã được lưu vào trình duyệt của bạn!');
        } catch (error) {
            console.error("Không thể lưu chính sách vào localStorage:", error);
            alert('Lỗi: Không thể lưu chính sách.');
        }
    };

    const handleLoadPolicyFromStorage = () => {
        try {
            const saved = localStorage.getItem('commissionPolicy');
            if (saved) {
                const parsedPolicy = JSON.parse(saved);
                setLocalPolicy(parsedPolicy);
                setHasChanges(true);
                alert('Đã tải chính sách đã lưu. Nhấn "Lưu & Tính toán lại" để áp dụng.');
            } else {
                alert('Không tìm thấy chính sách nào đã lưu.');
            }
        } catch (error) {
            console.error("Không thể tải hoặc phân tích chính sách từ localStorage:", error);
            alert('Lỗi: Không thể tải chính sách. Dữ liệu đã lưu có thể bị hỏng.');
        }
    };

    const handleClearSavedPolicy = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa chính sách đã lưu vĩnh viễn không?')) {
            try {
                localStorage.removeItem('commissionPolicy');
                setSavedPolicyExists(false);
                alert('Đã xóa chính sách đã lưu.');
            } catch (error) {
                console.error("Không thể xóa chính sách khỏi localStorage:", error);
                alert('Lỗi: Không thể xóa chính sách đã lưu.');
            }
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h3 className="text-xl font-bold">Chỉnh sửa Chính sách Hoa hồng</h3>
                    <p className="text-sm text-slate-500">Thay đổi quy tắc, lưu/tải cấu hình và tính toán lại báo cáo.</p>
                </div>
                 <div className="flex-shrink-0 flex flex-wrap gap-2">
                    <button onClick={handleLoadPolicyFromStorage} disabled={!savedPolicyExists} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                        Tải Chính sách
                    </button>
                    <button onClick={handleSavePolicyToStorage} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        Lưu Chính sách
                    </button>
                     <button onClick={handleClearSavedPolicy} disabled={!savedPolicyExists} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        Xóa
                    </button>
                    <div className="border-l border-slate-300 mx-1 hidden md:block"></div>
                    <button onClick={handleSave} disabled={!hasChanges} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.691V5.006h-4.992a8.25 8.25 0 00-11.664 0l-3.181 3.183" /></svg>
                        Lưu & Tính toán lại
                    </button>
                    <button onClick={handleReset} className="bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                        Đặt lại Mặc định
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PolicyCard title="Bậc Doanh thu & Tỷ lệ">
                    {localPolicy.revenueTiers.sort((a,b) => a.threshold - b.threshold).map(tier => (
                        <div key={tier.id} className="grid grid-cols-3 gap-2 items-center">
                            <input type="number" value={tier.threshold} onChange={e => handleTierChange(tier.id, 'threshold', +e.target.value)} className="p-2 border border-slate-300 rounded-md" placeholder="Ngưỡng doanh thu"/>
                            <div className="relative">
                                <input type="number" value={tier.rate * 100} onChange={e => handleTierChange(tier.id, 'rate', +e.target.value / 100)} className="p-2 border border-slate-300 rounded-md w-full pr-8" placeholder="Tỷ lệ"/>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">%</span>
                            </div>
                            <button onClick={() => removeTier(tier.id)} className="text-red-500 hover:text-red-700 justify-self-end">Xóa</button>
                        </div>
                    ))}
                    <button onClick={addTier} className="text-sm font-semibold text-blue-600 hover:text-blue-800">+ Thêm Bậc</button>
                </PolicyCard>
                 <PolicyCard title="Quy tắc Công nợ">
                     <p className="text-xs text-slate-500 -mt-2">Số ngày được tính từ cuối tháng phát sinh đơn hàng.</p>
                     {localPolicy.debtModifiers.sort((a,b) => a.daysEnd - b.daysEnd).map(rule => (
                        <div key={rule.id} className="grid grid-cols-3 gap-2 items-center">
                            <input type="number" value={rule.daysEnd} onChange={e => handleDebtRuleChange(rule.id, 'daysEnd', +e.target.value)} className="p-2 border border-slate-300 rounded-md" placeholder="Thanh toán trong X ngày"/>
                            <div className="relative">
                               <input type="number" value={rule.modifier * 100} onChange={e => handleDebtRuleChange(rule.id, 'modifier', +e.target.value / 100)} className="p-2 border border-slate-300 rounded-md w-full pr-8" placeholder="Hệ số"/>
                               <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">%</span>
                            </div>
                            <input type="text" value={rule.status} onChange={e => handleDebtRuleChange(rule.id, 'status', e.target.value)} className="p-2 border border-slate-300 rounded-md" placeholder="Tên trạng thái"/>
                        </div>
                    ))}
                </PolicyCard>
                 <PolicyCard title="Chính sách Đặc biệt">
                    <InputGroup label="Kênh Bệnh viện (Hệ số)">
                        <input type="number" value={localPolicy.hospitalChannel.rateMultiplier} onChange={e => handleNestedChange('hospitalChannel.rateMultiplier', +e.target.value)} className="p-2 border border-slate-300 rounded-md w-full"/>
                    </InputGroup>
                    <InputGroup label="HH Hàng Nhập khẩu (%)">
                         <div className="relative">
                            <input type="number" value={localPolicy.importedEquipment.rate * 100} onChange={e => handleNestedChange('importedEquipment.rate', +e.target.value/100)} className="p-2 border border-slate-300 rounded-md w-full pr-8"/>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">%</span>
                        </div>
                    </InputGroup>
                     <InputGroup label="HH Hàng Thương mại (%)">
                         <div className="relative">
                            <input type="number" value={localPolicy.commercialEquipment.rate * 100} onChange={e => handleNestedChange('commercialEquipment.rate', +e.target.value/100)} className="p-2 border border-slate-300 rounded-md w-full pr-8"/>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">%</span>
                        </div>
                    </InputGroup>
                </PolicyCard>
                <PolicyCard title="Thưởng">
                    <InputGroup label="Thưởng KH Mới (Số tiền)">
                        <input type="number" value={localPolicy.bonuses.newCustomer.amount} onChange={e => handleNestedChange('bonuses.newCustomer.amount', +e.target.value)} step="50000" className="p-2 border border-slate-300 rounded-md w-full"/>
                    </InputGroup>
                    <InputGroup label="Thưởng KH Mới (Đơn tối thiểu)">
                        <input type="number" value={localPolicy.bonuses.newCustomer.minOrderValue} onChange={e => handleNestedChange('bonuses.newCustomer.minOrderValue', +e.target.value)} step="1000000" className="p-2 border border-slate-300 rounded-md w-full"/>
                    </InputGroup>
                     <InputGroup label="Thưởng FitME (Trên mỗi đơn vị)">
                        <input type="number" value={localPolicy.bonuses.fitme.amountPerUnit} onChange={e => handleNestedChange('bonuses.fitme.amountPerUnit', +e.target.value)} step="50000" className="p-2 border border-slate-300 rounded-md w-full"/>
                    </InputGroup>
                </PolicyCard>
                 <PolicyCard title="Quy tắc Loại trừ Hoa hồng">
                    <InputGroup label="Loại trừ SKU chứa chữ">
                        <div className="space-y-2">
                             <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSkuKeyword}
                                    onChange={e => setNewSkuKeyword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddSkuKeyword()}
                                    placeholder="ví dụ: OSTEO"
                                    className="p-2 border border-slate-300 rounded-md w-full"
                                />
                                <button onClick={handleAddSkuKeyword} className="bg-blue-500 text-white font-semibold px-4 rounded-md hover:bg-blue-600 shrink-0">Thêm</button>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {(localPolicy.nonCommissionableRules.skuContains || []).map(keyword => (
                                    <span key={keyword} className="bg-slate-200 text-slate-700 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
                                        {keyword}
                                        <button onClick={() => handleRemoveSkuKeyword(keyword)} className="text-slate-500 hover:text-slate-800">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </span>
                                ))}
                                {(!localPolicy.nonCommissionableRules.skuContains || localPolicy.nonCommissionableRules.skuContains.length === 0) && (
                                     <p className="text-xs text-slate-400 italic">Không có từ khóa nào được loại trừ.</p>
                                )}
                            </div>
                        </div>
                    </InputGroup>
                </PolicyCard>
            </div>
        </div>
    );
};
