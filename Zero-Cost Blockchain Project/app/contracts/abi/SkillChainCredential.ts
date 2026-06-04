// SkillChainCredential Smart Contract ABI
export const SkillChainCredentialABI: readonly unknown[] = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "address", name: "issuer", type: "address" },
      { internalType: "string", name: "institution", type: "string" },
    ],
    name: "IssuerAuthorized",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "issuer", type: "address" },
    ],
    name: "IssuerDeauthorized",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "address", name: "issuer", type: "address" },
      { internalType: "uint8", name: "credType", type: "uint8" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "CredentialIssued",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "address", name: "revokedBy", type: "address" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "CredentialRevoked",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "issuer", type: "address" },
      { internalType: "string", name: "institution", type: "string" },
    ],
    name: "authorizeIssuer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "issuer", type: "address" },
    ],
    name: "deauthorizeIssuer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "uint8", name: "credType", type: "uint8" },
    ],
    name: "issueCredential",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "revokeCredential",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "verifyCredential",
    outputs: [
      { internalType: "address", name: "issuer", type: "address" },
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "uint8", name: "credType", type: "uint8" },
      { internalType: "uint256", name: "issueTimestamp", type: "uint256" },
      { internalType: "bool", name: "isRevoked", type: "bool" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "getCredentialsByOwner",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalIssued",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "credentials",
    outputs: [
      { internalType: "address", name: "issuer", type: "address" },
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "uint8", name: "credType", type: "uint8" },
      { internalType: "uint256", name: "issueTimestamp", type: "uint256" },
      { internalType: "bool", name: "isRevoked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
    ],
    name: "authorizedIssuers",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

// Sepolia testnet deployment address
export const CONTRACT_ADDRESS = "0x8e7cb6ad548497038fe974d5439e03ba0224e096";


// Credential type enum values
export const CredentialType = {
  CourseCompletion: 0,
  Bootcamp: 1,
  Workshop: 2,
  Certification: 3,
  SkillBadge: 4,
} as const;

export const CredentialTypeLabels: Record<number, string> = {
  0: "Course Completion",
  1: "Bootcamp",
  2: "Workshop",
  3: "Certification",
  4: "Skill Badge",
};
