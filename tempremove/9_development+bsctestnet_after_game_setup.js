const HellToken = artifacts.require("HellToken");
const WTHell = artifacts.require("WTHell");
const BasicPriceOracle = artifacts.require("BasicPriceOracle");

module.exports = async function (deployer, network) {
  if (network === 'development' || network === 'development-fork' || network === 'bsctestnet' || network === 'bsctestnet-fork') {
    const token = await HellToken.deployed();
    const game = await WTHell.deployed();
    await token.transferFrom(token.address, game.address, web3.utils.toWei('0.5', 'mether')); // megaether

    const priceOracle = await BasicPriceOracle.deployed();
    await priceOracle.setCurrentPrice(web3.utils.toWei('0.2', 'ether')); // 1/5 HELL per USD, AKA 5 USD per HELL

    await token.transferFrom(token.address, '0xC2573A26297a0c952C92bb48Fdcb6929524F7F48', web3.utils.toWei('100', 'kether')); // Philip Devine
    await token.transferFrom(token.address, '0xa2bB660A6A3Bb5c74E36415ffe5D4862eFfc417A', web3.utils.toWei('100', 'kether')); // Raymond H.
  }
};
