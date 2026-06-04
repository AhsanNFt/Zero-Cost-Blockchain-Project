# 🔌 SkillChain Employer API Documentation

## Overview

The SkillChain Employer API provides instant, zero-cost credential verification for HR systems, ATS platforms, and recruitment tools. All endpoints are **free to use** with no rate limits for legitimate verification purposes.

**Base URL:** `https://api.skillchain.io/api/trpc`  
**Protocol:** tRPC over HTTP  
**Authentication:** Public (no API key required for read operations)

---

## 🚀 Quick Start

### REST-like Usage (via tRPC)

```typescript
// Example: Verify a single credential
const response = await fetch(
  'https://api.skillchain.io/api/trpc/employer.verifySingle?input={"tokenId":123}',
  { method: 'GET' }
);
const data = await response.json();
```

### TypeScript Client (Recommended)

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './api/router';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://api.skillchain.io/api/trpc',
    }),
  ],
});

// Verify credential
const result = await client.employer.verifySingle.query({ tokenId: 123 });
```

---

## 📋 API Endpoints

### 1. Verify Single Credential

**Endpoint:** `employer.verifySingle`  
**Method:** `query` (GET)  
**Use Case:** Quick verification during interview process

#### Request

```typescript
{
  tokenId: number;           // Required: Credential token ID
  verifierAddress?: string;  // Optional: Your wallet address for logging
}
```

#### Response

```typescript
{
  success: boolean;
  tokenId: number;
  isValid: boolean;
  credential: {
    name: string;              // e.g., "Full-Stack Web Development"
    institution: string;       // e.g., "MIT"
    credentialType: string;    // "course" | "bootcamp" | "workshop" | "certification" | "skillbadge"
    description: string;
    issueDate: string;         // ISO date
    expiryDate: string | null;
    recipientAddress: string;  // Wallet address of credential holder
    issuerAddress: string;     // Wallet address of issuer
    isRevoked: boolean;
    transactionHash: string;   // Ethereum transaction hash
    network: string;           // "sepolia" | "mainnet"
    metadataUri: string;       // IPFS URI
  };
  blockchain: {
    verified: boolean;
    issuer: string;
    owner: string;
    issueTimestamp: number;
    isRevoked: boolean;
  };
  verifiedAt: string;          // ISO timestamp
}
```

#### Example

```bash
# cURL
curl "https://api.skillchain.io/api/trpc/employer.verifySingle?input=%7B%22tokenId%22%3A123%7D"

# JavaScript
const result = await client.employer.verifySingle.query({ 
  tokenId: 123,
  verifierAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
});

console.log(result.isValid); // true/false
console.log(result.credential.name); // "Blockchain Development Bootcamp"
```

---

### 2. Batch Verify Credentials

**Endpoint:** `employer.verifyBatch`  
**Method:** `query` (GET)  
**Use Case:** Bulk verification for applicant screening  
**Limit:** 50 credentials per request

#### Request

```typescript
{
  tokenIds: number[];        // Array of token IDs (max 50)
  verifierAddress?: string;  // Optional: Your wallet address
}
```

#### Response

```typescript
{
  success: boolean;
  totalRequested: number;
  totalVerified: number;
  results: Array<{
    tokenId: number;
    success: boolean;
    isValid?: boolean;
    name?: string;
    institution?: string;
    credentialType?: string;
    issueDate?: string;
    recipientAddress?: string;
    isRevoked?: boolean;
    error?: string;
  }>;
  verifiedAt: string;
}
```

#### Example

```typescript
// Verify multiple credentials at once
const result = await client.employer.verifyBatch.query({
  tokenIds: [123, 456, 789],
  verifierAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
});

console.log(`Verified ${result.totalVerified} out of ${result.totalRequested}`);

result.results.forEach(cred => {
  if (cred.success && cred.isValid) {
    console.log(`✅ ${cred.name} from ${cred.institution}`);
  } else {
    console.log(`❌ Token ${cred.tokenId}: ${cred.error}`);
  }
});
```

---

### 3. Get Credentials by Wallet

**Endpoint:** `employer.getByWallet`  
**Method:** `query` (GET)  
**Use Case:** View candidate's complete credential portfolio

#### Request

```typescript
{
  walletAddress: string;     // Ethereum wallet address (0x...)
  includeRevoked?: boolean;  // Default: false
}
```

#### Response

```typescript
{
  success: boolean;
  walletAddress: string;
  totalCredentials: number;
  credentials: Array<{
    tokenId: number;
    name: string;
    institution: string;
    credentialType: string;
    description: string;
    issueDate: string;
    expiryDate: string | null;
    isRevoked: boolean;
    transactionHash: string;
    metadataUri: string;
  }>;
}
```

#### Example

```typescript
// Get all credentials for a candidate
const result = await client.employer.getByWallet.query({
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  includeRevoked: false
});

console.log(`Candidate has ${result.totalCredentials} credentials`);

