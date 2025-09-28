import { Contract, ethers, Provider } from "ethers";
import { FACTORY_ABI } from "../../abi/erc721factory_abi";
import { ErrorMessage, swalError } from "../enums/Errors";
import { Action } from "../enums/Actions";
import Swal from "sweetalert2";

export var factory: Contract;

export const FACTORY_ADDRESS: string = process.env.REACT_APP_FACTORY_ADDRESS as string;

const infuraApiKey = process.env.REACT_APP_INFURA_API_KEY as string;
const infuraProvider: Provider = new ethers.InfuraProvider("sepolia" , infuraApiKey);

export default function getMooveFactory_ContractInstance(provider: Provider) {
  try {
    if (!factory) {
      var usedProvider = provider ? provider : infuraProvider; //Prevenzione da problemi lato Infura
      factory = new Contract(FACTORY_ADDRESS, FACTORY_ABI, usedProvider);
    }
  } catch {
    console.log("Error during contract instance creation: verifiy contract address, abi and provider used");
  }

}

export async function readIsAdmin() {
  if (factory) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

      return await signerContract.isAdmin();

    } catch (error: any) {
      console.log("readAdmin action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function readCollections() {
  if(factory){
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

      const collections = await signerContract.getCollections();
      console.log("Collections retrieved successfully");
      return collections;
    } catch (error: any) {
      console.log("readCollections action: " + ErrorMessage.RD);
      swalError(ErrorMessage.RD, Action.RD_DATA, error);
    }
  }
}

export async function writeCreateCollection(name: string, symbol: string, maxSupply: number) {
  if(factory){
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerContract = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);

      await signerContract.createCollection(name, symbol, maxSupply);
      return true;

    } catch (error: any) {
      console.log("writeCreateCollection action: " + ErrorMessage.TR);
      swalError(ErrorMessage.TR, Action.WC_DATA, error);
    }
  }
}

// CONTRACT LISTENERS

export function addContractListeners() {
  factory.on("CollectionCreated", (collectionAddress, name, symbol) => {
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