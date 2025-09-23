import { Provider, ethers } from "ethers";
import { createContext, useContext, ReactNode, useState } from "react";
import { Role } from "./utils/enums/Role";
import { Sections } from "./utils/enums/Sections";
import CollectionDTO from "./utils/DTO/CollectionDTO";

const infuraApiKey = process.env.REACT_APP_INFURA_API_KEY as string;
const infuraProvider: Provider = new ethers.InfuraProvider("sepolia", infuraApiKey);

const appContext = createContext({
  updateProvider: (provider: Provider) => {},
  updateChainId: (chainId: number) => {},
  updateSigner: (signer: string) => {},
  updateBalance: (balance: number) => {},
  updateRole: (role: Role) => {},
  updateSection: (section: Sections) => {},
  updateShownCollection: (collection: CollectionDTO) => {},
  updateCollectionAddresses: (collectionAddresses: string[]) => {},
  updateCollections: (collections: CollectionDTO[]) => {},
  provider: infuraProvider,
  chainId: 0,
  signer: "",
  balance: 0,
  role: Role.NONE,
  section: Sections.MARKETPLACE,
  shownCollection: CollectionDTO.emptyInstance(),
  collectionAddresses: [] as string[],
  collections: [] as CollectionDTO[],
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
  const [role, setRole] = useState<Role>(Role.NONE);
  const [section, setSection] = useState<Sections>(Sections.MARKETPLACE);
  const [shownCollection, setShownCollection] = useState<CollectionDTO>(CollectionDTO.emptyInstance());
  const [collectionAddresses, setCollectionAddresses] = useState<string[]>([]);
  const [collections, setCollections] = useState<CollectionDTO[]>([]);

  function updateProvider(provider: Provider) { setProvider(provider); }
  function updateChainId(chainId: number) { setChainId(chainId); }
  function updateSigner(signer: string) { setSigner(signer); }
  function updateBalance(balance: number) { setBalance(balance); }
  function updateRole(role: Role) { setRole(role); }
  function updateSection(section: Sections) { setSection(section); }
  function updateShownCollection(collection: CollectionDTO) { setShownCollection(collection); }
  function updateCollectionAddresses(collectionAddresses: string[]) { setCollectionAddresses(collectionAddresses); }
  function updateCollections(collections: CollectionDTO[]) { setCollections(collections); }

  return (
    <appContext.Provider value={{
      updateProvider,
      updateChainId,
      updateSigner,
      updateBalance,
      updateRole,
      updateSection,
      updateShownCollection,
      updateCollectionAddresses,
      updateCollections,
      provider,
      chainId,
      signer,
      balance,
      role,
      section,
      shownCollection,
      collectionAddresses,
      collections,
    }}>
      {children}
    </appContext.Provider>
  );
}