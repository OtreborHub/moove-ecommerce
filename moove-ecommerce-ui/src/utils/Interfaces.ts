import AuctionDTO from "./DTO/AuctionDTO";
import CollectionDTO from "./DTO/CollectionDTO";
import TokenDTO, { Metadata } from "./DTO/TokenDTO";

interface NavbarProps {
    connect: () => void;
}

interface MarketplaceProps {
    collectionAddresses: string[];
    connectWallet: () => void;
}

interface CollectionProps{
    collection: CollectionDTO;
    connectWallet: () => void;
}

interface TokenProps {
    collection: CollectionDTO;
    token: TokenDTO;
    tokenId: number;
    auction: AuctionDTO;
    metadata: Metadata;
    isLoading: (isLoading: boolean) => void,
    handleBuy: (tokenId: number, price: number) => void;
    handleCreateAuction: (tokenId: number) => void;
    handleTransfer: (tokenId: number) => void;
    handleUpdatePrice: (tokenId: number, price: number) => void;
    connectWallet: () => void;
}

interface AuctionProps {
    auction: AuctionDTO;
    signer?: string;
    section?: number;
    connectWallet: () => void;
}

interface TableCollectionProps {
    collections: CollectionDTO[];
    handleMint: (collectionAddress: string, tokenURI: string, price: number) => void;
    handleDisable: (collectionAddress: string) => void;
}

interface FactoryActionsButtonProps {
    collection: CollectionDTO;
    handleMint: (collectionAddress: string, tokenURI: string, price: number) => void;
    handleDisable: (collectionAddress: string) => void;
}

interface TokenActionsButtonProps {
    token: TokenDTO;
    handleCreateAuction: (tokenId: number) => void;
    handleUpdatePrice: (tokenId: number, price: number) => void;
    handleTransfer: (tokenId: number) => void;
}

interface LoaderProps {
    loading: boolean
}

// FORM PROPS ----------------------- 
interface CreateCollectionFormProps {
    handleSubmit: (name: string, symbol: string, maxSupply: number) => void;
}

interface MintTokenFormProps {
    collectionAddress: string,
    signer: string;
    handleSubmit: (collectionAddress: string, tokenURI: string, price: number) => void;
    // role: Role;
}

interface DeleteCollectionFormProps {
    collectionAddress: string;
    collectionName: string;
    handleSubmit: (collectionAddress: string) => void;
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

interface CreateAuctionFormProps {
    collectionSymbol: string,
    tokenId: number,
    handleSubmit: (tokenId: number, auctionType: number, startPrice: number, duration: number, minIncrement: number) => void
}

interface PlaceBidFormProps {
    auction: AuctionDTO;
    handleSubmit: (tokenId: number, value: number) => void;
}

//Mettere tutti i metodi dei forms
interface FormProps {
}
// END FORMS ----------------------------------

export type { NavbarProps, MarketplaceProps, CollectionProps, AuctionProps, CreateCollectionFormProps, TableCollectionProps, LoaderProps, MintTokenFormProps, DeleteCollectionFormProps, TokenProps, SetTokenPriceFormProps, TrasferFormProps, CreateAuctionFormProps, PlaceBidFormProps, FactoryActionsButtonProps, TokenActionsButtonProps};