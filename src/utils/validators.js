export const isValidEmail = (value='') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
export function validatePassword(value='') {
  const errors=[];
  if (value.length < 8) errors.push('mínimo de 8 caracteres');
  if (!/[A-Z]/.test(value)) errors.push('uma letra maiúscula');
  if (!/[0-9]/.test(value)) errors.push('um número');
  return errors;
}
