import { CTokenInterface } from "../../typechain";
import { compoundFixture } from "./utils/fixtures";
import { waffle } from "hardhat";
import { parseUnits } from "@ethersproject/units";

describe("Compound: Statistics, Exchange Rate, etc", function () {
  let cDAI: CTokenInterface;

  before(async function () {
    ({ cDAI } = await waffle.loadFixture(compoundFixture));
  });

  it("Compound: gets the exchange rate", async () => {
    /* 
      according to compound docs, The current exchange rate as an unsigned integer,
      scaled by 1 * 10^(18 - 8 + Underlying Token Decimals).

      So DAI is 18 decimals, hence the exchangeRate is scaled by:
      10^(18-8+18) = 10^(28)

      So to calculate how many cDAI come in 1 DAI, we need to scale this 28 unit number
      into 18 unit number, since DAI is also 18 Unit and then we can calculate easily
    */

    // convert the 10^28 unit exchangeRate to 10^18
    const exchangeRate = (await cDAI.exchangeRateStored()).div(parseUnits("1", 10));
    console.log("The exchange rate is incoming ➡️");
    console.log("1  DAI = ", parseUnits("1", 18).div(exchangeRate).toString(), " cDAI");
    console.log("1 CDAI = ", 1 / parseUnits("1", 18).div(exchangeRate).toNumber(), " DAI");
  });

  it("Compound: check how many underlying tokens the cToken contract holds", async () => {
    const cash = await cDAI.callStatic.getCash();
    console.log("The cDAI contract holds over ", cash.toString(), " DAI");
  });

  it("Compound: check total borrows and total supply of the underlying token", async () => {
    const totalBorrow = await cDAI.callStatic.totalBorrowsCurrent();
    const totalSupply = await cDAI.callStatic.totalSupply();
    console.log("total borrow of DAI = ", totalBorrow.toString());
    console.log("total supply of DAI = ", totalSupply.toString());
  });

  it("Compound: calculating borrow and supply APY", async () => {
    const blocksPerDay = 6570; // 13.15 secs per block
    const daysPerYear = 365;

    // supply rate divided by eth mantissa
    const supplyRate = (await cDAI.supplyRatePerBlock()).toNumber() / 1e18;
    const supplyAPY = 100 * (Math.pow(supplyRate * blocksPerDay + 1, daysPerYear) - 1);

    const borrowRate = (await cDAI.borrowRatePerBlock()).toNumber() / 1e18;
    const borrowAPY = 100 * (Math.pow(borrowRate * blocksPerDay + 1, daysPerYear) - 1);

    console.log("SupplyAPY of DAI = ", supplyAPY);
    console.log("BorrowAPY of DAI = ", borrowAPY);
  });
});
