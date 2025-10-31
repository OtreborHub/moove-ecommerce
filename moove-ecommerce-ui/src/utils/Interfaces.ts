import { Signer } from "ethers";
import AuctionDTO from "./DTO/AuctionDTO";
import CollectionDTO from "./DTO/CollectionDTO";
import TokenDTO, { Metadata } from "./DTO/TokenDTO";

interface NavbarProps {
    connectMetamask: () => void;
}

interface MarketplaceProps {
    collectionAddresses: string[];
    showCollection: (collection: CollectionDTO) => void;
    connectMetamask: () => void;
}

interface CollectionProps{
    collection: CollectionDTO;
    connectMetamask: () => void;
    goBack?: () => void;
    showCollection?: (collection: CollectionDTO) => void;
}

interface TokenPreviewProps {
    collection: CollectionDTO;
    token: TokenDTO;
    isLoading: (isLoading: boolean) => void,
    handleBuy: (tokenId: number, price: number) => void;
    handleCreateAuction: (tokenId: number) => void;
    handleTransfer: (tokenId: number) => void;
    handleUpdatePrice: (tokenId: number, price: number) => void;
    connectMetamask: () => void;
}

interface TokenProps {
    collection: CollectionDTO;
    token: TokenDTO;
    auction: AuctionDTO;
    metadata: Metadata;
    signerAddress: string;
    signer: Signer;
    isLoading: (isLoading: boolean) => void,
    handleBuy: (tokenId: number, price: number) => void;
    handleCreateAuction: (tokenId: number) => void;
    handleTransfer: (tokenId: number) => void;
    handleUpdatePrice: (tokenId: number, price: number) => void;
    connectWC: () => void;
    connectMetamask: () => void;
}

interface AuctionPreviewProps {
    auction: AuctionDTO;
    connectMetamask: () => void;
}

interface AuctionProps {
    auction: AuctionDTO;
    signer: Signer;
    signerAddress: string;
    section?: number;
}

interface AuctionsProps {
    auctions: AuctionDTO[];
    goBack: () => void;
    connectMetamask: () => void;
}
interface TableCollectionProps {
    collections: CollectionDTO[];
    showCollection: (collection: CollectionDTO) => void;
    handleMint: (collectionAddress: string, tokenURI: string, price: number) => void;
    handleDisable: (collectionAddress: string) => void;
}

interface FactoryActionsButtonProps {
    collection: CollectionDTO;
    showCollection: (collection: CollectionDTO) => void;
    handleMint: (collectionAddress: string, tokenURI: string, price: number) => void;
    handleDisable: (collectionAddress: string) => void;
}

interface TokenActionsButtonProps {
    token: TokenDTO;
    auctionTokenId: number;
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

export type { NavbarProps, MarketplaceProps, CollectionProps, AuctionProps, AuctionsProps, AuctionPreviewProps, CreateCollectionFormProps, TableCollectionProps, LoaderProps, MintTokenFormProps, DeleteCollectionFormProps, TokenProps, TokenPreviewProps, SetTokenPriceFormProps, TrasferFormProps, CreateAuctionFormProps, PlaceBidFormProps, FactoryActionsButtonProps, TokenActionsButtonProps};