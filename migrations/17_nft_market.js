const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const HellToken = artifacts.require("HellToken");
const WTHell = artifacts.require("WTHell");
const NFTMarket = artifacts.require("NFTMarket");

module.exports = async function (deployer, network) {
  let hellTokenAddress;
  if (network === 'bscmainnet' || network === 'bscmainnet-fork') {
    hellTokenAddress = '0x154a9f9cbd3449ad22fdae23044319d6ef2a1fab';
  }
  else {
    hellTokenAddress = HellToken.address;
  }

  await deployProxy(NFTMarket, [hellTokenAddress, WTHell.address], { deployer });
};
