const Gos = artifacts.require('Gos');

module.exports = async function (_deployer) {
    await _deployer.deploy(Gos);
};