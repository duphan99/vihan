
export const parseVNCurrency = (value: string): number => {
  if (!value) return 0;
  // Remove currency symbols (đ, VND), thousand separators (.,) and any other non-digit characters.
  const cleanedValue = value.replace(/[^0-9]/g, '');
  const number = parseInt(cleanedValue, 10);
  return isNaN(number) ? 0 : number;
};

export const parseVNNumber = (value: string): number => {
    if (!value) return 0;
    const cleanedValue = value.replace(/[^0-9]/g, '');
    const number = parseInt(cleanedValue, 10);
    return isNaN(number) ? 0 : number;
}

export const parseVNDate = (value: string): Date => {
  const parts = value.split(' ')[0].split('/');
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${value}`);
  }
  // DD/MM/YYYY
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  if(isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return date;
};