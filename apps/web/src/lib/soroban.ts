import { rpc, TransactionBuilder, Networks, Contract, xdr, Operation, Asset } from "@stellar/stellar-sdk";

const RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
const CONTRACT_ID = import.meta.env.VITE_SOROBAN_CONTRACT_ID;

export const server = new rpc.Server(RPC_URL);

/**
 * Build and simulate a Soroban contract invocation.
 * Returns the unsigned XDR ready for wallet signing.
 */
export async function prepareContractCall(
  publicKey: string,
  method: string,
  args: xdr.ScVal[] = [],
): Promise<string> {
  if (!CONTRACT_ID) {
    throw new Error("Missing VITE_SOROBAN_CONTRACT_ID environment variable.");
  }

  const account = await server.getAccount(publicKey);
  const contract = new Contract(CONTRACT_ID);

  const simTx = new TransactionBuilder(account, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(simTx);
  return preparedTx.toXDR();
}

/**
 * Build a classic Stellar payment transaction (XLM transfer).
 * This is a separate transaction from the Soroban contract call because
 * Soroban transactions can only contain a single invokeHostFunction operation.
 */
export async function preparePayment(
  senderPublicKey: string,
  destination: string,
  amountXLM: string,
): Promise<string> {
  const account = await server.getAccount(senderPublicKey);

  const tx = new TransactionBuilder(account, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount: amountXLM,
      })
    )
    .setTimeout(30)
    .build();

  return tx.toXDR();
}

export async function submitContractTx(signedXdr: string): Promise<string> {
  const tx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
  
  // Submit to the network
  const sendResponse = await server.sendTransaction(tx);
  
  if (sendResponse.status === "ERROR") {
    throw new Error(`Transaction failed: ${JSON.stringify(sendResponse.errorResult)}`);
  }

  // Poll for the result
  let txResponse = await server.getTransaction(sendResponse.hash);
  let retries = 0;
  
  while (txResponse.status === "NOT_FOUND" && retries < 15) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    txResponse = await server.getTransaction(sendResponse.hash);
    retries++;
  }

  if (txResponse.status === "FAILED") {
    throw new Error("Transaction execution failed on-chain.");
  }

  return sendResponse.hash;
}
