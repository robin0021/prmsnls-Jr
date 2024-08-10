// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Ballot
 * @dev Implements voting process along with vote delegation
 */
contract pool is Ownable {
    struct round {
        uint256 id;
        uint256 total;
        uint256 timestamp;
        uint256 winning_number;
        address winner;
    }

    struct transaction {
        uint256 round;
        address user;
        uint256 stake;
    }

    uint256 ACTIVE_ROUND;

    mapping(uint256 => round) public Rounds;
    mapping(bytes32 => transaction) public Transaction;

    // event

    constructor() Ownable(msg.sender) {}

    function deposit() external payable {
        bytes32 _index = keccak256(abi.encodePacked(msg.sender, ACTIVE_ROUND));
        transaction storage txn = Transaction[_index];
        txn.round = ACTIVE_ROUND;
        txn.user = msg.sender;
        txn.stake += msg.value;
        Rounds[ACTIVE_ROUND].total++;
    }

    function createRound() public onlyOwner {
        round storage _active = Rounds[++ACTIVE_ROUND];
        _active.id = ACTIVE_ROUND;
        _active.timestamp = block.timestamp;
    }

    function closeRound(uint index, address winner) public onlyOwner {
        round storage _active = Rounds[ACTIVE_ROUND];
        _active.winning_number = index;
        _active.winner = winner;
        payable(winner).transfer(address(this).balance);
    }

    function getTxn(address user, uint _round) public view returns(transaction memory txn){
        bytes32 _index = keccak256(abi.encodePacked(user, _round));
        txn = Transaction[_index];
    }

    function getTotal() public view returns(uint){
        return Rounds[ACTIVE_ROUND].total;
    }
}
