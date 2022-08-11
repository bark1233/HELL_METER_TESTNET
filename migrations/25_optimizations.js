const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const WTHell = artifacts.require("WTHell");
const Characters = artifacts.require("Characters");

module.exports = async function (deployer) {
  const charas = await Characters.deployed();
  await upgradeProxy(charas.address, Characters, { deployer });

  const game = await WTHell.deployed();
  await upgradeProxy(game.address, WTHell, { deployer });
};
