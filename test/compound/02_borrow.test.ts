import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ComptrollerInterface, CTokenInterface, ERC20 } from "../../typechain";
import { useChai } from "../utils";
import { compoundFixture } from "./utils/fixtures";
import { waffle } from "hardhat";
const expect = useChai();

describe("Compound: Borrow and Payback", function () {
  let wallet: SignerWithAddress;
  let USDC: ERC20;
  let DAI: ERC20;
  let cUSDC: CTokenInterface;
  let cDAI: CTokenInterface;
  let comptroller: ComptrollerInterface;

  before(async function () {
    // go read the code for this fixture to understand
    // how we get the wallet, erc20 USDC token, ctoken of USDC, etc.
    ({ wallet, USDC, DAI, cUSDC, cDAI, comptroller } = await waffle.loadFixture(compoundFixture));
  });

  it("Compound: deposit USDC as collateral and borrow DAI", async () => {
    // approve cUSDC to take out 1000 USDC from wallet
    await USDC.approve(cUSDC.address, 1000);
    // deposit 1000 USDC tokens and get the cUSDC in return
    await cUSDC.mint(1000);

    // set USDC as collateral
    const markets = [cUSDC.address];
    await comptroller.enterMarkets(markets);

    // using that collateral, let's borrow some DAI
    // but we can only borrow ~80% of what our collateral is
    await cDAI.borrow(799);

    // check balanceOf DAI
    expect(await DAI.balanceOf(wallet.address)).to.eq(799);
  });

  it("Compound: check the borrow balance of DAI", async () => {
    const bal = await cDAI.callStatic.borrowBalanceCurrent(wallet.address);
    expect(bal).to.eq(799);
  });

  it("Compound: repay the borrowed DAI", async () => {
    // approve cDAI to take out 799 DAI from your account
    await DAI.approve(cDAI.address, 799);
    // repay the borrowed amount
    await cDAI.repayBorrow(799);
    // note: there's also a repayBorrowBehalf that allows you to repay someone else's debt

    // cDAI borrowBalanceCurrent should be 0 now
    expect(await cDAI.callStatic.borrowBalanceCurrent(wallet.address)).to.eq(0);
    // DAI balance should be 0 now
    expect(await DAI.balanceOf(wallet.address)).to.eq(0);
  });
});
