/**
 * Format numbers into Korean Currency string (e.g., 2.9억)
 */
export const formatPrice = (price: number): string => {
  if (!price) return '-';
  if (price >= 100000000) {
    return `${(price / 100000000).toFixed(1)}억`;
  }
  if (price >= 10000) {
    return `${Math.round(price / 10000).toLocaleString()}만`;
  }
  return Math.round(price).toLocaleString();
};

/**
 * Clean complex auction addresses for UI display
 */
export const cleanAddress = (address: string): string => {
  if (!address) return '주소 정보 없음';
  return address.split('[')[0].trim();
};

/**
 * Get emoji icon based on property type
 */
export const getPropertyTypeIcon = (type: string): string => {
  if (type?.includes('아파트')) return '🏢';
  if (type?.includes('상가')) return '🏪';
  if (type?.includes('오피스텔')) return '🏨';
  return '🏠';
};

/**
 * Risk Grade styling mapping
 */
export const getRiskStyle = (risk: string) => {
  return risk === 'safe' 
    ? { label: '최상위 추천 (A+)', color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd' } 
    : { label: '검토 필요 (B)', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' };
};
