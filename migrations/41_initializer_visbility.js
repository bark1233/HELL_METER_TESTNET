const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const DummyRandoms = artifacts.require("DummyRandoms");

module.exports = async function (deployer, network, accounts) {

  if (network === 'development' || network === 'development-fork') {
    await upgradeProxy(DummyRandoms.address, DummyRandoms, { deployer });
  }
};
