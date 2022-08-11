const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const WTHell = artifacts.require("WTHell");

module.exports = async function (deployer, network, accounts) {
  const game = await upgradeProxy(WTHell.address, WTHell, { deployer });
  await game.migrateTo_7dd2a56();
};
