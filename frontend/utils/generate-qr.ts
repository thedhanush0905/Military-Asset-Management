export function generateQrUrl(serial: string): string {
  // Generates a high-quality QR code mapping the specific serial number with AEGIS styles
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(serial)}&color=1a2820&bgcolor=ffffff`;
}
