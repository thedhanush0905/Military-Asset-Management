export function isValidSerialNumber(serial: string): boolean {
  const regex = /^US-[A-Z]{3}-\d{4}-[A-Z]$/;
  return regex.test(serial);
}

export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
