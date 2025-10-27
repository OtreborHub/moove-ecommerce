import { Provider, ethers } from "ethers";
import { ReactNode, createContext, useContext, useState } from "react";
import AuctionDTO from "./utils/DTO/AuctionDTO";
import CollectionDTO from "./utils/DTO/CollectionDTO";
import { Role } from "./utils/enums/Role";
import { Sections } from "./utils/enums/Sections";

const infuraApiKey = import.meta.env.VITE_INFURA_API_KEY as string;
const infuraProvider: Provider = new ethers.InfuraProvider("sepolia", infuraApiKey);

const appContext = createContext({
  updateProvider: (provider: Provider) => {},
  updateChainId: (chainId: number) => {},
  updateSigner: (signer: string) => {},
  updateBalance: (balance: number) => {},
  updateNFTBalance: (NFTBalance: number) => {},
  updateRole: (role: Role) => {},
  updateSection: (section: Sections) => {},
  updateShownCollection: (collection: CollectionDTO) => {},
  updateShownNFT: (tokenId: number) => {},
  updateCollectionAddresses: (collectionAddresses: string[]) => {},
  updateCollections: (collections: CollectionDTO[]) => {},
  updateAuctions: (auction: AuctionDTO[]) => {},
  provider: infuraProvider,
  chainId: 0,
  signer: "",
  balance: 0,
  NFTBalance: 0,
  role: Role.NONE,
  section: Sections.MARKETPLACE,
  shownCollection: CollectionDTO.emptyInstance(),
  shownNFT: 0,
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
  const [signer, setSigner] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [NFTBalance, setNFTBalance] = useState<number>(0);
  const [role, setRole] = useState<Role>(Role.NONE);
  const [section, setSection] = useState<Sections>(Sections.MARKETPLACE);
  const [shownCollection, setShownCollection] = useState<CollectionDTO>(CollectionDTO.emptyInstance());
  const [shownNFT, setShownNFT] = useState<number>(0);
  const [collectionAddresses, setCollectionAddresses] = useState<string[]>([]);
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [auctions, setAuctions] = useState<AuctionDTO[]>([]);

  function updateProvider(provider: Provider) { setProvider(provider); }
  function updateChainId(chainId: number) { setChainId(chainId); }
  function updateSigner(signer: string) { setSigner(signer); }
  function updateBalance(balance: number) { setBalance(balance); }
  function updateNFTBalance(NFTBalance: number) { setNFTBalance(NFTBalance); }
  function updateRole(role: Role) { setRole(role); }
  function updateSection(section: Sections) { setSection(section); }
  function updateShownCollection(collection: CollectionDTO) { setShownCollection(collection); }
  function updateShownNFT(tokenId: number) { setShownNFT(tokenId); }
  function updateCollectionAddresses(collectionAddresses: string[]) { setCollectionAddresses(collectionAddresses); }
  function updateCollections(collections: CollectionDTO[]) { setCollections(collections); }
  function updateAuctions(auctions: AuctionDTO[]) { setAuctions(auctions); }

  return (
    <appContext.Provider value={{
      updateProvider,
      updateChainId,
      updateSigner,
      updateBalance,
      updateNFTBalance,
      updateRole,
      updateSection,
      updateShownCollection,
      updateShownNFT,
      updateCollectionAddresses,
      updateCollections,
      updateAuctions,
      provider,
      chainId,
      signer,
      balance,
      NFTBalance,
      role,
      section,
      shownCollection,
      shownNFT,
      collectionAddresses,
      collections,
      auctions,
    }}>
      {children}
    </appContext.Provider>
  );
}