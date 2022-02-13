import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import Web3 from 'web3'
//import Main from './Main'
import './App.css';
import NftCards from './nft-cards'

class App extends Component {

    axiosFunc(){
          axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT").then((response) =>{           
              this.setState({
                bnpPrice:response.data.price
              });
             
          });    
  }
  async componentDidMount() {
    let metaData;
    await this.loadWeb3();
    await this.loadBlockchainData();
     this.startTimer();
     this.loadEpoch();
  }

  startTimer() {
    this.state.seconds=300;
  //  if (this.timer == 0 && this.state.seconds > 0) {
      this.timer = setInterval(this.countDown, 1000);
   // }
  }

  countDown() {
    // Remove one second, set state so a re-render happens.
    let seconds = this.state.seconds - 1;
    this.setState({
      time: this.secondsToTime(seconds),
      seconds: seconds,
    });
    
    // Check if we're at zero.
    if (seconds == 0) { 
      clearInterval(this.timer);
    }
     // console.log(this.state.time);
      this.axiosFunc();     
      //this.executeRound("send");     
 } 

 secondsToTime(secs){
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    let obj = {
      "h": hours,
      "m": minutes,
      "s": seconds
    };
    return obj;
} 

  async loadWeb3() {
       if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        await window.ethereum.enable()
      }
      else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
      }
      else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }    
   
  }
  async loadBlockchainData() {

    const web3 = window.web3;
    const address="0x0bb62D742581c35810BB1a931E625dE130AF98eE";
    const abi=[
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_oracleAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_adminAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_operatorAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_intervalSeconds",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_bufferSeconds",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_minBetAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_oracleUpdateAllowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_treasuryFee",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "BetBear",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "BetBull",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Claim",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "roundId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "int256",
          "name": "price",
          "type": "int256"
        }
      ],
      "name": "EndRound",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "roundId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "int256",
          "name": "price",
          "type": "int256"
        }
      ],
      "name": "LockRound",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "admin",
          "type": "address"
        }
      ],
      "name": "NewAdminAddress",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "bufferSeconds",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "intervalSeconds",
          "type": "uint256"
        }
      ],
      "name": "NewBufferAndIntervalSeconds",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "minBetAmount",
          "type": "uint256"
        }
      ],
      "name": "NewMinBetAmount",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "NewOperatorAddress",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oracle",
          "type": "address"
        }
      ],
      "name": "NewOracle",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oracleUpdateAllowance",
          "type": "uint256"
        }
      ],
      "name": "NewOracleUpdateAllowance",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "treasuryFee",
          "type": "uint256"
        }
      ],
      "name": "NewTreasuryFee",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        }
      ],
      "name": "Pause",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "rewardBaseCalAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "rewardAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "treasuryAmount",
          "type": "uint256"
        }
      ],
      "name": "RewardsCalculated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        }
      ],
      "name": "StartRound",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokenRecovery",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TreasuryClaim",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        }
      ],
      "name": "Unpause",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MAX_TREASURY_FEE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "adminAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "bufferSeconds",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "currentEpoch",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "genesisLockOnce",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "genesisStartOnce",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "intervalSeconds",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "ledger",
      "outputs": [
        {
          "internalType": "enum PancakePredictionV2.Position",
          "name": "position",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "claimed",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "minBetAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "operatorAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "oracle",
      "outputs": [
        {
          "internalType": "contract AggregatorV3Interface",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "oracleLatestRoundId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "oracleUpdateAllowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "rounds",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "startTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "lockTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "closeTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "int256",
          "name": "lockPrice",
          "type": "int256"
        },
        {
          "internalType": "int256",
          "name": "closePrice",
          "type": "int256"
        },
        {
          "internalType": "uint256",
          "name": "lockOracleId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "closeOracleId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "bullAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "bearAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "rewardBaseCalAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "rewardAmount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "oracleCalled",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "treasuryAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "treasuryFee",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userRounds",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        }
      ],
      "name": "betBear",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        }
      ],
      "name": "betBull",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "epochs",
          "type": "uint256[]"
        }
      ],
      "name": "claim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "executeRound",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "genesisLockRound",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "genesisStartRound",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimTreasury",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_bufferSeconds",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_intervalSeconds",
          "type": "uint256"
        }
      ],
      "name": "setBufferAndIntervalSeconds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_minBetAmount",
          "type": "uint256"
        }
      ],
      "name": "setMinBetAmount",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_operatorAddress",
          "type": "address"
        }
      ],
      "name": "setOperator",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_oracle",
          "type": "address"
        }
      ],
      "name": "setOracle",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_oracleUpdateAllowance",
          "type": "uint256"
        }
      ],
      "name": "setOracleUpdateAllowance",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_treasuryFee",
          "type": "uint256"
        }
      ],
      "name": "setTreasuryFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "recoverToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_adminAddress",
          "type": "address"
        }
      ],
      "name": "setAdmin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "cursor",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "size",
          "type": "uint256"
        }
      ],
      "name": "getUserRounds",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        },
        {
          "components": [
            {
              "internalType": "enum PancakePredictionV2.Position",
              "name": "position",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "claimed",
              "type": "bool"
            }
          ],
          "internalType": "struct PancakePredictionV2.BetInfo[]",
          "name": "",
          "type": "tuple[]"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserRoundsLength",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "claimable",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "refundable",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "_getPriceFromOracleView",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ];
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(abi, address);
    console.log(contract);
    console.log(accounts[0]);
    this.setState({
      account:{
        accounts:accounts
      },
      contractData:contract
    });     
  
}  

  constructor(props) {
    super(props)
    this.state = {
      account: {},
      metaData:[],
      contractData:{},
      bettable:0,
      nextBettable:0,
      bnpPrice:0,
      roundData:{}, time: {}, seconds: 300,
      roundDataViewOnly:{},
      runningRound:{},
    }
    // this.state = { time: {}, seconds: 300 };
    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);  
   
  }

