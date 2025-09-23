import { ethers } from "ethers";

export function formatAddress(address: string) {
    return address.substring(0, 8) + "..." + address.substring(address.length - 8, address.length)
}

export function formatPrice(value: string | number, unit: "wei" | "finney" | "eth" = "wei") {
  // Assumi che value sia sempre in wei
  const bn = typeof value === "string" ? BigInt(value) : BigInt(value);
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