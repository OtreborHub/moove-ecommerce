import { ethers } from "ethers";

const mooveOwner = import.meta.env.VITE_MOOVE_OWNER as string;

export function formatAddress(address: string, signer?: string) {
  if(address === mooveOwner){
    return "Moove";
  } else {
    if(Number(address.substring(address.length - 8, address.length)) === 0){
        return "none";
    } else if(signer && address === signer){
        return "You"
    } else {
        return address.substring(0, 5) + "..." + address.substring(address.length - 5, address.length)
    }
  }  
    
}

export function formatPrice(value: string | number, unit: "wei" | "finney" | "eth" = "wei") {
  // Assumi che value sia sempre in wei
  const bn =  BigInt(value);
  if (unit === "wei") {
    return bn.toString();
  }
  if (unit === "finney") {
    // 1 finney = 10^15 wei
    return (Number(bn) / 1e15).toFixed(6);
  }
  // eth
  return ethers.formatEther(bn);
}

export function toWei(value: number, unit: string) : string{
  // Assumi che value sia sempre in wei
  const strValue =  value.toString();
  if(!strValue) {return "0"};
  
  if (unit === "wei") {
    return BigInt(strValue).toString();
  }
  let wei: bigint
  if (unit === "finney") {
      // 1 finney = 10^-3 eth → quindi parse come eth e moltiplica per 1e3
      wei = ethers.parseUnits(strValue, "finney");
    } else {
      wei = ethers.parseEther(strValue); // parseUnits(value, 18)
    }

  return wei.toString();
}

export function formatToRomeTime(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000); // Converti da secondi a millisecondi

    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Rome',
    };

    return new Intl.DateTimeFormat('it-IT', options).format(date);
}

export function formatAuctionType(auctionType: number){
  var auctionTypeString = "";
  switch(auctionType){
    case 0:
      auctionTypeString = "Classic";
      break;
    case 1:
      auctionTypeString = "Dutch";
      break;
    case 2:
      auctionTypeString = "English";
      break;
  }
  return auctionTypeString
}

export function formatInSeconds(value: number, unit: string){
  switch(unit){
    case "days":
      return value * 86400;
    case "weeks":
      return value * 604800;
    case "months":
      return value * 2629800;
    default: 
      return 0;
  }
}
