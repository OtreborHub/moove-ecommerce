import Swal from "sweetalert2";
import { Action } from "./Actions";

export enum ErrorMessage {

    //WALLET FRONTEND ERRORS
    WALLET_ERROR="Please connect your wallet. Be sure is operating on the Sepolia Testnet.",
    DELETE_CONFIRM_ERROR = "Please write the name of the collection correctly to confirm.",
    CREATE_COLL_CONFIRM_ERROR = "Please write the collection data correctly to confirm.",
    
    //GENERIC ERRORS
    RD="Error reading contract data",
    TR="Transaction refused",
    IO="Input error",

    // Contract Messages
    IF="Insufficient funds",
    AE="Auction ended",

}

export function swalError(errorMessage: ErrorMessage, action?: Action, error?: any){
    let shortMessage = "";
    let title = "";
    let text = "";

    //transazione rifiutata dall'utente (Metamask - The request is rejected by the user)
    if(error && error.info && error.info.error && error.info.error.code === 4001){
        return;
    } else
    if(error && error.shortMessage && error.shortMessage.includes("execution reverted:")){
        shortMessage = error.shortMessage.split(":")[1].trim().replace("\"", "").slice(0, -1);
    } else
    if(error && error.code){
        shortMessage = String(error.code).toLowerCase().replace("_", " ");
        shortMessage = shortMessage.charAt(0).toUpperCase() + shortMessage.slice(1);
    }

    let outputMessage = shortMessage ? shortMessage : errorMessage;
    switch(outputMessage){
        case ErrorMessage.RD:
            title = "Errore durante il recupero dei dati";
            if(action){
                text = "Si è verificato un errore durante l'operazione di " + action + ".\nRiprova più tardi.";
            }
            break;

        case ErrorMessage.TR:
            if(action){
                title = "Qualcosa è andato storto!";
                text = "Si è verificato un errore durante l'operazione di " + action + ".\nRiprova più tardi.";
            } else {
                text = "Si è verificato un errore generico.\nRiprova più tardi."
            }
            break;

        case ErrorMessage.IF:
            title = "Saldo Insufficiente!";
            break;

        // case ErrorMessage.OPERATION_NOT_ALLOWED:
        //     title = "Operazione non permessa";
        //     break;

        // case ErrorMessage.UNAUTHORIZED_USER:
        //     title = "Utente non autorizzato alla funzionalità";
        //     break;


        case ErrorMessage.IO:
            title = "Parametri di input non validi";
            break;

       
        case ErrorMessage.DELETE_CONFIRM_ERROR:
            title = "Collection name mismatch";
            text = outputMessage;
            break;

        case ErrorMessage.CREATE_COLL_CONFIRM_ERROR:
            title = "Collection data mismatch";
            text = outputMessage;
            break;

        case ErrorMessage.WALLET_ERROR:
            title = "Connect wallet"
            text = outputMessage;
            break;

        case ErrorMessage.AE:
            title = "Awaiting seller finalization";
            text = "This auction has ended and is waiting for the seller to finalize it.\nAfter that, you can withdraw your funds if you didn't win. Bidding will reopen only in future or other auctions.";
            break;

        default: 
            title = "Qualcosa è andato storto!";
            text = "Si prega di riprovare più tardi";
    }

    if(title || text){
        Swal.fire({
            icon: "error",
            title: title,
            text: text,
            confirmButtonColor: "#3085d6",
            showCloseButton: true
        });
    }
}
