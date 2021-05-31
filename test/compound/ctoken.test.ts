import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ComptrollerInterface, CTokenInterface, ERC20 } from "../../typechain";
import { useChai } from "../utils";
import { compoundFixture } from "./fixtures";

const expect = useChai();

describe("Deposit & Redeem", function () {
  let wallet: SignerWithAddress;
  let USDC: ERC20;
  let cUSDC: CTokenInterface;

  before(async function () {
    // go read the code for this fixture to understand
    // how we get the wallet, erc20 USDC token and ctoken of USDC
    ({ wallet, USDC, cUSDC } = await compoundFixture());
  });

  it("deposit USDC and get cUSDC", async () => {
    // approve the request for cUSDC to transfer 1000 USDC from your account
    await USDC.approve(cUSDC.address, 1000);
    // mint "x" cUSDC by giving them 1000 USDC
    await cUSDC.mint(1000);

    console.log("AMT USDC Minted:", (await cUSDC.balanceOf(wallet.address)).toString());

    // amt minted must not be 0
    expect(await cUSDC.balanceOf(wallet.address)).not.eq(0);
    // balance of underlying should be pretty close to 1000 (compound has a roundoff bug)
    expect(await cUSDC.callStatic.balanceOfUnderlying(wallet.address)).to.eq(999);
  });

  it("cashes USDC out by returning cUSDC", async () => {
    /* there are two ways of cashing out our tokens
    1. by the amount of USDC we want to cash out
    2. by the amount of cUSDC we want to cash out

    the amount of those can be different based on exchange rates overtime
    which is why we have two functions.
    */

    // 1. cash out based on number of ctokens
    // let's check the amount of USDC and cUSDC we have
    let usdcBalance = await USDC.balanceOf(wallet.address);
    const currentTokens = await cUSDC.balanceOf(wallet.address);
    // redeem 1/3rd of the cTokens
    await cUSDC.redeem(currentTokens.div(3));

    // we should get back 1/3rd of the underlying USDC
    expect(await USDC.balanceOf(wallet.address)).to.eq(usdcBalance.add(999 / 3));
    // we should have remaining 2/3rd of the total cTokens
    expect(await cUSDC.balanceOf(wallet.address)).to.eq(currentTokens.sub(currentTokens.div(3)));

    usdcBalance = await USDC.balanceOf(wallet.address);

    // 2. cash out based on the number of underlying USDC we have
    const underlyingUSDC = await cUSDC.callStatic.balanceOfUnderlying(wallet.address);
    await cUSDC.redeemUnderlying(underlyingUSDC);
    expect(await USDC.balanceOf(wallet.address)).to.eq(usdcBalance.add(underlyingUSDC));
  });
});

describe("Borrow and Payback", function () {
  let wallet: SignerWithAddress;
  let USDC: ERC20;
  let DAI: ERC20;
  let cUSDC: CTokenInterface;
  let cDAI: CTokenInterface;
  let comptroller: ComptrollerInterface;

  before(async function () {
    // go read the code for this fixture to understand
    // how we get the wallet, erc20 USDC token and ctoken of USDC
    ({ wallet, USDC, DAI, cUSDC, cDAI, comptroller } = await compoundFixture());
  });

  it("deposit USDC as collateral and borrow DAI", async () => {
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

  it("repay the borrowed DAI", async () => {
    // approve cDAI to take out 799 DAI from your account
    await DAI.approve(cDAI.address, 799);
    // repay the borrowed amount
    await cDAI.repayBorrow(799);

    // DAI balance should be 0 now
    expect(await DAI.balanceOf(wallet.address)).to.eq(0);
  });
});
