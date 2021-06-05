import { parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  ComptrollerInterface,
  ComptrollerInterface__factory,
  CTokenInterface,
  CTokenInterface__factory,
  ERC20,
  ERC20__factory,
} from "../../../typechain";
import { DAIAddr, USDCAddr, USDCWhaleAddr } from "../../consts";
import { impersonate } from "../../utils";
import { cUSDCAddr, cDAIAddr, comptrollerAddr } from "./consts";

interface CompoundFixtureResult {
  wallet: SignerWithAddress;
  cUSDC: CTokenInterface;
  cDAI: CTokenInterface;
  USDC: ERC20;
  DAI: ERC20;
  comptroller: ComptrollerInterface;
}

export const compoundFixture = async (): Promise<CompoundFixtureResult> => {
  // get a wallet with 1000 ETH
  const [wallet] = await ethers.getSigners();

  // get the compound controller -> comptroller!
  const comptroller = ComptrollerInterface__factory.connect(comptrollerAddr, wallet);

  // get the cerc20 token for USDC
  const cUSDC = CTokenInterface__factory.connect(cUSDCAddr, wallet);
  // get the cerc20 token for DAI
  const cDAI = CTokenInterface__factory.connect(cDAIAddr, wallet);
  // get the erc20 token for USDC
  const USDC = ERC20__factory.connect(USDCAddr, wallet);
  // get the erc20 token for DAI
  const DAI = ERC20__factory.connect(DAIAddr, wallet);

  // a whale is an account with a ton of tokens/ether
  // we impersonate a whale on a local network to acquire those tokens
  // we're sending some ether to cover the transfer fees
  await wallet.sendTransaction({
    value: parseEther("1"),
    to: USDCWhaleAddr,
  });

  // impersonate the whale
  await impersonate([USDCWhaleAddr]);
  const USDCWhale = await ethers.getSigner(USDCWhaleAddr);

  // originally we should have 0 USDC in our wallet
  // after transfering it from whale to us
  // we should have 10,000 USDC
  await USDC.connect(USDCWhale).transfer(wallet.address, 10000);

  return {
    wallet,
    cUSDC,
    cDAI,
    USDC,
    DAI,
    comptroller,
  };
};
