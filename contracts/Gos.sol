// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20.sol";
import "./Ownable.sol";

contract Gos is ERC20, Ownable {

  event TopUpBalance(address user, uint amount, uint time);
  event WithdrawBalance(address user, uint amount, uint time);
  event DappFee(address to, uint amount, uint time);

  constructor() payable ERC20('Game of Sana', 'GOS') {
    _mint(msg.sender, 200_000 * 1e2);
  }

  function decimals() public pure override returns (uint8) {
    return 2;
  }

  function topUp(address _from, uint _amount) public onlyOwner {
    _burn(_from, _amount);
    emit TopUpBalance(_from, _amount, block.timestamp);
  }

  function withdraw(address _to, uint _amount) public onlyOwner {
    _mint(_to, _amount);
    emit WithdrawBalance(_to, _amount, block.timestamp);
  }

  function dappFee(address _to, uint _amount) public onlyOwner {
    _mint(_to, _amount);
    emit DappFee(_to, _amount, block.timestamp);
  }

}
