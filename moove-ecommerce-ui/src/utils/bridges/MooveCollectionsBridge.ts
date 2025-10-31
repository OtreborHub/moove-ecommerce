import { BrowserProvider, Contract, ethers, Provider, Signer } from "ethers";
import { COLLECTION_ABI } from "../../abi/erc721_abi";
import { ErrorMessage, swalError } from "../enums/Errors";
import { Action } from "../enums/Actions";
import CollectionDTO from "../DTO/CollectionDTO";
import TokenDTO from "../DTO/TokenDTO";
import AuctionDTO from "../DTO/AuctionDTO";

export var collectionContract: Contract;


const infuraApiKey = import.meta.env.VITE_INFURA_API_KEY as string;
export const infuraProvider: Provider = new ethers.InfuraProvider("sepolia" , infuraApiKey);

export default function getContractInstance(collectionAddress: string, signer?: Signer) {
  try {
    const usedProvider = signer ?? infuraProvider;
    return new Contract(collectionAddress, COLLECTION_ABI, usedProvider);
  } catch {
    console.log("Error retrieving contract instance: verify contract address, abi and provider used");
  }

}

export async function readCollectionData(collectionAddress: string){
  const contractInstance = getContractInstance(collectionAddress);
  if(contractInstance){
    try {
      const address = contractInstance.target.toString();
      const name = await contractInstance.name();
      const symbol = await contractInstance.symbol();
      const totalSupply = await contractInstance.totalSupply();
      const owner = await contractInstance.owner();
      const tokenIds = await contractInstance._tokenIds();
      const isActive = await contractInstance.active();

      const collectionInfo = new CollectionDTO(address, name, symbol, parseFloat(tokenIds), parseFloat(totalSupply), isActive, owner);
      
      return collectionInfo;
    } catch (error) {
      console.log("readCollectionInfo action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
      return null;
    }
  } else {
    console.log("Contract instance is undefined");
    return null;
  }
}

export async function readAuction(collectionAddress: string, tokenId: number){
  const contractInstance = getContractInstance(collectionAddress);
  if(contractInstance){
    try {
      const auction = await contractInstance.auctions(tokenId);

      const auctionDTO = new AuctionDTO(
        Number(auction.tokenId),
        Number(auction.auctionType),
        auction.seller,
        Number(auction.startTime),
        Number(auction.endTime),
        Number(auction.currentPrice),
        Number(auction.minIncrement),
        auction.highestBidder,
        Number(auction.highestBid),
        auction.ended
      );

      return auctionDTO;

    } catch (error){
      console.log("readAuction action: " + ErrorMessage.RD);
      // swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function readTokenURI(collectionAddress: string, tokenId: number){
  const contractInstance = getContractInstance(collectionAddress);
  if(contractInstance){
    try {
      const tokenURI = await contractInstance.tokenURI(tokenId);
      return tokenURI;
    } catch (error) {
      console.log("readTokenURI action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function readTokenData(collectionAddress: string, tokenId: number){
  const contractInstance = getContractInstance(collectionAddress);
  if(contractInstance){
    try {

      const tokenURI = await contractInstance.tokenURI(tokenId);
      const tokenPrice = await contractInstance.tokenPrices(tokenId);
      const ownerOf = await contractInstance.ownerOf(tokenId);

      const token = new TokenDTO(tokenId, tokenURI, parseFloat(tokenPrice), ownerOf);

      return token;
    } catch (error) {
      console.log("readTokenData action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function writeMintNFT(collectionAddress: string, tokenURI: string, price: number, signer: Signer) {
  try {
    const signerContract = getContractInstance(collectionAddress, signer);
    await signerContract?.mintNFT(tokenURI, price);
    return true;
  } catch (error: any) {
    console.log("Mint NFT action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;

  }
}

export async function payableBuyNFT(collectionAddress: string, tokenId: number, price: number, signer: Signer) {
  try {
    const signerContract = getContractInstance(collectionAddress, signer);
    await signerContract?.buyNFT(tokenId, { value: BigInt(price) });
    return true;
  } catch (error: any) {
    console.log("Buy NFT action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.TRANSFER, error);
    return false;
  }
}

export async function writeCreateAuction(collectionAddress: string, tokenId: number, auctionType: number, startPrice: number, duration: number, minIncrement: number, signer: Signer) {
  try {
    const signerContract = getContractInstance(collectionAddress, signer);
    // Assicurati che startPrice e minIncrement siano in wei!
    await signerContract?.createAuction(tokenId, auctionType, startPrice, duration, minIncrement);
    return true;
  } catch (error: any) {
    console.log("Create Auction action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function writeTokenPrice(collectionAddress: string, tokenId: number, price: BigInt, signer: Signer){
  try {
    const signerContract = getContractInstance(collectionAddress, signer);
    await signerContract?.setTokenPrice(tokenId, price);
    return true;
  } catch (error: any) {
    console.log("Update price action: " + error);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function transferTo(collectionAddress: string, addressTo: string, tokenId: number, signer: Signer){
  try {
    const signerContract = getContractInstance(collectionAddress, signer);
    await signerContract?.transfer(addressTo, tokenId);
    return true;
  } catch (error: any) {
    console.log("Trasfer NFT action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.TRANSFER, error);
    return false;
  }
}

export async function readCurrentPriceDutch(collectionAddress: string, tokenId: number){
  const contractInstance = getContractInstance(collectionAddress);
  if(contractInstance){
    try {
      const currentPrice = await contractInstance.getCurrentDutchPrice(tokenId);
      return currentPrice;
    } catch (error) {
      console.log("Read Current Price Dutch action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
      return 0;
    }
  }
}

export async function writePlaceBidClassic(collectionAddress: string, tokenId: number, bid: number, signer: Signer){
   try {
    const signerContract = getContractInstance(collectionAddress, signer);
    await signerContract?.placeBidClassic(tokenId, { value: ethers.parseUnits(bid.toString(), "wei") });
    return true;
  } catch (error: any) {
    console.log("Place Bid Classic action: " + error);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function writeBuyDutch(collectionAddress: string, tokenId: number, bid: number, signer:Signer){
   try {
    const signerContract = getContractInstance(collectionAddress, signer);
    await signerContract?.buyDutch(tokenId, { value: ethers.parseUnits(bid.toString(), "wei") });
    return true;
  } catch (error: any) {
    console.log("Buy dutch action: " + error);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function writePlaceBidEnglish(collectionAddress: string, tokenId: number, bid: number, signer:Signer){
   try {
    const signerContract = getContractInstance(collectionAddress, signer);
    await signerContract?.placeBidEnglish(tokenId, { value: ethers.parseUnits(bid.toString(), "wei") });
    return true;
  } catch (error: any) {
    console.log("Place Bid English action: " + error);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function writeEndClassicAuction(collectionAddress: string, tokenId: number, signer:Signer){
   try {
    const signerContract = getContractInstance(collectionAddress, signer);
    await signerContract?.endClassicAuction(tokenId);
    return true;
  } catch (error: any) {
    console.log("End classic action: " + error);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function writeEndEnglishAuction(collectionAddress: string, tokenId: number,signer:Signer){
  try {
    const signerContract = getContractInstance(collectionAddress, signer);
    await signerContract?.endEnglishAuction(tokenId);
    return true;
  } catch (error: any) {
    console.log("End english action: " + error);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function retrieveBid(collectionAddress: string, tokenId: number, signer:Signer){
  const signerContract = getContractInstance(collectionAddress, signer);
  if(signerContract){
    try {
      await signerContract.withdrawBid(tokenId);
      return true;
    } catch (error) {
      console.log("Read Current Price Dutch action: " + error);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
      return false;
    }
  }
}

export async function writeDisableCollection(collectionAddress: string, signer: Signer){
  try {
    const signerContract = getContractInstance(collectionAddress, signer);
    await signerContract?.disableCollection();
    return true;
  } catch (error: any) {
    console.log("Disable collection action: " + error);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}