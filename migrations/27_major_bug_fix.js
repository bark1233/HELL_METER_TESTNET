const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const WTHell = artifacts.require("WTHell");

module.exports = async function (deployer) {
  const game = await WTHell.deployed();
  await upgradeProxy(game.address, WTHell, { deployer });
};
