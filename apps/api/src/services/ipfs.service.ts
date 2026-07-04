/**
 * Uploads certificate metadata JSON to IPFS via Pinata's pinning API.
 * Returns the CID which gets stored on-chain as `metadata_hash`.
 */
export interface CertificateMetadata {
  credentialTitle: string;
  studentWallet: string;
  institutionName: string;
  institutionWallet: string;
  issuedAt: string; // ISO date
  scholarshipId?: string;
  description?: string;
}

export async function pinCertificateMetadata(
  metadata: CertificateMetadata
): Promise<{ cid: string; url: string }> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error("PINATA_JWT is not configured");
  }

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `anchorpass-credential-${metadata.studentWallet}-${Date.now()}`,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pinata upload failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { IpfsHash: string };
  const gateway = process.env.PINATA_GATEWAY_URL ?? "https://gateway.pinata.cloud/ipfs";

  return { cid: data.IpfsHash, url: `${gateway}/${data.IpfsHash}` };
}

export async function fetchCertificateMetadata(cid: string): Promise<CertificateMetadata> {
  const gateway = process.env.PINATA_GATEWAY_URL ?? "https://gateway.pinata.cloud/ipfs";
  const response = await fetch(`${gateway}/${cid}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata for CID ${cid}`);
  }
  return (await response.json()) as CertificateMetadata;
}
