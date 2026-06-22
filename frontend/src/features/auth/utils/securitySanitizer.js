export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  // Menghapus spasi di awal/akhir dan menetralisir tag HTML dasar untuk mencegah XSS dasar jika dipantulkan
  return input.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
};