import { use, expect } from "chai";
import hre from "hardhat";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";

export const useChai = (): typeof expect => {
  use(chaiAsPromised);
  use(solidity);

  return expect;
};

export const impersonate = async (accounts: string[]): Promise<void> => {
  for (const account of accounts) {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [account],
    });
  }
};

export const mineBlocks = async (blocks: number): Promise<void> => {
  for (let index = 0; index < blocks; index++) {
    await hre.network.provider.send("evm_mine");
  }
};
