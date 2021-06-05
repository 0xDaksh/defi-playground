import { formatEther, formatUnits, parseEther, parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { waffle } from "hardhat";
import { ERC20, ILendingPool } from "../../typechain";
import { useChai } from "../utils";
import { aaveV2Fixture } from "./utils/fixtures";

const expect = useChai();

describe("Aave V2: Borrow and Repay", function () {
  let wallet: SignerWithAddress;
  let DAI: ERC20;
  let USDC: ERC20;
  let pool: ILendingPool;

  before(async function () {
    ({ wallet, DAI, USDC, lendingPool: pool } = await waffle.loadFixture(aaveV2Fixture));

    // let's add some collateral to our account
    // otherwise we won't be able to take a loan
    const daiBal = parseEther("1000");
    await DAI.approve(pool.address, daiBal);
    await pool.deposit(DAI.address, daiBal, wallet.address, 0);
  });

  it("Aave V2: setting a particular asset as collateral", async () => {
    // let's say you have multiple assets deposited into the aave v2 protocol
    // but you only want to use one of them, to get the loan
    // ie -> in case of liquidations (loan fail), you don't want to lose your other tokens
    // in such a case we set an asset reserve to be used as collateral for our account

    // we pass in the asset address, and whether it should be used as collateral
    // in our case since we deposited DAI, i will use it as collateral
    await pool.setUserUseReserveAsCollateral(DAI.address, true);
  });

  it("Aave V2: borrow stable loan", async () => {
    // let's check our USDC balance before we borrow
    const balBefore = await USDC.balanceOf(wallet.address);
    console.log("balance of USDC before we borrow: ", formatUnits(balBefore, 6));
    expect(balBefore).to.eq(0);

    // so aave has two kinds of loans
    // 1. stable loans - stable apr in the short term, long term adjusts to market change
    // 2. variable loans - variable apr, changes based on the supply / demand
    // more on this here: https://docs.aave.com/faq/borrowing#what-is-the-difference-between-stable-and-variable-rate

    const amt = parseUnits("700", 6); // we can only borrow a fraction of our collateral
    await pool.borrow(
      USDC.address, // address of asset we want to borrow
      amt, // amt we want to borrow
      1, // interest rate mode -> 1 = stable, 2 = variable
      0, // referral code
      wallet.address, // on behalf of which account
    );

    // let's check our USDC balance after we borrow
    const balAfter = await USDC.balanceOf(wallet.address);
    console.log("balance of USDC before we borrow: ", formatUnits(balAfter, 6));
    expect(balAfter).to.eq(amt);
  });

  it("Aave V2: change borrow rate mode from stable to variable", async () => {
    // let's assume we have a loan in stable borrowing rate, like we do in previous test
    // how do we convert it from stable to variable borrowing rate?
    // Well, super simple -> we provide the asset address & current rate mode
    // since our current rate mode is 1 (stable), we pass in that and aave will replace
    // it with variable
    await pool.swapBorrowRateMode(USDC.address, 1);
  });

  it("Aave V2: repay the borrowed sum (ie: repay the loan)", async () => {
    const balBefore = await USDC.balanceOf(wallet.address);
    console.log("USDC balance before repaying debt = ", formatUnits(balBefore, 6));
    expect(balBefore).to.not.eq(0);

    // let's allow the pool to withdraw the amount from our USDC account
    await USDC.approve(pool.address, balBefore);
    // call pool.repay with similar arguments in borrow
    // asset, balance we want to repay, borrow rate (variable), and on behalf of address
    await pool.repay(USDC.address, balBefore, 2, wallet.address);
    const balAfter = await USDC.balanceOf(wallet.address);

    console.log("USDC balance after repaying debt = ", formatUnits(balAfter, 6));
    expect(balAfter).to.eq(0);

    // let's check our total debt now
    const data = await pool.getUserAccountData(wallet.address);
    console.log("total debt on our account (value in ETH) = ", formatEther(data.totalDebtETH));
    expect(data.totalDebtETH).to.lte(parseEther("0.0000001"));
  });
});
