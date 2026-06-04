import { Alchemy, Network } from "alchemy-sdk";
import { formatEther } from "ethers";

const API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || "demo";

const config = {
  apiKey: API_KEY,
  network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(config);

export async function getBalance(address: string): Promise<string> {
  try {
    const balance = await alchemy.core.getBalance(address);
    return formatEther(balance.toBigInt());
  } catch {
    return "0";
  }
}

export async function getNFTsForOwner(
  ownerAddress: string,
  contractAddress?: string
) {
  try {
    const options = contractAddress
      ? { contractAddresses: [contractAddress] }
      : undefined;
    const nfts = await alchemy.nft.getNftsForOwner(ownerAddress, options);
    return nfts.ownedNfts;
  } catch {
    return [];
  }
}

export async function waitForTransaction(txHash: string, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const receipt = await alchemy.core.getTransactionReceipt(txHash);
      if (receipt) {
        return receipt;
      }
    } catch {
      // tx not mined yet
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Transaction confirmation timeout");
}

export function getEtherscanLink(txHash: string): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

export { alchemy };
