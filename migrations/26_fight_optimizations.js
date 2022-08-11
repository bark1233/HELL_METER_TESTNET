const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const WTHell = artifacts.require("WTHell");
const Characters = artifacts.require("Characters");
const Weapons = artifacts.require("Weapons");
const RaidBasic = artifacts.require("RaidBasic");

module.exports = async function (deployer) {
  const charas = await Characters.deployed();
  await upgradeProxy(charas.address, Characters, { deployer });

  const weps = await Weapons.deployed();
  const newWeps = await upgradeProxy(weps.address, Weapons, { deployer });
  await newWeps.migrateTo_aa9da90();

  const game = await WTHell.deployed();
  const newGame = await upgradeProxy(game.address, WTHell, { deployer });
  await newGame.migrateTo_aa9da90();

  const raidBasic = await RaidBasic.deployed();
  await upgradeProxy(raidBasic.address, RaidBasic, { deployer });
};
