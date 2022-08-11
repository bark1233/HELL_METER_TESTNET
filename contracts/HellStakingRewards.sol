pragma solidity ^0.6.2;

import "./staking/StakingRewards.sol";

contract HellStakingRewards is StakingRewards {
    constructor(
        address _owner,
        address _rewardsDistribution,
        address _rewardsToken,
        address _stakingToken,
        uint256 _minimumStakeTime
    )
        public
        StakingRewards(
            _owner,
            _rewardsDistribution,
            _rewardsToken,
            _stakingToken,
            _minimumStakeTime
        )
    {}
}
