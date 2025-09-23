import CollectionDTO from "./DTO/CollectionDTO";
import TokenDTO from "./DTO/TokenDTO";
import { Role } from "./enums/Role";


interface NavbarProps {
    connect: () => void;
}

interface CollectionsProps {
    collectionAddresses: string[];
}

interface CollectionProps{
    collection: CollectionDTO;
}

interface FactoryProps {
    collectionAddresses: string[];
}

interface TokenProps {
    signer?: string;
    role?: Role;
    collection?: CollectionDTO;
    token: TokenDTO;
    handleBuy: (tokenId: number, price: number) => void;
    handleCreateAuction: () => void;
    handleTransfer: (tokenId: number) => void;
    handleTokenPrice: (tokenId: number, price: number) => void;
    connectWallet: () => void;
}

interface TableCollectionProps {
    collectionsInfo: CollectionDTO[];
    handleMint: (tokenURI: string, price: number) => void;
    handleDisable: () => void;
}

interface LoaderProps {
    loading: boolean
}

// FormProps ----------- 
interface CreateCollectionFormProps {
    handleSubmit: (name: string, symbol: string) => void;
}

interface MintTokenFormProps {
    signer: string;
    handleSubmit: (tokenURI: string, price: number) => void;
    // role: Role;
}

interface DeleteCollectionFormProps {
    collectionName: string;
    handleSubmit: () => void;
}

interface SetTokenPriceFormProps {
    tokenId: number,
    tokenPrice: number,
    handleSubmit: (tokenId: number, price: number) => void;
}

interface TrasferFormProps {
    tokenId: number,
    handleSubmit: (tokenId: number, addressTo: string) => void
}

//Mettere tutti i metodi dei forms
interface FormProps {
}
// END FORMS ----------------------------------

export type { NavbarProps, CollectionsProps, CollectionProps, FactoryProps, CreateCollectionFormProps, TableCollectionProps, LoaderProps, MintTokenFormProps, DeleteCollectionFormProps, TokenProps, SetTokenPriceFormProps, TrasferFormProps };