result.credentials.forEach(cred => {
  console.log(`- ${cred.name} (${cred.institution}) - ${cred.issueDate}`);
});
```

---

### 4. Get Credentials by Institution

**Endpoint:** `employer.getByInstitution`  
**Method:** `query` (GET)  
**Use Case:** Verify all credentials from a specific institution

#### Request

```typescript
{
  institution: string;  // Institution name
  limit?: number;       // Default: 20, Max: 100
  offset?: number;      // Default: 0
}
```

#### Response

```typescript
{
  success: boolean;
  institution: string;
  total: number;
  limit: number;
  offset: number;
  credentials: Array<Credential>;
}
```

#### Example

```typescript
// Get all MIT credentials
const result = await client.employer.getByInstitution.query({
  institution: "MIT",
  limit: 50,
  offset: 0
});

console.log(`Found ${result.total} credentials from ${result.institution}`);
```

---

### 5. Get Verification Statistics

**Endpoint:** `employer.getStats`  
**Method:** `query` (GET)  
**Use Case:** Analytics for employers and institutions

#### Request

```typescript
{
  walletAddress?: string;  // Optional: Filter by wallet
  institution?: string;    // Optional: Filter by institution
}
```

#### Response

```typescript
{
  success: boolean;
  stats: {
    totalCredentials: number;
    activeCredentials: number;
    revokedCredentials: number;
    totalVerifications: number;
    credentialTypes: {
      course: number;
      bootcamp: number;
      workshop: number;
      certification: number;
      skillbadge: number;
    };
  };
}
```

#### Example

```typescript
// Get statistics for a candidate
const result = await client.employer.getStats.query({
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
});

console.log(`Total: ${result.stats.totalCredentials}`);
console.log(`Active: ${result.stats.activeCredentials}`);
console.log(`Bootcamps: ${result.stats.credentialTypes.bootcamp}`);
```

---

### 6. Search Credentials

**Endpoint:** `employer.search`  
**Method:** `query` (GET)  
**Use Case:** Find candidates with specific skills

#### Request

```typescript
{
  query: string;                    // Search term
  credentialType?: string;          // Optional filter
  limit?: number;                   // Default: 20, Max: 50
}
```

#### Response

```typescript
{
  success: boolean;
  query: string;
  totalResults: number;
  credentials: Array<{
    tokenId: number;
    name: string;
    institution: string;
    credentialType: string;
    description: string;
    issueDate: string;
    recipientAddress: string;
  }>;
}
```

#### Example

```typescript
// Search for blockchain credentials
const result = await client.employer.search.query({
  query: "blockchain",
  credentialType: "bootcamp",
  limit: 20
});

console.log(`Found ${result.totalResults} blockchain bootcamp credentials`);
```

---

## 🔗 Integration Examples

### 1. Greenhouse ATS Plugin

```typescript
// Greenhouse webhook handler
app.post('/greenhouse/verify-candidate', async (req, res) => {
  const { candidateId, walletAddress } = req.body;
  
  // Get all credentials for candidate
  const credentials = await client.employer.getByWallet.query({
    walletAddress,
    includeRevoked: false
  });
  
  // Verify each credential
  const tokenIds = credentials.credentials.map(c => c.tokenId);
  const verification = await client.employer.verifyBatch.query({
    tokenIds,
    verifierAddress: process.env.COMPANY_WALLET
  });
  
  // Update Greenhouse with results
  const validCredentials = verification.results.filter(r => r.isValid);
  
  res.json({
    candidateId,
    totalCredentials: credentials.totalCredentials,
    validCredentials: validCredentials.length,
    credentials: validCredentials
  });
});
```

---

### 2. LinkedIn Profile Integration

```typescript
// Display credentials on LinkedIn profile
async function getLinkedInCredentials(walletAddress: string) {
  const result = await client.employer.getByWallet.query({
    walletAddress,
    includeRevoked: false
  });
  
  return result.credentials.map(cred => ({
    title: cred.name,
    issuer: cred.institution,
    date: cred.issueDate,
    verificationUrl: `https://skillchain.io/verify/${cred.tokenId}`,
    badge: `https://skillchain.io/badge/${cred.tokenId}.png`
  }));
}
```

---

### 3. Custom HR Dashboard

```typescript
// React component for HR dashboard
function CandidateCredentials({ walletAddress }: { walletAddress: string }) {
  const { data, isLoading } = trpc.employer.getByWallet.useQuery({
    walletAddress,
    includeRevoked: false
  });
  
  if (isLoading) return <Spinner />;
  
  return (
    <div>
      <h2>Verified Credentials ({data?.totalCredentials})</h2>
      {data?.credentials.map(cred => (
        <CredentialCard key={cred.tokenId} credential={cred} />
      ))}
    </div>
  );
}
```

---

### 4. Workday Integration

```typescript
// Workday API integration
async function syncCredentialsToWorkday(employeeId: string, walletAddress: string) {
  // Get credentials from SkillChain
  const credentials = await client.employer.getByWallet.query({
    walletAddress,
    includeRevoked: false
  });
  
  // Sync to Workday
  for (const cred of credentials.credentials) {
    await workdayAPI.addCredential({
      employeeId,
      credentialName: cred.name,
      issuer: cred.institution,
      issueDate: cred.issueDate,
      verificationUrl: `https://skillchain.io/verify/${cred.tokenId}`,
      status: cred.isRevoked ? 'Revoked' : 'Active'
    });
  }
}
```

---

## 🔐 Security Best Practices

### 1. Verify on Blockchain
Always cross-reference with blockchain data:

```typescript
const result = await client.employer.verifySingle.query({ tokenId: 123 });