testrender(){
   return (<div> m: {this.state.time.m} s: {this.state.time.s} 
              <br></br>
              <b>BNB Price:${this.state.bnpPrice}</b>
              <br></br>
          </div>);
}
 /////////
async genesisStart(){
  console.log("Genesis Start Called");
 
     var genesisStartRound=await this.state.contractData.methods.genesisStartRound().send({ from: this.state.account.accounts[0]}).then((reponse)=>{
       console.log(reponse);
      clearInterval(this.timer);
      this.startTimer();        
     }).catch((err)=>{
       console.log(err.message);
     var errorMessageInJson =JSON.parse(err.message.slice(58, err.message.length - 2));
     var errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;
     console.log(errorMessageToShow);
     });    
}  

async genesisLock(param){
  console.log("Genesis Lock Called");
      await this.loadRoundData(param);
      console.log("Current Time:"+ Date.now()/1000);
      console.log("lockTimestamp:" + this.state.roundData.lockTimestamp);
        if(this.state.roundData.lockTimestamp < Date.now()/1000){  
          var genesisLockRound= await this.state.contractData.methods.genesisLockRound().send({ from: this.state.account.accounts[0]}).then((reponse)=>{
            console.log(reponse);
            clearInterval(this.timer);
            this.startTimer();
            this.loadEpoch();             
          }).catch((err)=>{
            console.log(err.message);
            // var errorMessageInJson =JSON.parse(err.message.slice(58, err.message.length - 2));
            // var errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;
            // console.log(errorMessageToShow);
          });   
        } 

        else{
          console.log("Wait for Lock");
        }
}  

async executeRound(calling){

  console.log("Execute Round Called");

      //await this.loadRoundData(param);
      console.log("Current Time:"+ Date.now()/1000);
      console.log("closeTimestamp:"+ this.state.runningRound.closeTimestamp);   

      
        if(this.state.runningRound.closeTimestamp < Date.now()/1000){   
             console.log("Executing Now");
             clearInterval(this.timer);
            if(calling==='send'){     
            var executeRound= await this.state.contractData.methods.executeRound().send({ from: this.state.account.accounts[0]}).then((reponse)=>{
              console.log(reponse);
              this.setState({
                runningRound:{}
              });
              this.loadEpoch();              
              this.startTimer();             
            }).catch((err)=>{
              console.log(err.message);
              // var errorMessageInJson =JSON.parse(err.message.slice(58, err.message.length - 2));
              // var errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;
              // console.log(errorMessageToShow);
            });
          }

          else if(calling==='call'){
            var executeRound= await this.state.contractData.methods.executeRound().call({ from: this.state.account.accounts[0]});
            console.log(executeRound);
          }
        }
        else{
          console.log("Wait for exection");
        }   

} 



