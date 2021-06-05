import { use, expect } from "chai";
import hre from "hardhat";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export const useChai = (): typeof expect => {
  use(chaiAsPromised);
  use(solidity);

  return expect;
};

export const impersonate = async (accounts: string[]): Promise<SignerWithAddress[]> => {
  const signers: SignerWithAddress[] = [];
  for (const account of accounts) {
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [account],
    });

    signers.push(await hre.ethers.getSigner(account));
  }

  return signers;
};

export const mineBlocks = async (blocks: number): Promise<void> => {
  for (let index = 0; index < blocks; index++) {
    await hre.network.provider.send("evm_mine");
  }
};
