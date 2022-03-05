
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v2;

/**
 * @title CoinFlipPrediction
 */
contract CoinFlipPrediction {
    address public player1;
    bytes32 public player1Commitment;

    uint256 public betAmount;

    address public player2;
    bool public player2Choice;
    uint256 player2Betamount;

    uint256 public expiration = 2**256-1;

    event BetPlaced(address indexed sender, bool, uint256 amount);
    event GameMessage(string mesg);

    function CoinFlip(bytes32 commitment) public  {
        player1 = msg.sender;
        player1Commitment = commitment;
    }

    function cancel() public {
        require(msg.sender == player1);
        //require(player2 == null);

        betAmount = 0;
        //msg.sender.transfer(address(this).balance);
    }

    function takeBet(bool choice) external payable {
        //require(player2 == 0);
        // require(msg.value >= minBetAmount, "Bet amount must be greater than minBetAmount");
        player2 = msg.sender;
        player2Choice = choice;
        player2Betamount= msg.value;
        expiration = block.timestamp + 24 hours;
        emit BetPlaced(msg.sender, choice, msg.value);
    }

    function reveal(bool choice, uint256 nonce) external {
       // require(player2 != 0);
        //require(block.timestamp < expiration);
      require(keccak256(abi.encodePacked(choice, nonce))== player1Commitment);        
        
        if (player2Choice == choice) {
            payable(player2).transfer(address(this).balance);
            emit GameMessage("You win. check your wallet");
        } else {
            emit GameMessage("You lost. try again");
        }
    }


    function result007() external view returns (uint256){
        // require(player2 != 0);
        //require(block.timestamp < expiration);
       
        return 1;
        // require(keccak256(abi.encodePacked(choice, nonce))== player1Commitment);        
        
        // if (player2Choice == choice) {
        //     //payable(player2).transfer(address(this).balance);
        //     return "player 2 Wins";
            
        // } else {
        //     //payable(player1).transfer(address(this).balance);
        //     return "player 1 Wins";
        // }
    }

    function claimTimeout() public {
        require(block.timestamp >= expiration);
        payable(player2).transfer(address(this).balance);
    }
}