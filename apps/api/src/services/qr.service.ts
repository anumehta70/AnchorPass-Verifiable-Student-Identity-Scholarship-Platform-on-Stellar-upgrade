import QRCode from "qrcode";

export function buildVerificationUrl(credentialId: string): string {
  const base = process.env.PUBLIC_APP_URL ?? "http://localhost:5173";
  return `${base}/verify/${credentialId}`;
}

export async function generateVerificationQr(credentialId: string): Promise<string> {
  const url = buildVerificationUrl(credentialId);
  // Returns a data: URL (base64 PNG) the frontend can render directly in an <img>.
  return QRCode.toDataURL(url, { margin: 1, width: 320 });
}