// Check both database and blockchain agree
if (result.credential.isRevoked !== result.blockchain.isRevoked) {
  console.warn('Mismatch detected - blockchain is source of truth');
}
```

### 2. Check Expiry Dates

```typescript
const result = await client.employer.verifySingle.query({ tokenId: 123 });

if (result.credential.expiryDate) {
  const expiryDate = new Date(result.credential.expiryDate);
  const isExpired = expiryDate < new Date();
  
  if (isExpired) {
    console.warn('Credential has expired');
  }
}
```

### 3. Verify Issuer Reputation

```typescript
// Maintain a whitelist of trusted institutions
const TRUSTED_INSTITUTIONS = ['MIT', 'Stanford', 'Harvard', 'Lambda School'];

const result = await client.employer.verifySingle.query({ tokenId: 123 });

if (!TRUSTED_INSTITUTIONS.includes(result.credential.institution)) {
  console.warn('Credential from unverified institution');
}
```

---

## 📊 Rate Limits

**Current:** No rate limits for legitimate use  
**Fair Use Policy:** 
- Max 50 credentials per batch request
- Max 100 credentials per institution query
- Recommended: Cache results for 24 hours

**Future:** API keys for high-volume users (still free)

---

## 🐛 Error Handling

### Common Errors

```typescript
// Credential not found
{
  success: false,
  error: "Credential not found",
  tokenId: 123
}

// Invalid wallet address
{
  success: false,
  error: "Invalid wallet address format"
}

// Blockchain verification failed
{
  success: false,
  error: "Verification failed",
  details: "RPC connection timeout"
}
```

### Recommended Error Handling

```typescript
try {
  const result = await client.employer.verifySingle.query({ tokenId: 123 });
  
  if (!result.success) {
    console.error(`Verification failed: ${result.error}`);
    return;
  }
  
  if (!result.isValid) {
    console.warn('Credential is revoked or invalid');
    return;
  }
  
  // Credential is valid
  console.log('✅ Verified:', result.credential.name);
  
} catch (error) {
  console.error('API error:', error);
  // Fallback to manual verification
}
```

---

## 🚀 Performance Tips

### 1. Batch Requests
```typescript
// ❌ Bad: Multiple individual requests
for (const tokenId of tokenIds) {
  await client.employer.verifySingle.query({ tokenId });
}

// ✅ Good: Single batch request
await client.employer.verifyBatch.query({ tokenIds });
```

### 2. Cache Results
```typescript
// Cache verification results for 24 hours
const cache = new Map();

async function verifyCached(tokenId: number) {
  const cached = cache.get(tokenId);
  if (cached && Date.now() - cached.timestamp < 86400000) {
    return cached.data;
  }
  
  const result = await client.employer.verifySingle.query({ tokenId });
  cache.set(tokenId, { data: result, timestamp: Date.now() });
  return result;
}
```

### 3. Parallel Queries
```typescript
// Verify multiple wallets in parallel
const wallets = ['0x123...', '0x456...', '0x789...'];

const results = await Promise.all(
  wallets.map(wallet => 
    client.employer.getByWallet.query({ walletAddress: wallet })
  )
);
```

---

## 📞 Support

- **Documentation:** https://docs.skillchain.io
- **Discord:** https://discord.gg/skillchain
- **Email:** api-support@skillchain.io
- **GitHub Issues:** https://github.com/skillchain/api/issues

---

## 📄 License

This API is free to use for credential verification purposes. Commercial use requires attribution to SkillChain.

---

## 🔄 Changelog

### v1.0.0 (Current)
- ✅ Single credential verification
- ✅ Batch verification (up to 50)
- ✅ Wallet-based queries
- ✅ Institution-based queries
- ✅ Statistics endpoint
- ✅ Search functionality

### Coming Soon (v1.1.0)
- 🔜 API keys for high-volume users
- 🔜 Webhook notifications
- 🔜 Advanced search filters
- 🔜 Skill taxonomy integration
- 🔜 Issuer reputation scores

---

<div align="center">

**Built with ❤️ by SkillChain**

[Website](https://skillchain.io) • [API Docs](https://docs.skillchain.io) • [Discord](https://discord.gg/skillchain)

</div>
