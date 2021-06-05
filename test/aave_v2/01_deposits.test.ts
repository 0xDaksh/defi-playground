import { formatEther, parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { waffle } from "hardhat";
import { ERC20, IAToken, ILendingPool } from "../../typechain";
import { mineBlocks, useChai } from "../utils";
import { aaveV2Fixture } from "./utils/fixtures";

const expect = useChai();

describe("Aave V2: Deposit & Redeem", function () {
  let wallet: SignerWithAddress;
  let aDAI: IAToken;
  let DAI: ERC20;
  let pool: ILendingPool;

  before(async function () {
    ({ wallet, aDAI, DAI, lendingPool: pool } = await waffle.loadFixture(aaveV2Fixture));
  });

  it("Aave V2: deposit", async () => {
    // let's check our aDAI balance first
    let bal = await aDAI.balanceOf(wallet.address);
    console.log("aDAI balance before deposit = ", formatEther(bal));
    expect(bal).to.eq(0);

    // let's deposit some dai and in return get some adai back!
    const amt = parseEther("1000");
    // before depositing our dai, we need to approve that the contract
    // can withdraw 1000 dai from our account
    await DAI.approve(pool.address, amt);

    // now let's request the pool to deposit dai in the reserve and give us aDAI
    // 1. the address of DAI (which is the underlying token)
    // 2. the amount of DAI we want to deposit in the reserve
    // 3. the address of the account we want to deposit in
    // 4. referral code, we can put 0 in there :)
    await pool.deposit(DAI.address, amt, wallet.address, 0);

    // now we should get 100 aDAI in return for depositing
    bal = await aDAI.balanceOf(wallet.address);
    console.log("aDAI balance after deposit = ", formatEther(bal));
    expect(bal).to.gte(amt.sub(1)); // expect the amount to be lower due to roundoff
  });

  it("Aave V2: withdraw", async () => {
    // let's return the aDAI and get back our DAI
    // first let's check the balance of aDAI
    const daiBalBefore = await DAI.balanceOf(wallet.address);
    console.log("DAI balance before withdraw = ", formatEther(daiBalBefore));

    const aDaiBalBefore = await aDAI.balanceOf(wallet.address);
    console.log("aDAI balance before withdraw = ", formatEther(aDaiBalBefore));
    expect(aDaiBalBefore).to.not.eq(0);

    // now, let's withdraw using the pool
    // 1. the asset address (DAI)
    // 2. amount of DAI to withdraw
    // 3. account to withdraw into (our wallet)
    await pool.withdraw(DAI.address, aDaiBalBefore, wallet.address);

    const daiBalAfter = await DAI.balanceOf(wallet.address);
    expect(daiBalAfter).to.eq(daiBalBefore.add(aDaiBalBefore));
    console.log("DAI balance after withdraw = ", formatEther(daiBalAfter));

    const aDaiBalAfter = await aDAI.balanceOf(wallet.address);
    console.log("aDAI balance after withdraw = ", formatEther(aDaiBalAfter));

    // NOTE: due to a roundoff issue you might not get 100% of the aTokens
    // there might be `0.00xxxx` amount of tokens still left
    // so we expect a value in the aDAI contract to be less than or equal to 0.0001
    expect(aDaiBalAfter).to.lte(parseEther("0.0001"));
  });

  it("Aave V2: earn interest", async () => {
    // let's get some aDAI first
    const amt = await DAI.balanceOf(wallet.address);
    await DAI.approve(pool.address, amt);
    await pool.deposit(DAI.address, amt, wallet.address, 0);

    const balBeforeInterest = await aDAI.balanceOf(wallet.address);
    console.log("aDAI balance after deposit = ", formatEther(balBeforeInterest));

    // assuming 15 seconds = 1 block
    // let's mine 1week of blocks to gain a good amount of interest
    const seconds_in_week = 24 * 7 * 60 * 60;
    await mineBlocks(seconds_in_week / 15);

    const newBal = await aDAI.balanceOf(wallet.address);
    console.log("aDAI balance after 1 week = ", formatEther(newBal));
    expect(newBal.sub(balBeforeInterest)).to.gte(parseEther("0.0000001"));
    await pool.withdraw(DAI.address, newBal, wallet.address);
  });
});
