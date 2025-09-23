import { Contract, ethers, Provider } from "ethers";
import { COLLECTION_ABI } from "../../abi/erc721_abi";
import { ErrorMessage, swalError } from "../enums/Errors";
import { Action } from "../enums/Actions";
import CollectionDTO from "../DTO/CollectionDTO";
import TokenDTO from "../DTO/TokenDTO";

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
    const totalSupply = await collectionContract.maxSupply();
    const owner = await collectionContract.owner();

    const collectionInfo = new CollectionDTO(address, name, symbol, parseFloat(totalSupply), owner);
    
    return collectionInfo;
    } catch (error) {
      console.log("readCollectionInfo action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);

    }
  }
}


export async function readTokenData(tokenId: number, collectionAddress: string){
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
      console.log("readTokenInfo action: " + ErrorMessage.RD);
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

export async function writeTokenPrice(collectionAddress: string, tokenId: number, price: number){
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(collectionAddress, COLLECTION_ABI, signer);

    await signerContract.setTokenPrice(tokenId, price);
    return true;
  } catch (error: any) {
    console.log("Buy NFT action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.TRANSFER, error);
    return false;
  }
}

export async function payBuyNFT(collectionAddress: string, tokenId: number, price: number) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(collectionAddress, COLLECTION_ABI, signer);

    await signerContract.buyNFT(tokenId, { value: ethers.parseEther(price.toString()) });
    return true;
  } catch (error: any) {
    console.log("Buy NFT action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.TRANSFER, error);
    return false;
  }
}

export async function transferTo(collectionAddress: string, tokenId: number, addressTo: string){
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerContract = new ethers.Contract(collectionAddress, COLLECTION_ABI, signer);

    await signerContract.transfer(tokenId, addressTo);
    return true;
  } catch (error: any) {
    console.log("Buy NFT action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.TRANSFER, error);
    return false;
  }
}