import { BrowserProvider, Contract, ethers, Provider, Signer } from "ethers";
import Swal from "sweetalert2";
import { FACTORY_ABI } from "../../abi/erc721factory_abi";
import { Action } from "../enums/Actions";
import { ErrorMessage, swalError } from "../enums/Errors";

export const FACTORY_ADDRESS: string = import.meta.env.VITE_FACTORY_ADDRESS as string;

const infuraApiKey = import.meta.env.VITE_INFURA_API_KEY as string;
const infuraProvider: Provider = new ethers.InfuraProvider("sepolia" , infuraApiKey);

export default function getContractInstance(signer?: Signer) {
  try {
    const usedProvider = signer ?? infuraProvider;
    return new Contract(FACTORY_ADDRESS, FACTORY_ABI, usedProvider);
  } catch {
    console.log("Error retrieving contract instance: verify contract address, abi and provider used");
  }

}

export async function readIsAdmin(signer: Signer) {
    try {
      const signerContract = getContractInstance(signer);
      return await signerContract?.isAdmin();
    } catch (error: any) {
      console.log("readAdmin action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }

export async function readCollections() {
  try {
    const contract = getContractInstance();
    return await contract?.getCollections();
  } catch (error: any) {
    console.log("readCollections action: " + ErrorMessage.RD);
    swalError(ErrorMessage.RD, Action.RD_DATA, error);
  }
}

export async function readAdmins() {
  try {
    const contract = getContractInstance();
    return await contract?.admins();
  } catch (error: any) {
    console.log("readCollections action: " + ErrorMessage.RD);
    swalError(ErrorMessage.RD, Action.RD_DATA, error);
  }
}

export async function writeCreateCollection(name: string, symbol: string, maxSupply: number, signer: Signer) {
  try{
    const signerContract = getContractInstance(signer);
    await signerContract?.createCollection(name, symbol, maxSupply);
    return true;
  } catch (error: any) {
    console.log("writeCreateCollection action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
  }
}

export async function writeAddAdmin(newAdmin: string, signer: Signer) {
  try{
    const signerContract = getContractInstance(signer); 
    await signerContract?.addAdmin(newAdmin);
    return true;
  } catch (error: any) {
    console.log("writeAddAdmin action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
  }
}

export async function writeRemoveAdmin(newAdmin: string, signer: Signer) {
  try{
    const signerContract = getContractInstance(signer); 
    await signerContract?.removeAdmin(newAdmin);
    return true;
  } catch (error: any) {
    console.log("writeAddAdmin action: " + ErrorMessage.TR);
    swalError(ErrorMessage.TR, Action.WC_DATA, error);
  }
}

// CONTRACT LISTENERS

export async function addFactoryContractListeners(signer: Signer) {
  //const signer = await browserProvider.getSigner();
  const factory = getContractInstance(signer);
  factory?.on("CollectionCreated", (collectionAddress, name, symbol) => {
    if (collectionAddress) {
      Swal.fire({
        title: "Collection created!",
        text: "Your NFT collection has been successfully created. The app will now reload to update the data.",
        icon: "success",
        confirmButtonColor: "#3085d6"
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    }
  })
}