async betBull(param){
  
    var betBull= await this.state.contractData.methods.betBull(param).send({ from: this.state.account.accounts[0],value: window.web3.utils.toWei('0.1', 'ether')}).then((reponse)=>{
      console.log(reponse);
    }).catch((err)=>{
      console.log(err.message);
      // var errorMessageInJson =JSON.parse(err.message.slice(58, err.message.length - 2));
      // var errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;
      // console.log(errorMessageToShow);
    }); 
}
async betBear(param){
    var betBear= await this.state.contractData.methods.betBear(param).send({ from: this.state.account.accounts[0],value: window.web3.utils.toWei('0.1', 'ether')}).then((reponse)=>{
      console.log(reponse);
    }).catch((err)=>{
      console.log(err.message);
      // var errorMessageInJson =JSON.parse(err.message.slice(58, err.message.length - 2));
      // var errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;
      // console.log(errorMessageToShow);
    }); 
}

async loadRoundData(param,rmt){
  console.log(param);
    const rounds=await this.state.contractData.methods.rounds(param).call({ from: this.state.account.accounts[0]}).then((reponse)=>{
      //console.log(reponse);
      if(reponse.lockTimestamp < Date.now()/1000){
        this.setState({
          runningRound:reponse
        });   
      }
      else{
          this.setState({
            roundData:reponse
          });        
        }
      if(rmt){
        console.log("roundData.lockTimestamp:" + this.state.roundData.lockTimestamp);
        console.log("Current Time :" + Date.now()/1000);
        
        var remainingTime=this.state.roundData.lockTimestamp - (Date.now()/1000);
        console.log("remainingTime:" + remainingTime);

        this.setState({
          seconds:remainingTime
        });        
      }
      console.log(this.state.roundData);
    }).catch((err)=>{
      console.log(err.message);
      // var errorMessageInJson =JSON.parse(err.message.slice(58, err.message.length - 2));
      // var errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;
      // console.log(errorMessageToShow);
    }); 
}

async loadRoundDataViewOnly(param){
  console.log(param);
    const rounds=await this.state.contractData.methods.rounds(param).call({ from: this.state.account.accounts[0]}).then((reponse)=>{
      //console.log(reponse);
      this.setState({
        roundDataViewOnly:reponse
      });       
      console.log(this.state.roundDataViewOnly);
    }).catch((err)=>{
      console.log(err.message);
      // var errorMessageInJson =JSON.parse(err.message.slice(58, err.message.length - 2));
      // var errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;
      // console.log(errorMessageToShow);
    }); 
}

async loadRunningRoundData(){
  this.loadRoundData(this.state.bettable-1);
}

async loadContract(){
  console.log(this.state.contractData);
  this.loadEpoch();  
}

async loadEpoch(){
  var bettable= parseInt(await this.state.contractData.methods.currentEpoch().call());
  this.setState({
    bettable:bettable
  })  

   console.log(bettable); 
   await this.loadRoundData(bettable,'rmt');
   if(this.state.bettable-1 > 0 ) {
    await this.loadRunningRoundData();    
   }
   
   
}

async oracleView(){
  var mainOracleId= await this.state.contractData.methods._getPriceFromOracleView().call();
  var contractOracleLatestRoundId=await this.state.contractData.methods.oracleLatestRoundId().call();
  console.log("Main Oracle ID:"+ mainOracleId);
  console.log("Contract Oracle ID:"+ contractOracleLatestRoundId);
  if(mainOracleId < contractOracleLatestRoundId){
    console.log("Main Oracle ID < contract Oracle Latest RoundId")
  }
  else{
   console.log("Main Oracle ID > contract OracleLatest RoundId") 
  }
  
}

async show(){
  console.log(document.getElementById("myText").value);
  var textVal=document.getElementById("myText").value;
  var ledgerData=await this.state.contractData.methods.ledger(textVal,this.state.account.accounts[0]).call();
  console.log(ledgerData);
}

async showRoundData(){
  var textVal=document.getElementById("roundId").value;
  this.loadRoundDataViewOnly(textVal);
}

async pause(){
    var pauseRound= await this.state.contractData.methods.pause().send({ from: this.state.account.accounts[0]}).then((reponse)=>{
      console.log(reponse);
    }).catch((err)=>{
      console.log(err.message);
      // var errorMessageInJson =JSON.parse(err.message.slice(58, err.message.length - 2));
      // var errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;
      // console.log(errorMessageToShow);
    }); 
}


