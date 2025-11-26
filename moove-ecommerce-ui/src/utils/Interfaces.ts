import { Signer } from "ethers";
import AuctionDTO from "./DTO/AuctionDTO";
import CollectionDTO from "./DTO/CollectionDTO";
import TokenDTO, { Metadata } from "./DTO/TokenDTO";

interface NavbarProps {
    connectMetamask: () => void;
    handleConnect: () => void;
}

interface MarketplaceProps {
    collectionAddresses: string[];
    showCollection: (collection: CollectionDTO) => void;
    handleConnect: () => void;
}

interface CollectionProps{
    collection: CollectionDTO;
    handleConnect: () => void;
    goBack?: () => void;
    showCollection?: (collection: CollectionDTO) => void;
}

interface TokenPreviewProps {
    collection: CollectionDTO;
    token: TokenDTO;
    isLoading: (isLoading: boolean) => void,
    handleBuy: (tokenId: number, price: number) => void;
    handleConnect: () => void;
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
    handleConnect: () => void;
}

interface AuctionPreviewProps {
    auction: AuctionDTO;
    handleConnect: () => void;
}

interface TokenAuctionProps {
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

interface AdminsTableProps {
    admins: string[];
    isOwner: boolean;
    removeAdmin: (address: string) => void;
}

interface CollectionTableProps {
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

interface AuctionActionsButtonProps {
    auction: AuctionDTO;
    signer?: Signer;
    signerAddress?: string;
    handleBuyPlaceBid: (tokenId: number, price: number) => void;
    handleFinalizeAuction: (tokenId: number) => void;
    handleWithdrawFunds: (tokenId: number) => void;
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

interface UpdateTokenPriceFormProps {
    tokenId: number,
    tokenPrice: number,
    handleSubmit: (tokenId: number, price: BigInt) => void;
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

interface AddRemoveAdminFormProps {
    handleSubmit: (removeAdmin: boolean, address: string) => void;
}

//Mettere tutti i metodi dei forms
interface FormProps {
}
// END FORMS ----------------------------------

interface MyNFTsProps {
    connectMetamask: () => void;
}




export type { NavbarProps, MarketplaceProps, CollectionProps, TokenAuctionProps, AuctionsProps, AuctionPreviewProps, CreateCollectionFormProps, CollectionTableProps, AdminsTableProps, LoaderProps, MintTokenFormProps, DeleteCollectionFormProps, TokenProps, TokenPreviewProps, UpdateTokenPriceFormProps, TrasferFormProps, CreateAuctionFormProps, PlaceBidFormProps, FactoryActionsButtonProps, TokenActionsButtonProps, AuctionActionsButtonProps, MyNFTsProps, AddRemoveAdminFormProps};