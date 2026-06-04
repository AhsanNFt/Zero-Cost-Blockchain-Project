import axios from "axios";

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || "";
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || "";
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || "";

const pinataApi = axios.create({
  baseURL: "https://api.pinata.cloud",
  headers: PINATA_JWT
    ? { Authorization: `Bearer ${PINATA_JWT}` }
    : {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
});

export async function uploadImageToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: file.name })
  );

  const response = await pinataApi.post("/pinning/pinFileToIPFS", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.IpfsHash;
}

export async function uploadJSONToIPFS(
  metadata: Record<string, unknown>,
  name: string
): Promise<string> {
  const response = await pinataApi.post("/pinning/pinJSONToIPFS", {
    pinataMetadata: { name },
    pinataContent: metadata,
  });

  return response.data.IpfsHash;
}

export function getIPFSUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

export function getIPFSUri(cid: string): string {
  return `ipfs://${cid}`;
}
