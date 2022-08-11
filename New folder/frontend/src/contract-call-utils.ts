import BigNumber from 'bignumber.js';
import { Web3JsCallOptions, Web3JsAbiCall, Web3JsSendOptions } from '../../abi-common';
import { Contract, Contracts } from './interfaces';

export type WTHellAlias = NonNullable<Contracts['WTHell']>;
export type NFTMarketAlias = NonNullable<Contracts['NFTMarket']>;

type WTHellMethodsFunction = (wtHellContract: WTHellAlias['methods']) => Web3JsAbiCall<string>;

export async function getFeeInHellFromUsd(
  wtHellContract: WTHellAlias,
  opts: Web3JsCallOptions,
  fn: WTHellMethodsFunction
): Promise<string> {
  const feeInUsd = await fn(wtHellContract.methods).call(opts);

  const feeInHell = await wtHellContract.methods
    .usdToHell(feeInUsd)
    .call(opts);

  return feeInHell;
}

type WithOptionalFrom<T extends { from: unknown }> = Omit<T, 'from'> & Partial<Pick<T, 'from'>>;

export async function approveFee(
  wtHellContract: WTHellAlias,
  hellToken: Contracts['HellToken'],
  from: NonNullable<Web3JsCallOptions['from']>,
  hellRewardsAvailable: string,
  callOpts: WithOptionalFrom<Web3JsCallOptions>,
  approveOpts: WithOptionalFrom<Web3JsSendOptions>,
  fn: WTHellMethodsFunction
) {
  const callOptsWithFrom: Web3JsCallOptions = { from, ...callOpts };
  const approveOptsWithFrom: Web3JsSendOptions = { from, ...approveOpts };

  let feeInHell = new BigNumber(await getFeeInHellFromUsd(wtHellContract, callOptsWithFrom, fn));

  try {
    feeInHell = await wtHellContract.methods
      .getHellNeededFromUserWallet(from, feeInHell.toString())
      .call(callOptsWithFrom)
      .then(n => new BigNumber(n));

  }
  catch(err) {
    const paidByRewardPool = feeInHell.lte(hellRewardsAvailable);

    if(paidByRewardPool) {
      return null;
    }
  }

  const allowance = await hellToken.methods
    .allowance(from, wtHellContract.options.address)
    .call(callOptsWithFrom);

  if(feeInHell.lte(allowance)) {
    return null;
  }

  return await hellToken.methods
    .approve(wtHellContract.options.address, feeInHell.toString())
    .send(approveOptsWithFrom);
}

export async function waitUntilEvent(contract: Contract<unknown>, eventName: string, opts: Record<string, unknown>): Promise<Record<string, unknown>> {
  let subscriber: any;

  const data = await new Promise<Record<string, unknown>>((resolve, reject) => {
    subscriber = contract.events[eventName](opts, (err: Error | null, data: Record<string, unknown> | null) => {
      if(err) reject(err);
      else resolve(data!);
    });
  });

  subscriber.unsubscribe();

  return data;
}
