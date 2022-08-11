const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const WTHell = artifacts.require("WTHell");
const Weapons = artifacts.require("Weapons");

module.exports = async function (deployer) {
  const game = await WTHell.deployed();
  await upgradeProxy(game.address, WTHell, { deployer });

  const weps = await Weapons.deployed();
  await upgradeProxy(weps.address, Weapons, { deployer });
};
