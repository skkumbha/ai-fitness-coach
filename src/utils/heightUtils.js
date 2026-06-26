/**
 * Convert centimeters to feet and inches (rounded to nearest inch).
 */
export function cmToFeetInches(cm) {
  const numericCm = Number(cm);
  if (!numericCm || numericCm <= 0) {
    return { feet: '', inches: '' };
  }

  const totalInches = Math.round(numericCm / 2.54);
  return {
    feet: Math.floor(totalInches / 12).toString(),
    inches: (totalInches % 12).toString()
  };
}

/**
 * Convert feet and inches to centimeters (rounded integer string).
 */
export function feetInchesToCm(feet, inches) {
  const totalInches = (Number(feet) || 0) * 12 + (Number(inches) || 0);
  if (totalInches <= 0) {
    return '';
  }
  return Math.round(totalInches * 2.54).toString();
}
