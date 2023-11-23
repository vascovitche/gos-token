const Gos = artifacts.require('Gos');

const {
  BN,
  constants,
  expectEvent,
  expectRevert,
  time
} = require('@openzeppelin/test-helpers');

const amount = 10_000;
const totalSupply = 20_000_000;
let holder;
let deployer;

contract('Gos', function (accounts) {

  beforeEach(async function () {
    gos = await Gos.new();
    deployer = accounts[0];
    holder = accounts[1];
  });

  it ('should be 200K tokens in total supply', async function () {
    let totalTokens = await gos.totalSupply();
    let deployerBalance = await gos.balanceOf(deployer);
    let holderBalance = await gos.balanceOf(holder);

    assert.equal(totalTokens, totalSupply, 'total supply should be 200K tokens');
    assert.equal(deployerBalance, totalSupply, 'deployer should have 200K tokens');
    assert.equal(holderBalance, 0, 'holder should have 0 tokens');
  });

  it ('should withdraw balance (mint) tokens for holder', async function () {
    let tx = await gos.withdraw(holder, amount);
    let checkTime = (await time.latest()).toNumber();

    let totalTokens = await gos.totalSupply();
    let deployerBalance = await gos.balanceOf(deployer);
    let holderBalance = await gos.balanceOf(holder);

    await expectEvent(tx, 'WithdrawBalance', {
      user: holder,
      amount: web3.utils.toBN(amount),
      time: web3.utils.toBN(checkTime),
    });

    assert.equal(totalTokens, totalSupply + amount, 'total supply should be 200K plus 10K tokens');
    assert.equal(deployerBalance, totalSupply, 'deployer should have 200K tokens');
    assert.equal(holderBalance, amount, 'holder should have 10K tokens');
  });

  it ('should top up balance (burn) tokens for holder', async function () {
    await gos.withdraw(holder, amount);

    let totalTokens = await gos.totalSupply();

    assert.equal(totalTokens, totalSupply + amount, 'total supply should be 200K plus 10K tokens');

    let tx = await gos.topUp(holder, amount - 1_000);
    let checkTime = (await time.latest()).toNumber();

    await expectEvent(tx, 'TopUpBalance', {
      user: holder,
      amount: web3.utils.toBN(amount),
      time: web3.utils.toBN(checkTime),
    });

    totalTokens = await gos.totalSupply();
    let deployerBalance = await gos.balanceOf(deployer);
    let holderBalance = await gos.balanceOf(holder);

    assert.equal(totalTokens, totalSupply + 1_000, 'total supply should be 200K plus 10K minus 9K tokens');
    assert.equal(deployerBalance, totalSupply, 'deployer should have 200K tokens');
    assert.equal(holderBalance, amount - 9_000, 'holder should have 1K tokens');
  });

  it ('should fee (mint) tokens for address (deployer)', async function () {
    await gos.dappFee(deployer, amount);

    let totalTokens = await gos.totalSupply();
    let deployerBalance = await gos.balanceOf(deployer);
    let holderBalance = await gos.balanceOf(holder);

    assert.equal(totalTokens, totalSupply + amount, 'total supply should be 200K plus 10K tokens');
    assert.equal(deployerBalance, totalSupply + amount, 'deployer should have 200K plus 10K tokens');
    assert.equal(holderBalance, 0, 'holder should have 0 tokens');
  });

  // it('staking should be successfully', async function () {
  //   await sweet.approve(deployer, amount);
  //   await sweet.transferFrom(deployer, holder, amount);
  //   let tx = await sweet.staking(amount, hero1, {from: holder});
  //   let checkTime = (await time.latest()).toNumber();
  //
  //   let holderBalance = await sweet.balanceOf(holder);
  //   let deployerBalance = await sweet.balanceOf(deployer);
  //
  //   let hero1Votes = (await sweet.heroes.call(hero1)).toNumber();
  //
  //   assert.equal(holderBalance, 0, 'holder should have 0 tokens');
  //   assert.equal(deployerBalance, 1e27 - amount, 'deployer should have 1e27 - 300 tokens');
  //   assert.equal(hero1Votes, startVotesCount + amount, 'hero1 should have + 300 votes');
  //
  //   await expectEvent(tx, 'Staking', {
  //     user: holder,
  //     amount: web3.utils.toBN(amount),
  //     hero: hero1,
  //     startAt: web3.utils.toBN(checkTime),
  //   });
  // });

});
