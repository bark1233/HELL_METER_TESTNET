const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const WTHell = artifacts.require("WTHell");
const Characters = artifacts.require("Characters");

module.exports = async function (deployer) {
  const charas = await Characters.deployed();
  const newCharas = await upgradeProxy(charas.address, Characters, { deployer });
  await newCharas.migrateTo_1ee400a();

  const game = await WTHell.deployed();
  const newGame = await upgradeProxy(game.address, WTHell, { deployer });
  await newGame.migrateTo_1ee400a();
};
