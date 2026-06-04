import { useState, useEffect, useCallback, useRef } from "react";
import { BrowserProvider, formatEther, isAddress } from "ethers";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

interface WalletState {
  address: string | null;
  balance: string;
  isConnected: boolean;
  chainId: string | null;
  isCorrectNetwork: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: "0",
    isConnected: false,
    chainId: null,
    isCorrectNetwork: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const providerRef = useRef<BrowserProvider | null>(null);

  interface EthereumProvider {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, handler: (data: unknown) => void) => void;
    removeListener: (event: string, handler: (data: unknown) => void) => void;
  }

  const getEthereum = (): EthereumProvider | undefined => {
    return (window as unknown as { ethereum?: EthereumProvider }).ethereum;
  };

  const updateBalance = useCallback(async (address: string) => {
    const eth = getEthereum();
    if (!eth) return;
    try {
      const provider = new BrowserProvider(eth as never);
      const bal = await provider.getBalance(address);
      setState((prev) => ({ ...prev, balance: formatEther(bal) }));
    } catch {
      // ignore balance errors
    }
  }, []);

  const checkConnection = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) return;

    try {
      const provider = new BrowserProvider(eth as never);
      providerRef.current = provider;
      const accounts = (await eth.request({ method: "eth_accounts" })) as string[];
      const chainId = (await eth.request({ method: "eth_chainId" })) as string;

      if (accounts && accounts.length > 0) {
        setState({
          address: accounts[0],
          isConnected: true,
          chainId,
          isCorrectNetwork: chainId === SEPOLIA_CHAIN_ID,
          balance: "0",
        });
        await updateBalance(accounts[0]);
      }
    } catch {
      // ignore
    }
  }, [updateBalance]);

  useEffect(() => {
    checkConnection();

    const eth = getEthereum();
    if (!eth) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        setState({
          address: null,
          balance: "0",
          isConnected: false,
          chainId: null,
          isCorrectNetwork: false,
        });
      } else {
        setState((prev) => ({
          ...prev,
          address: accs[0],
          isConnected: true,
        }));
        updateBalance(accs[0]);
      }
    };

    const handleChainChanged = (chainId: unknown) => {
      const cid = chainId as string;
      setState((prev) => ({
        ...prev,
        chainId: cid,
        isCorrectNetwork: cid === SEPOLIA_CHAIN_ID,
      }));
      window.location.reload();
    };

    eth.on("accountsChanged", handleAccountsChanged as never);
    eth.on("chainChanged", handleChainChanged as never);

    return () => {
      eth.removeListener("accountsChanged", handleAccountsChanged as never);
      eth.removeListener("chainChanged", handleChainChanged as never);
    };
  }, [checkConnection, updateBalance]);

  const connect = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[];
      const chainId = (await eth.request({ method: "eth_chainId" })) as string;

      if (accounts && accounts.length > 0) {
        setState({
          address: accounts[0],
          isConnected: true,
          chainId,
          isCorrectNetwork: chainId === SEPOLIA_CHAIN_ID,
          balance: "0",
        });
        await updateBalance(accounts[0]);
      }
    } catch {
      // user rejected
    } finally {
      setIsConnecting(false);
    }
  }, [updateBalance]);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      balance: "0",
      isConnected: false,
      chainId: null,
      isCorrectNetwork: false,
    });
  }, []);

  const switchToSepolia = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) return;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: unknown) {
      const err = switchError as { code: number };
      if (err.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Sepolia Testnet",
              nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/demo"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      }
    }
  }, []);

  const getSigner = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) return null;
    const provider = new BrowserProvider(eth as never);
    return provider.getSigner();
  }, []);

  const getProvider = useCallback(() => {
    const eth = getEthereum();
    if (!eth) return null;
    return new BrowserProvider(eth as never);
  }, []);

  return {
    ...state,
    isConnecting,
    connect,
    disconnect,
    switchToSepolia,
    getSigner,
    getProvider,
    isAddress,
  };
}
