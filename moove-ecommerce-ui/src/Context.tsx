import { Provider, Signer, ethers } from "ethers";
import { ReactNode, createContext, useContext, useState } from "react";
import AuctionDTO from "./utils/DTO/AuctionDTO";
import CollectionDTO from "./utils/DTO/CollectionDTO";
import { Role } from "./utils/enums/Role";
import { Sections } from "./utils/enums/Sections";

const infuraApiKey = import.meta.env.VITE_INFURA_API_KEY as string;
const infuraProvider: Provider = new ethers.InfuraProvider("sepolia", infuraApiKey);
export const emptySigner: Signer = new ethers.VoidSigner("0x0000000000000000000000000000000000000000");

const appContext = createContext({
  updateProvider: (provider: Provider) => {},
  updateChainId: (chainId: number) => {},
  updateSigner: (signer: Signer) => {},
  updateSignerAddress: (address: string) => {},
  updateBalance: (balance: number) => {},
  updateNFTBalance: (NFTBalance: number) => {},
  updateRole: (role: Role) => {},
  updateSection: (section: Sections) => {},
  updateShownCollection: (collection: CollectionDTO) => {},
  updateCollectionAddresses: (collectionAddresses: string[]) => {},
  updateCollections: (collections: CollectionDTO[]) => {},
  updateAuctions: (auction: AuctionDTO[]) => {},
  provider: infuraProvider,
  chainId: 0,
  signer: emptySigner,
  signerAddress: "",
  balance: 0,
  NFTBalance: 0,
  role: Role.NONE,
  section: Sections.MARKETPLACE,
  shownCollection: CollectionDTO.emptyInstance(),
  collectionAddresses: [] as string[],
  collections: [] as CollectionDTO[],
  auctions: [] as AuctionDTO[],
});

export function useAppContext() {
  return useContext(appContext);
}

interface AppContextProviderProps {
  children: ReactNode;
}

export function AppContextProvider({ children }: AppContextProviderProps) {
  const [provider, setProvider] = useState<Provider>(infuraProvider);
  const [chainId, setChainId] = useState<number>(0);
  const [signer, setSigner] = useState<Signer>(emptySigner);
  const [signerAddress, setSignerAddress] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [NFTBalance, setNFTBalance] = useState<number>(0);
  const [role, setRole] = useState<Role>(Role.NONE);
  const [section, setSection] = useState<Sections>(Sections.MARKETPLACE);
  const [shownCollection, setShownCollection] = useState<CollectionDTO>(CollectionDTO.emptyInstance());
  const [collectionAddresses, setCollectionAddresses] = useState<string[]>([]);
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [auctions, setAuctions] = useState<AuctionDTO[]>([]);

  function updateProvider(provider: Provider) { setProvider(provider); }
  function updateChainId(chainId: number) { setChainId(chainId); }
  function updateSigner(signer: Signer) { setSigner(signer); }
  function updateSignerAddress(signerAddress: string) { setSignerAddress(signerAddress); }
  function updateBalance(balance: number) { setBalance(balance); }
  function updateNFTBalance(NFTBalance: number) { setNFTBalance(NFTBalance); }
  function updateRole(role: Role) { setRole(role); }
  function updateSection(section: Sections) { setSection(section); }
  function updateShownCollection(collection: CollectionDTO) { setShownCollection(collection); }
  function updateCollectionAddresses(collectionAddresses: string[]) { setCollectionAddresses(collectionAddresses); }
  function updateCollections(collections: CollectionDTO[]) { setCollections(collections); }
  function updateAuctions(auctions: AuctionDTO[]) { setAuctions(auctions); }

  return (
    <appContext.Provider value={{
      updateProvider,
      updateChainId,
      updateSigner,
      updateSignerAddress,
      updateBalance,
      updateNFTBalance,
      updateRole,
      updateSection,
      updateShownCollection,
      updateCollectionAddresses,
      updateCollections,
      updateAuctions,
      provider,
      chainId,
      signer,
      signerAddress,
      balance,
      NFTBalance,
      role,
      section,
      shownCollection,
      collectionAddresses,
      collections,
      auctions,
    }}>
      {children}
    </appContext.Provider>
  );
}