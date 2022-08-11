const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const WTHell = artifacts.require("WTHell");
const Characters = artifacts.require("Characters");
const Weapons = artifacts.require("Weapons");
const RaidBasic = artifacts.require("RaidBasic");

module.exports = async function (deployer) {
  const game = await WTHell.deployed();
  await upgradeProxy(game.address, WTHell, { deployer });

  const charas = await Characters.deployed();
  await upgradeProxy(charas.address, Characters, { deployer });

  const weps = await Weapons.deployed();
  await upgradeProxy(weps.address, Weapons, { deployer });

  const raid = await RaidBasic.deployed();
  await upgradeProxy(raid.address, RaidBasic, { deployer });
};
