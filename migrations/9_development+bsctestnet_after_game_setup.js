const HellToken = artifacts.require("HellToken");
const WTHell = artifacts.require("WTHell");
const BasicPriceOracle = artifacts.require("BasicPriceOracle");

module.exports = async function (_deployer, network) {
  if (network === 'development' || network === 'development-fork' || network === 'bsctestnet' || network === 'bsctestnet-fork') {
    const token = await HellToken.deployed();
    const game = await WTHell.deployed();
    await token.transferFrom(token.address, game.address, web3.utils.toWei('0.5', 'mether')); // megaether

    const priceOracle = await BasicPriceOracle.deployed();
    await priceOracle.setCurrentPrice(web3.utils.toWei('0.2', 'ether')); // 1/5 HELL per USD, AKA 5 USD per HELL

    await token.transferFrom(token.address, '0xd71F9F35bB9477483b1c54474e7700147e819D3B', web3.utils.toWei('100', 'kether')); // Waltrick Testing
  }
};
