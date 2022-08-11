const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const WTHell = artifacts.require("WTHell");

module.exports = async function (deployer, network, accounts) {
  await upgradeProxy(WTHell.address, WTHell, { deployer });
};
