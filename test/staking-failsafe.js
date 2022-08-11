const StakingRewards = artifacts.require('StakingRewards');
const HellToken = artifacts.require('HellToken');

contract('StakingRewards', accounts => {
  describe('failsafe mode', () => {
    let sr;
    beforeEach(async () => {
      const hell = await HellToken.deployed();

      sr = await StakingRewards.new(accounts[0], accounts[0], hell.address, hell.address, 0);
    });

    it('should allow stakers to recover their stake, and owner to recover staking tokens that were not staked', async () => {
      const hell = await HellToken.deployed();

      assert.isFalse(await sr.failsafeModeActive(), 'Failsafe Mode should be disabled');

      // stake 200
      await hell.increaseAllowance(sr.address, '200', { from: accounts[0] });
      await sr.stake('200', { from: accounts[0] });

      // transfer extra 300 hell that wasn't actually staked
      await hell.transfer(sr.address, '300', { from: accounts[0] });

      assert.strictEqual((await sr.balanceOf(accounts[0])).toString(), '200');
      assert.strictEqual((await hell.balanceOf(sr.address)).toString(), '500');

      await sr.enableFailsafeMode({ from: accounts[0] });

      const account0HellBalanceBefore = await hell.balanceOf(accounts[0]);

      await sr.recoverOwnStake({ from: accounts[0] });
      assert.strictEqual((await sr.balanceOf(accounts[0])).toString(), '0');
      assert.strictEqual((await sr.totalSupply()).toString(), '0');
      assert.strictEqual((await hell.balanceOf(sr.address)).toString(), '300');
      assert.strictEqual(
        (await hell.balanceOf(accounts[0])).toString(),
        account0HellBalanceBefore.add(web3.utils.toBN('200')).toString()
      );

      await sr.recoverExtraStakingTokensToOwner({ from: accounts[0] });
      assert.strictEqual((await sr.balanceOf(accounts[0])).toString(), '0');
      assert.strictEqual((await sr.totalSupply()).toString(), '0');
      assert.strictEqual((await hell.balanceOf(sr.address)).toString(), '0');
      assert.strictEqual(
        (await hell.balanceOf(accounts[0])).toString(),
        account0HellBalanceBefore.add(web3.utils.toBN('500')).toString()
      );
    });

    it('should prevent any normal functionality when in failsafe mode', async () => {
      assert.isFalse(await sr.failsafeModeActive(), 'Failsafe Mode should be disabled');

      await sr.enableFailsafeMode({ from: accounts[0] });

      try {
        await sr.setMinimumStakeTime(100, { from: accounts[0] });
        assert.fail('Expected to throw an error');
      }
      catch (e) {
        assert.match(e.message, /Reason given: This action cannot be performed while the contract is in Failsafe Mode/ig);
      }
    });

    it('should allow owner to recover staking tokens that were not staked, even when disabled', async () => {
      const hell = await HellToken.deployed();

      assert.isFalse(await sr.failsafeModeActive(), 'Failsafe Mode should be disabled');

      // stake 200
      await hell.increaseAllowance(sr.address, '200', { from: accounts[0] });
      await sr.stake('200', { from: accounts[0] });

      // transfer extra 300 hell that weren't actually staked
      await hell.transfer(sr.address, '300', { from: accounts[0] });

      assert.strictEqual((await sr.balanceOf(accounts[0])).toString(), '200');
      assert.strictEqual((await sr.totalSupply()).toString(), '200');
      assert.strictEqual((await hell.balanceOf(sr.address)).toString(), '500');

      await sr.recoverExtraStakingTokensToOwner({ from: accounts[0] });

      assert.strictEqual((await sr.balanceOf(accounts[0])).toString(), '200');
      assert.strictEqual((await sr.totalSupply()).toString(), '200');
      assert.strictEqual((await hell.balanceOf(sr.address)).toString(), '200');
    });
  });
});

