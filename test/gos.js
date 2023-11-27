const Gos = artifacts.require('Gos');

const {
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

    it('should be 200K tokens in total supply', async function () {
        let totalTokens = await gos.totalSupply();
        let deployerBalance = await gos.balanceOf(deployer);
        let holderBalance = await gos.balanceOf(holder);

        assert.equal(totalTokens, totalSupply, 'total supply should be 200K tokens');
        assert.equal(deployerBalance, totalSupply, 'deployer should have 200K tokens');
        assert.equal(holderBalance, 0, 'holder should have 0 tokens');
    });

    it('should top up balance (burn) tokens for holder', async function () {
        await gos.transfer(holder, amount);

        let totalTokens = await gos.totalSupply();

        assert.equal(totalTokens, totalSupply, 'total supply should be 200K tokens');

        let tx = await gos.topUpGame(amount - 1_000, {from: holder});
        let checkTime = (await time.latest()).toNumber();

        await expectEvent(tx, 'TopUpGameBalance', {
            user: holder,
            amount: web3.utils.toBN(amount - 1_000),
            time: web3.utils.toBN(checkTime),
        });

        totalTokens = await gos.totalSupply();
        let deployerBalance = await gos.balanceOf(deployer);
        let holderBalance = await gos.balanceOf(holder);

        assert.equal(totalTokens, totalSupply - 9_000, 'total supply should be 200K minus 9K tokens');
        assert.equal(deployerBalance, totalSupply - amount, 'deployer should have 200K tokens');
        assert.equal(holderBalance, amount - 9_000, 'holder should have 1K tokens');
    });

    it('should withdraw balance (mint) tokens for holder', async function () {
        let tx = await gos.withdrawGame(holder, amount);
        let checkTime = (await time.latest()).toNumber();

        let totalTokens = await gos.totalSupply();
        let deployerBalance = await gos.balanceOf(deployer);
        let holderBalance = await gos.balanceOf(holder);

        await expectEvent(tx, 'WithdrawGameBalance', {
            user: holder,
            amount: web3.utils.toBN(amount),
            time: web3.utils.toBN(checkTime),
        });

        assert.equal(totalTokens, totalSupply + amount, 'total supply should be 200K plus 10K tokens');
        assert.equal(deployerBalance, totalSupply, 'deployer should have 200K tokens');
        assert.equal(holderBalance, amount, 'holder should have 10K tokens');
    });

    it('should withdraw dapp fee (mint) tokens for address (deployer)', async function () {
        let tx = await gos.dappFee(deployer, amount);
        let checkTime = (await time.latest()).toNumber();

        await expectEvent(tx, 'DappFee', {
            to: deployer,
            amount: web3.utils.toBN(amount),
            time: web3.utils.toBN(checkTime),
        });

        let totalTokens = await gos.totalSupply();
        let deployerBalance = await gos.balanceOf(deployer);
        let holderBalance = await gos.balanceOf(holder);

        assert.equal(totalTokens, totalSupply + amount, 'total supply should be 200K plus 10K tokens');
        assert.equal(deployerBalance, totalSupply + amount, 'deployer should have 200K plus 10K tokens');
        assert.equal(holderBalance, 0, 'holder should have 0 tokens');
    });

    it('revert withdraw tokens (mint) tokens if not owner', async function () {
        let totalTokens = await gos.totalSupply();

        await expectRevert(
            gos.withdrawGame(holder, amount, {from: holder}),
            'Ownable: caller is not the owner');

        let totalTokensAfterRevert = await gos.totalSupply();

        assert.equal(totalTokens.toNumber(),
            totalTokensAfterRevert.toNumber(),
            'total supply should be 200K tokens');
    });

    it('revert dapp fee (mint) tokens if not owner', async function () {
        let totalTokens = await gos.totalSupply();

        await expectRevert(
            gos.dappFee(deployer, amount, {from: holder}),
            'Ownable: caller is not the owner');

        let totalTokensAfterRevert = await gos.totalSupply();

        assert.equal(totalTokens.toNumber(),
            totalTokensAfterRevert.toNumber(),
            'total supply should be 200K tokens');
    });

    it('transfer is not ownable', async function () {
        let totalTokens = await gos.totalSupply();

        let tx = await gos.transfer(holder, amount);

        await expectEvent(tx, 'Transfer', {
            from: deployer,
            to: holder,
            value: web3.utils.toBN(amount),
        });

        let txFromHolder = await gos.transfer(deployer, amount, {from: holder});

        await expectEvent(txFromHolder, 'Transfer', {
            from: holder,
            to: deployer,
            value: web3.utils.toBN(amount),
        });

        let totalTokensAfterTxs = await gos.totalSupply();

        assert.equal(totalTokens.toNumber(),
            totalTokensAfterTxs.toNumber(),
            'total supply should be 200K tokens');
    });

});
