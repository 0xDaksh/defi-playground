import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { aDAIAddr, aUSDCAddr, LendingPoolAddr, LendingPoolAddressProviderAddr, PriceOracleAddr } from "./consts";
import {
  ERC20,
  ERC20__factory,
  IAToken,
  IAToken__factory,
  ILendingPool,
  ILendingPoolAddressesProvider,
  ILendingPoolAddressesProvider__factory,
  ILendingPool__factory,
  IPriceOracle,
  IPriceOracle__factory,
} from "../../../typechain";
import { DAIAddr, USDCAddr, DAIWhaleAddr } from "../../consts";
import { impersonate } from "../../utils";
import { parseEther } from "@ethersproject/units";

interface AaveV2FixtureResult {
  wallet: SignerWithAddress;
  addrProvider: ILendingPoolAddressesProvider;
  lendingPool: ILendingPool;
  priceOracle: IPriceOracle;
  aDAI: IAToken;
  aUSDC: IAToken;
  DAI: ERC20;
  USDC: ERC20;
}

export const aaveV2Fixture = async (): Promise<AaveV2FixtureResult> => {
  const [wallet] = await ethers.getSigners();
  const addrProvider = ILendingPoolAddressesProvider__factory.connect(LendingPoolAddressProviderAddr, wallet);
  const lendingPool = ILendingPool__factory.connect(LendingPoolAddr, wallet);
  const priceOracle = IPriceOracle__factory.connect(PriceOracleAddr, wallet);
  const aDAI = IAToken__factory.connect(aDAIAddr, wallet);
  const aUSDC = IAToken__factory.connect(aUSDCAddr, wallet);
  const DAI = ERC20__factory.connect(DAIAddr, wallet);
  const USDC = ERC20__factory.connect(USDCAddr, wallet);

  const [daiWhaleSigner] = await impersonate([DAIWhaleAddr]);

  // let's impersonate the account that has a lot of DAI and transfer some to ours
  // before we do that, let's send some eth to cover up if the account doesn't
  // have any eth

  await wallet.sendTransaction({
    to: daiWhaleSigner.address,
    value: parseEther("1"),
  });

  // send 10K+ DAI to our master wallet
  await DAI.connect(daiWhaleSigner).transfer(wallet.address, parseEther("10000"));

  return {
    wallet,
    addrProvider,
    lendingPool,
    priceOracle,
    aDAI,
    aUSDC,
    DAI,
    USDC,
  };
};
