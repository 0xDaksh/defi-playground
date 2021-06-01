import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { CTokenInterface, ERC20 } from "../../typechain";
import { mineBlocks, useChai } from "../utils";
import { compoundFixture } from "./utils/fixtures";
import { waffle } from "hardhat";
const expect = useChai();

describe("Deposit & Redeem", function () {
  let wallet: SignerWithAddress;
  let USDC: ERC20;
  let cUSDC: CTokenInterface;

  before(async function () {
    // go read the code for this fixture to understand
    // how we get the wallet, erc20 USDC token and ctoken of USDC
    ({ wallet, USDC, cUSDC } = await waffle.loadFixture(compoundFixture));
  });

  it("deposit USDC, get cUSDC", async () => {
    // approve the request for cUSDC to transfer 1000 USDC from your account
    await USDC.approve(cUSDC.address, 1000);
    // mint "x" cUSDC by giving them 1000 USDC
    await cUSDC.mint(1000);

    console.log("AMT USDC Minted:", (await cUSDC.balanceOf(wallet.address)).toString());

    // amt minted must not be 0
    expect(await cUSDC.balanceOf(wallet.address)).not.eq(0);
    // balance of underlying should be pretty close to 1000 (compound has a roundoff bug)
    // also since, balanceOfUnderlying is `not` a view function, we need to use callStatic
    // if you don't call it with callStatic it will `accrue` the interest in the output
    // check this: https://github.com/compound-finance/compound-protocol/blob/b9b14038612d846b83f8a009a82c38974ff2dcfe/contracts/CToken.sol#L190
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

  it("earn interest on your deposits", async () => {
    /* 
     the past 2 functions demonstrated how you can deposit and reedem your collateral
     as well as basics of cTokens, now let's earn interest.
     Compound gives interest `not` by increasing the number of cTokens but instead
     by increasing the value of those cTokens every block. 

     So the amount of USDC you get after holding cUSDC for a 1000s of blocks will be
     higher than the original deposit.
    */

    // so let's get some cTokens
    await USDC.approve(cUSDC.address, 5000);
    await cUSDC.mint(5000);
    let bal = await cUSDC.callStatic.balanceOfUnderlying(wallet.address);
    console.log("after depositing balance is: ", bal.toString(), " USDC");
    expect(bal).to.eq(5000);

    // now let's mine a large chunk of blocks and accrue some interest
    await mineBlocks(10000);
    // after mining blocks, we need to call balanceOfUnderlying `without` callStatic
    // because it will accrue our interest earned in the duration of these blocks
    await (await cUSDC.balanceOfUnderlying(wallet.address)).wait();

    // let's get our balance back again
    bal = await cUSDC.callStatic.balanceOfUnderlying(wallet.address);
    console.log("balance after accruing interest and 10K blocks: ", bal.toString(), " USDC");
    expect(bal).to.gt(5000);
  });
});
