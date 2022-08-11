import { Contract as Web3EthContract } from 'web3-eth-contract';
import type { IERC20, IStakingRewards, WTHell, Characters, Weapons, RaidBasic, IRandoms, NFTMarket, WaxBridge } from '../../../build/abi-interfaces';
import { StakeType } from './State';

interface TypeSafeContract<Abi> {
  methods: Abi;
}

export type Contract<Abi> = Omit<Web3EthContract, 'methods'> & TypeSafeContract<Abi>;

export type StakingContracts = Partial<Record<StakeType, {
  StakingRewards: Contract<IStakingRewards>,
  StakingToken: Contract<IERC20>
}>>;

export interface Contracts {
  HellToken: Contract<IERC20>;
  staking: StakingContracts;

  WTHell?: Contract<WTHell>;
  Randoms?: Contract<IRandoms>;
  Characters?: Contract<Characters>;
  Weapons?: Contract<Weapons>;
  RaidBasic?: Contract<RaidBasic>;
  NFTMarket?: Contract<NFTMarket>;
  WaxBridge?: Contract<WaxBridge>;
}
