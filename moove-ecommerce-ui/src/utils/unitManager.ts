import { ethers } from "ethers";

export enum Unit {
    DEFAULT="wei",
    WEI = "wei",
    ETH = "ETH"
}

export function formatPrice(value: string | number, unit: Unit = Unit.WEI) {
  const bn =  BigInt(value);
  
  if (unit === Unit.WEI) {
    return bn.toString() + ' wei';
  }
  
  // eth
  return ethers.formatEther(bn) + ' ETH';
}

export function convertUnit(value: number, unit: Unit){
  // Assumi che value sia sempre in wei
  const strValue =  value.toString();
  if(!strValue) {return "0"};
  
  if (unit === Unit.WEI) {
    return BigInt(strValue).toString();
  } 
  
  // eth  
  return ethers.parseEther(strValue).toString(); // parseUnits(value, 18)
}