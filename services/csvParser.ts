import Papa from 'papaparse';
import type { RawSaleRecord, SaleRecord } from '../types';
import { parseVNCurrency, parseVNDate, parseVNNumber } from '../utils/parser';


const CSV_COLUMN_MAPPING: { [key: string]: keyof SaleRecord } = {
    'Sản phẩm': 'productName',
    'SKU': 'sku',
    'Tên khách hàng': 'customerName',
    'Số HĐ': 'invoiceId',
    'Ngày': 'orderDate',
    'Số lượng': 'quantity',
    'Đơn giá': 'unitPrice',
    'Tổng': 'total',
    'Ngày thanh toán': 'paymentDate',
    'Nhân viên bán hàng': 'salesRepresentative',
};


export const parseCSV = (file: File): Promise<SaleRecord[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          return reject(new Error('Lỗi phân tích CSV: ' + results.errors.map(e => e.message).join(', ')));
        }

        try {
            const rawData = results.data as RawSaleRecord[];
            
            // Bỏ qua dòng cuối cùng, thường là dòng tổng hợp.
            const dataToProcess = rawData.slice(0, -1);

            if (dataToProcess.length === 0) {
                resolve([]);
                return;
            }

            const requiredHeaders = Object.keys(CSV_COLUMN_MAPPING);
            const actualHeaders = Object.keys(dataToProcess[0] || {});
            const missingHeaders = requiredHeaders.filter(h => !actualHeaders.includes(h));

            if(missingHeaders.length > 0) {
                return reject(new Error(`Thiếu các cột CSV bắt buộc: ${missingHeaders.join(', ')}`));
            }

            const transformedData = dataToProcess.map((rawRecord, index) => {
                const saleRecord: Partial<SaleRecord> = {};
                for (const key in CSV_COLUMN_MAPPING) {
                    const targetKey = CSV_COLUMN_MAPPING[key];
                    const rawValue = rawRecord[key]?.trim();

                    if (!rawValue) {
                        if (targetKey === 'paymentDate') {
                           (saleRecord as any)[targetKey] = null;
                        }
                        continue;
                    }

                    try {
                        switch (targetKey) {
                            case 'orderDate':
                                saleRecord.orderDate = parseVNDate(rawValue);
                                break;
                            case 'paymentDate':
                                saleRecord.paymentDate = rawValue ? parseVNDate(rawValue) : null;
                                break;
                            case 'quantity':
                                saleRecord.quantity = parseVNNumber(rawValue);
                                break;
                            case 'unitPrice':
                            case 'total':
                                saleRecord[targetKey] = parseVNCurrency(rawValue);
                                break;
                            default:
                                (saleRecord as any)[targetKey] = rawValue;
                        }
                    } catch (e) {
                         throw new Error(`Lỗi phân tích dòng ${index + 2}, cột '${key}', giá trị '${rawValue}': ${(e as Error).message}`);
                    }
                }

                // If sales representative is missing, assign it to 'Công ty'
                if (!saleRecord.salesRepresentative) {
                    saleRecord.salesRepresentative = 'Công ty';
                }

                 // Ensure required fields are present
                if(!saleRecord.total || !saleRecord.orderDate){
                    // Skip rows that are likely summary rows or missing essential data
                    return null;
                }
                return saleRecord as SaleRecord;
            }).filter((r): r is SaleRecord => r !== null);
            
            resolve(transformedData);

        } catch(e) {
            reject(e);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};