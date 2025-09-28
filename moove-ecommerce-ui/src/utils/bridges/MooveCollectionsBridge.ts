import { Contract, ethers, Provider } from "ethers";
import { COLLECTION_ABI } from "../../abi/erc721_abi";
import { ErrorMessage, swalError } from "../enums/Errors";
import { Action } from "../enums/Actions";
import CollectionDTO from "../DTO/CollectionDTO";
import TokenDTO from "../DTO/TokenDTO";
import AuctionDTO from "../DTO/AuctionDTO";

export var collectionContract: Contract;

const infuraApiKey = process.env.REACT_APP_INFURA_API_KEY as string;
const infuraProvider: Provider = new ethers.InfuraProvider("sepolia" , infuraApiKey);

export default function getMooveCollection_ContractInstance(collectionAddress: string, provider: Provider) {
  try {
      var usedProvider = provider ? provider : infuraProvider; //Prevenzione da problemi lato Infura
      collectionContract = new Contract(collectionAddress, COLLECTION_ABI, usedProvider);
  } catch {
    console.log("Error during contract instance creation: verifiy contract address, abi and provider used");
  }

}

export async function readCollectionData(){
  if(collectionContract){
    try {
    const address = collectionContract.target.toString();
    const name = await collectionContract.name();
    const symbol = await collectionContract.symbol();
    const totalSupply = await collectionContract.totalSupply();
    const owner = await collectionContract.owner();
    const tokenIds = await collectionContract._tokenIds();
    const isActive = await collectionContract.active();

    const collectionInfo = new CollectionDTO(address, name, symbol, parseFloat(tokenIds), parseFloat(totalSupply), isActive, owner);
    
    return collectionInfo;
    } catch (error) {
      console.log("readCollectionInfo action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);

    }
  }
}

export async function readAuction(collectionAddress: string, tokenId: number){
  if(collectionContract.target.toString() !== collectionAddress){
    collectionContract = new Contract(collectionAddress, COLLECTION_ABI, infuraProvider);
  }

  if(collectionContract){
    try {
      const auction = await collectionContract.auctions(tokenId);

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

export async function readTokenData(collectionAddress: string, tokenId: number){
  if(collectionContract.target.toString() !== collectionAddress){
    collectionContract = new Contract(collectionAddress, COLLECTION_ABI, infuraProvider);
  }

  if(collectionContract){
    try {
      
      const tokenURI = await collectionContract.tokenURI(tokenId);
      const tokenPrice = await collectionContract.tokenPrices(tokenId);
      const ownerOf = await collectionContract.ownerOf(tokenId);

      const token = new TokenDTO(tokenId, tokenURI, parseFloat(tokenPrice), ownerOf);

      return token;
    } catch (error) {
      console.log("readTokenData action: " + ErrorMessage.RD);
      // swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function writeMintNFT(collectionAddress: string, tokenURI: string, price: number){
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(collectionAddress, COLLECTION_ABI, signer);

    await signerContract.mintNFT(tokenURI, price);
    return true;

  } catch (error: any) {
    console.log("Mint NFT action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;

  }
}

export async function payableBuyNFT(collectionAddress: string, tokenId: number, price: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(collectionAddress, COLLECTION_ABI, signer);

    const valueSent = BigInt(price);
    await signerContract.buyNFT(tokenId, { value: valueSent });
    
    return true;
  } catch (error: any) {
    console.log("Buy NFT action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.TRANSFER, error);
    return false;
  }
}

export async function writeCreateAuction(collectionAddress: string, tokenId: number, auctionType: number, startPrice: number, duration: number, minIncrement: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(collectionAddress, COLLECTION_ABI, signer);

    // Assicurati che startPrice e minIncrement siano in wei!
    await signerContract.createAuction(tokenId, auctionType, startPrice, duration, minIncrement);
    return true;
  } catch (error: any) {
    console.log("Create Auction action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function writeTokenPrice(collectionAddress: string, tokenId: number, price: number){
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(collectionAddress, COLLECTION_ABI, signer);

    await signerContract.setTokenPrice(tokenId, price);
    return true;
  } catch (error: any) {
    console.log("Update price action: " + error);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function transferTo(collectionAddress: string, addressTo: string, tokenId: number){
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(collectionAddress, COLLECTION_ABI, signer);

    await signerContract.transfer(addressTo, tokenId);
    return true;
  } catch (error: any) {
    console.log("Trasfer NFT action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.TRANSFER, error);
    return false;
  }
}

export async function readCurrentPriceDutch(collectionAddress: string, tokenId: number){
  if(collectionContract.target.toString() !== collectionAddress){
    collectionContract = new Contract(collectionAddress, COLLECTION_ABI, infuraProvider);
  }

  if(collectionContract){
    try {
      const currentPrice = await collectionContract.getCurrentDutchPrice(tokenId);
      return currentPrice;
    } catch (error) {
      console.log("Read Current Price Dutch action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
      return 0;
    }
  }
}

export async function writePlaceBidClassic(collectionAddress: string, tokenId: number, bid: number){
   try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(collectionAddress, COLLECTION_ABI, signer);

    await signerContract.placeBidClassic(tokenId, { value: ethers.parseUnits(bid.toString(), "wei") });
    return true;
  } catch (error: any) {
    console.log("Place Bid Classic action: " + error);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function writeBuyDutch(collectionAddress: string, tokenId: number, bid: number){
   try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(collectionAddress, COLLECTION_ABI, signer);

    await signerContract.buyDutch(tokenId, { value: ethers.parseUnits(bid.toString(), "wei") });
    return true;
  } catch (error: any) {
    console.log("Buy dutch action: " + error);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function writePlaceBidEnglish(collectionAddress: string, tokenId: number, bid: number){
   try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(collectionAddress, COLLECTION_ABI, signer);

    await signerContract.placeBidEnglish(tokenId, { value: ethers.parseUnits(bid.toString(), "wei") });
    return true;
  } catch (error: any) {
    console.log("Place Bid English action: " + error);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function writeEndClassicAuction(collectionAddress: string, tokenId: number){
   try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(collectionAddress, COLLECTION_ABI, signer);

    await signerContract.endClassicAuction(tokenId);
    return true;
  } catch (error: any) {
    console.log("End classic action: " + error);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function writeEndEnglishAuction(collectionAddress: string, tokenId: number){
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(collectionAddress, COLLECTION_ABI, signer);

    await signerContract.endEnglishAuction(tokenId);
    return true;
  } catch (error: any) {
    console.log("End english action: " + error);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
    return false;
  }
}

export async function retrieveBid(collectionAddress: string, tokenId: number){
  if(collectionContract.target.toString() !== collectionAddress){
    collectionContract = new Contract(collectionAddress, COLLECTION_ABI, infuraProvider);
  }

  if(collectionContract){
    try {
      await collectionContract.withdrawBid(tokenId);
      return true;
    } catch (error) {
      console.log("Read Current Price Dutch action: " + error);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
      return false;
    }
  }
}