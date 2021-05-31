<h1 align="center">Lending Protocol Playground 📈😱🚀</h1>

🙋‍♂️ I made this repo to teach myself, "how to do x with y" where "y" is a lending protocol.

## Requirements

1. Node.js v14
2. [Alchemy](http://alchemyapi.io/) - Make an alchemy account and set the `ALCHEMY_API_KEY` environment variable in the .env file
3. Run `yarn` to install dependencies

## [Compound Finance](https://compound.finance/)

- 💽 [Interfaces](https://github.com/DakshMiglani/lending-protocol-playground/tree/main/contracts/compound) we use to interact with Compound's contracts
- ＃ [Addresses](https://github.com/DakshMiglani/lending-protocol-playground/blob/main/test/compound/consts.ts) we use to connect to the mainnet deployed contracts
- ⚡️ Check [Fixtures](https://github.com/DakshMiglani/lending-protocol-playground/blob/a7884730fdf091f79a4f50bcea34baa38efb9799/test/compound/fixtures.ts#L24), we use these to setup our tests
- ➡️ [How to Deposit a token for it's cToken](https://github.com/DakshMiglani/lending-protocol-playground/blob/a7884730fdf091f79a4f50bcea34baa38efb9799/test/compound/ctoken.test.ts#L19)
- ➡️ [How to cashout our deposit by returning the cToken](https://github.com/DakshMiglani/lending-protocol-playground/blob/a7884730fdf091f79a4f50bcea34baa38efb9799/test/compound/ctoken.test.ts#L33)
- ➡️ [How to use a token as collateral and borrow another token (taking a loan)](https://github.com/DakshMiglani/lending-protocol-playground/blob/a7884730fdf091f79a4f50bcea34baa38efb9799/test/compound/ctoken.test.ts#L77)
- ➡️ [How to payback the loan and get back our collateral (original tokens)](https://github.com/DakshMiglani/lending-protocol-playground/blob/a7884730fdf091f79a4f50bcea34baa38efb9799/test/compound/ctoken.test.ts#L95)
