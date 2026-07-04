interface Props {
  qrCodeDataUrl?: string;
  verificationUrl: string;
}

export function QRVerifier({ qrCodeDataUrl, verificationUrl }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-ink/10 bg-white p-6">
      {qrCodeDataUrl ? (
        <img src={qrCodeDataUrl} alt="QR code to verify this credential" className="h-40 w-40" />
      ) : (
        <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-ink/5 font-mono text-xs text-ink/40">
          QR unavailable
        </div>
      )}
      <a
        href={verificationUrl}
        className="font-mono text-xs text-institution underline underline-offset-2"
      >
        {verificationUrl}
      </a>
    </div>
  );
}