async unpause(){
    var pauseRound= await this.state.contractData.methods.unpause().send({ from: this.state.account.accounts[0]}).then((reponse)=>{
      console.log(reponse);
    }).catch((err)=>{
      console.log(err.message);
      // var errorMessageInJson =JSON.parse(err.message.slice(58, err.message.length - 2));
      // var errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;
      // console.log(errorMessageToShow);
    }); 
}


async _getUserRoundsShow(_view){
    var _getUserRoundsLength=await this.state.contractData.methods.getUserRoundsLength(this.state.account.accounts[0]).call();
    console.log('_getUserRoundsLength: '+_getUserRoundsLength);
      
    var cursorVal=document.getElementById("cursor").value;
    var _getUserRounds=await this.state.contractData.methods.getUserRounds(this.state.account.accounts[0],cursorVal,_getUserRoundsLength).call();
    console.log(_getUserRounds);

      //////////////////Claim Function////////////////////
      console.log('Claim Function Called');
    var _roundIdInput=document.getElementById("roundIdInput").value;      
      if(_view){
        var _claim= await this.state.contractData.methods.claim([_roundIdInput]).call({ from: this.state.account.accounts[0]}).then((reponse)=>{
          console.log(reponse);
        }).catch((err)=>{
          console.log(err.message);
        });        
      } 
      else{
        var _claim= await this.state.contractData.methods.claim([_roundIdInput]).send({ from: this.state.account.accounts[0]}).then((reponse)=>{
          console.log(reponse);
        }).catch((err)=>{
          console.log(err.message);
        });        
      }      


}



  render() {

    return (
            <>              
     
            <p>Hola</p>
            {this.testrender()} 
            <p>Running (Not Bettable):{this.state.bettable-1}, Locked Price:${this.state.runningRound.lockPrice/100000000}, Closed Price:${this.state.runningRound.closePrice/100000000}</p>
            <p>Bettable (Now):{this.state.bettable}</p>
            <p>Next Bettable (Not now) :{this.state.bettable+1}</p>
            <button onClick={() => this.genesisStart()}>Genesis Start</button>
            <button onClick={() => this.genesisLock(this.state.bettable)}>Genesis Lock</button>
            <button onClick={() => this.executeRound('send')}>Execute Round Running</button>
            <button onClick={() => this.executeRound('call')}>Execute Round Running (View Only)</button>           
            <button onClick={() => this.betBull(this.state.bettable)}>Bet Bull ({this.state.bettable})</button>
            <button onClick={() => this.betBear(this.state.bettable)}>Bet Bear ({this.state.bettable})</button>
            <button onClick={() => this.loadContract()}>Load Contract</button>
            <button onClick={() => this.loadEpoch()}>Load Epoch</button>
            <button onClick={() => this.oracleView()}>Oracle View Current Round ID</button>
            <button onClick={() => this.pause()}>Pause</button> 
            <button onClick={() => this.unpause()}>UnPause</button>                     
            <p>------------------------------</p>

            <p>Load Bettable/Running/Future Round Data: 
             <input type="number" id="roundId"/>
             <button onClick={() => this.showRoundData()}>Load Round </button>
            </p> 
            <p>Load Ledger Data for Specific Round: 
             <input type="number" id="myText"/>
             <button onClick={() => this.show()}>Show </button>
            </p>
            <p>Input Cursor: 
              <input type="number" id="cursor"/>
              Input Round:
               <input type="number" id="roundIdInput"/>
              <button onClick={() => this._getUserRoundsShow('view')}>View Error </button>
              <button onClick={() => this._getUserRoundsShow()}>_getUserRoundsShow </button>
            </p>

            </>  

    );
  }
}

export default App;

 //{this.testrender()} 
  // <button onClick={() => this.loadRoundData(this.state.bettable)}>Load Bettable Round Data ({this.state.bettable})</button>
  // <button onClick={() => this.loadRoundData(this.state.bettable+1)}>Load Not Bettable Round Data ({this.state.bettable+1})</button>
  // <button onClick={() => this.loadRoundData(this.state.bettable-1)}>Load Running ({this.state.bettable-1})</button>


 //            
 //            
 //            
 //            
 //            
 //            
 //            
 //            

