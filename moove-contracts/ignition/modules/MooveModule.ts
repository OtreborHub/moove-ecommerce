import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MooveFactoryModule", (m) => {
  const factory = m.contract("MooveFactory", []);

  return { factory };
});
