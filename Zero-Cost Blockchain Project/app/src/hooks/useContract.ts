import { useCallback } from "react";
import { Contract } from "ethers";
import {
  SkillChainCredentialABI,
  CONTRACT_ADDRESS,
  CredentialType,
} from "@contracts/abi/SkillChainCredential";
import { useWallet } from "./useWallet";

export function useContract() {
  const { getSigner, getProvider, address } = useWallet();

  const getContract = useCallback(
    async (withSigner = false) => {
      if (withSigner) {
        const signer = await getSigner();
        if (!signer) return null;
        return new Contract(CONTRACT_ADDRESS, SkillChainCredentialABI as never, signer);
      }
      const provider = getProvider();
      if (!provider) return null;
      return new Contract(CONTRACT_ADDRESS, SkillChainCredentialABI as never, provider);
    },
    [getSigner, getProvider]
  );

  const issueCredential = useCallback(
    async (recipient: string, metadataUri: string, credType: number) => {
      const contract = await getContract(true);
      if (!contract) throw new Error("Contract not initialized");
      const tx = await (contract as Contract).issueCredential(recipient, metadataUri, credType);
      const receipt = await tx.wait();
      return { txHash: tx.hash, receipt };
    },
    [getContract]
  );

  const verifyCredential = useCallback(
    async (tokenId: number) => {
      const contract = await getContract(false);
      if (!contract) return null;
      try {
        const result = await (contract as Contract).verifyCredential(tokenId);
        return {
          issuer: result[0] as string,
          metadataURI: result[1] as string,
          credType: Number(result[2]),
          issueTimestamp: Number(result[3]),
          isRevoked: Boolean(result[4]),
          owner: result[5] as string,
        };
      } catch {
        return null;
      }
    },
    [getContract]
  );

  const getCredentialsByOwner = useCallback(
    async (ownerAddress?: string) => {
      const contract = await getContract(false);
      if (!contract) return [];
      const owner = ownerAddress || address;
      if (!owner) return [];
      try {
        const tokenIds = await (contract as Contract).getCredentialsByOwner(owner);
        return (tokenIds as bigint[]).map((id) => Number(id));
      } catch {
        return [];
      }
    },
    [getContract, address]
  );

  const getTotalIssued = useCallback(async () => {
    const contract = await getContract(false);
    if (!contract) return 0;
    try {
      const total = await (contract as Contract).totalIssued();
      return Number(total);
    } catch {
      return 0;
    }
  }, [getContract]);

  return {
    issueCredential,
    verifyCredential,
    getCredentialsByOwner,
    getTotalIssued,
    CredentialType,
    CONTRACT_ADDRESS,
  };
}
