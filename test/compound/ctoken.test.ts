import { parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { CTokenInterface, CTokenInterface__factory, ERC20, ERC20__factory } from "../../typechain";
import { impersonate, useChai } from "../utils";
import { cUSDCAddr, USDCAddr, USDCWhaleAddr } from "./consts";

const expect = useChai();

describe("Deposit & Redeem", function () {
  let wallet: SignerWithAddress;
  let USDC: ERC20;
  let cUSDC: CTokenInterface;

  before(async function () {
    // get a wallet with 1000 ETH
    [wallet] = await ethers.getSigners();
    cUSDC = CTokenInterface__factory.connect(cUSDCAddr, wallet);
    USDC = ERC20__factory.connect(USDCAddr, wallet);

    // send some eth to the whale
    await wallet.sendTransaction({
      value: parseEther("1"),
      to: USDCWhaleAddr,
    });

    // impersonate the whale
    await impersonate([USDCWhaleAddr]);
    const USDCWhale = await ethers.getSigner(USDCWhaleAddr);

    console.log("current usdc balance in our wallet: ", (await USDC.balanceOf(wallet.address)).toString());
    console.log("sending some USDC");
    await USDC.connect(USDCWhale).transfer(wallet.address, 10000);
    console.log("usdc balance after transfer in our wallet: ", (await USDC.balanceOf(wallet.address)).toString());
  });

  it("deposit USDC and get cUSDC", async () => {
    await USDC.approve(cUSDC.address, 1000);
    await cUSDC.mint(1000);

    expect(await cUSDC.balanceOf(wallet.address)).not.eq(0);
    expect(await cUSDC.callStatic.balanceOfUnderlying(wallet.address)).to.eq(999);
  });

  it("cashes USDC out by returning cUSDC", async () => {
    // cash out based on number of ctokens
    let usdcBalance = await USDC.balanceOf(wallet.address);
    const currentTokens = await cUSDC.balanceOf(wallet.address);
    // redeem 1/3rd of the cTokens
    await cUSDC.redeem(currentTokens.div(3));

    // we should get back 1/3rd of the underlying USDC
    expect(await USDC.balanceOf(wallet.address)).to.eq(usdcBalance.add(999 / 3));
    // we should have 2/3rd of the total cTokens
    expect(await cUSDC.balanceOf(wallet.address)).to.eq(currentTokens.sub(currentTokens.div(3)));

    // cash out based on number of underlying (USDC)
    usdcBalance = await USDC.balanceOf(wallet.address);

    // let's cash out 100 USDC
    await cUSDC.redeemUnderlying(100);
    expect(await USDC.balanceOf(wallet.address)).to.eq(usdcBalance.add(100));
  });
});
