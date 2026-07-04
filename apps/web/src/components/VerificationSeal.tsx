interface Props {
  status: "VALID" | "REVOKED";
  size?: "sm" | "lg";
}

export function VerificationSeal({ status, size = "sm" }: Props) {
  const isValid = status === "VALID";
  const dim = size === "lg" ? 96 : 40;
  const color = isValid ? "#3D9970" : "#8B3A3A";

  return (
    <div
      className="seal-ring inline-flex items-center justify-center rounded-full"
      style={{ width: dim, height: dim }}
      role="img"
      aria-label={isValid ? "Credential verified" : "Credential revoked"}
    >
      <svg width={dim} height={dim} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="3" fill="none" />
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="2 4"
          fill="none"
        />
        {isValid ? (
          <path
            d="M32 51l12 12 24-26"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ) : (
          <path
            d="M36 36l28 28M64 36L36 64"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </svg>
    </div>
  );
}
