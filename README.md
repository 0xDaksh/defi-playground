<h1 align="center">Lending Protocol Playground 📈😱🚀</h1>

🙋‍♂️ I made this repo to teach myself, "how to do x with y" where "y" is a lending protocol.

## Requirements

1. Node.js v14+
2. [Alchemy](http://alchemyapi.io/) - Make an alchemy account and set the `ALCHEMY_API_KEY` environment variable in the .env file
3. Run `yarn` to install dependencies

## [Compound Finance](https://compound.finance/)

### Helpful Reading

- 💽 [Interfaces](https://github.com/DakshMiglani/lending-protocol-playground/tree/main/contracts/compound) we use to interact with Compound's contracts
- ＃ [Addresses](https://github.com/DakshMiglani/lending-protocol-playground/blob/902940632692c3c77f07ceecf2431ebb6cdcad57/test/compound/utils/consts.ts#L1) we use to connect to the mainnet deployed contracts
- ⚡️ Check [Fixtures](https://github.com/DakshMiglani/lending-protocol-playground/blob/902940632692c3c77f07ceecf2431ebb6cdcad57/test/compound/utils/fixtures.ts#L24), we use these to setup our tests

### How tos?

1. 💰 [How to `deposit` a token and get back a interest bearing cTokens?](https://github.com/DakshMiglani/lending-protocol-playground/blob/bec9c9313839738b991c2a3142be2bc223735d93/test/compound/01_deposits.test.ts#L19)
2. 💸 [How to `withdraw` / `cash out` your tokens by returning cTokens?](https://github.com/DakshMiglani/lending-protocol-playground/blob/bec9c9313839738b991c2a3142be2bc223735d93/test/compound/01_deposits.test.ts#L36)
3. 🤔 [How to `earn interest` on your token deposits? (Demonstration)](https://github.com/DakshMiglani/lending-protocol-playground/blob/bec9c9313839738b991c2a3142be2bc223735d93/test/compound/01_deposits.test.ts#L65)
4. 🏦 [How to take a `loan` and borrow tokens after setting a collateral?](https://github.com/DakshMiglani/lending-protocol-playground/blob/bec9c9313839738b991c2a3142be2bc223735d93/test/compound/02_borrow.test.ts#L22)
5. ⚖️ [How to check the balance you `borrowed`?](https://github.com/DakshMiglani/lending-protocol-playground/blob/bec9c9313839738b991c2a3142be2bc223735d93/test/compound/02_borrow.test.ts#L40)
6. 🥳 [How to `repay` the loan?](https://github.com/DakshMiglani/lending-protocol-playground/blob/bec9c9313839738b991c2a3142be2bc223735d93/test/compound/02_borrow.test.ts#L45)
7. 📈 [How to calculate the `exchange rate` of cTokens?](https://github.com/DakshMiglani/lending-protocol-playground/blob/bec9c9313839738b991c2a3142be2bc223735d93/test/compound/03_prices.test.ts#L20)
8. 📦 [How many `underlying tokens` does the compound contract holds?](https://github.com/DakshMiglani/lending-protocol-playground/blob/bec9c9313839738b991c2a3142be2bc223735d93/test/compound/03_prices.test.ts#L39)
9. 🧐 [How to check the `total supply` and `total borrows` of a token?](https://github.com/DakshMiglani/lending-protocol-playground/blob/bec9c9313839738b991c2a3142be2bc223735d93/test/compound/03_prices.test.ts#L44)
10. 🙋‍♂️ [How to calculate the `supply APY` and `borrow APR` of a token?](https://github.com/DakshMiglani/lending-protocol-playground/blob/bec9c9313839738b991c2a3142be2bc223735d93/test/compound/03_prices.test.ts#L51)
