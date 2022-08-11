const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const HellStakingRewardsUpgradeable = artifacts.require("HellStakingRewardsUpgradeable");

module.exports = async function (deployer, network, accounts) {
  if (network === 'bscmainnet' || network === 'bscmainnet-fork') {
    const hellTokenAddress = '0x154A9F9cbd3449AD22FDaE23044319D6eF2a1Fab';

    await deployProxy(HellStakingRewardsUpgradeable, [accounts[0], accounts[0], hellTokenAddress, hellTokenAddress, 7 * 24 * 60 * 60], { deployer });
  }
};
