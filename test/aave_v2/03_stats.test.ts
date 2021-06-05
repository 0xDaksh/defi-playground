import { formatEther, formatUnits, parseEther, parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { waffle } from "hardhat";
import { ERC20, ILendingPool, IPriceOracle } from "../../typechain";
import { aaveV2Fixture } from "./utils/fixtures";

describe("Aave V2: Get Statistics", function () {
  let wallet: SignerWithAddress;
  let DAI: ERC20;
  let USDC: ERC20;
  let pool: ILendingPool;
  let priceOracle: IPriceOracle;

  before(async function () {
    ({ wallet, DAI, USDC, lendingPool: pool, priceOracle } = await waffle.loadFixture(aaveV2Fixture));

    // let's add some collateral to our account
    // otherwise we won't be able to take a loan
    const daiBal = parseEther("1000");
    await DAI.approve(pool.address, daiBal);
    await pool.deposit(DAI.address, daiBal, wallet.address, 0);
    // borrow some amount in USDC too
    const usdcBal = parseUnits("500", 6);
    await pool.borrow(USDC.address, usdcBal, 1, 0, wallet.address);
  });

  it("Aave V2: Fetches User Account Data", async () => {
    const data = await pool.getUserAccountData(wallet.address);
    console.log("The following values are in ETH:");
    console.log(`total collateral = ${formatEther(data.totalCollateralETH)} ETH`);
    console.log(`total loan/debt = ${formatEther(data.totalDebtETH)} ETH`);
    console.log(`amount bororwable = ${formatEther(data.availableBorrowsETH)} ETH`);
    console.log(`loan to value = ${formatUnits(data.ltv, 2)}`);
    console.log(`user health = ${formatEther(data.healthFactor)}`);
  });

  it("Aave V2: Get Borrow APR and Supply APY", async () => {
    const data = await pool.getReserveData(DAI.address);
    // all these rates come in Ray (1e27)
    // more info on Ray -> https://medium.com/dapphub/introducing-ds-math-an-innovative-safe-math-library-d58bc88313da

    const formatPct = (value: BigNumberish) => {
      return formatUnits(value, 27 - 2); // -2 because we want in percentage not decimals
    };
    console.log("DAI Supply APY = ", formatPct(data.currentLiquidityRate), "%");
    console.log("DAI Borrow APR (Stable) = ", formatPct(data.currentStableBorrowRate), "%");
    console.log("DAI Borrow APR (Variable) = ", formatPct(data.currentVariableBorrowRate), "%");
  });

  it("Aave V2: Get the price of token", async () => {
    const priceOfDAI = await priceOracle.getAssetPrice(DAI.address);
    console.log(`1 DAI = ${formatEther(priceOfDAI)} ETH`);
    const priceOfUSDC = await priceOracle.getAssetPrice(USDC.address);
    console.log(`1 USDC = ${formatEther(priceOfUSDC)} ETH`);
  });
});
