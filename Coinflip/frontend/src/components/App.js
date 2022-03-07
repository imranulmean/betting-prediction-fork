import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import Web3 from 'web3'
import CoinFlipPrediction from './abi.json'
//import Main from './Main'
import './App.css';
import NftCards from './nft-cards'

class App extends Component {

  async componentDidMount() {
    let metaData;
    await this.loadWeb3();
    await this.loadBlockchainData();
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
    const address ="0xb4FBeb41bFF3355DA19fB64985c3b26e09bD720e";
    //Token Contract Address
     //const address ="0x4B8fCc859Ce34374e5202BC6F0aCA077bf9cDCAe";
     //const abi=CoinFlipPrediction.abi;
    const abi= [
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
        "indexed": false,
        "internalType": "bool",
        "name": "",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "cancel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimTimeout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "commitment",
        "type": "bytes32"
      }
    ],
    "name": "CoinFlip",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "mesg",
        "type": "string"
      }
    ],
    "name": "GameMessage",
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
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "choice",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      }
    ],
    "name": "reveal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "choice",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "_betAmount",
        "type": "uint256"
      }
    ],
    "name": "takeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "transferERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
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
    "name": "betAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "expiration",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "tokenAddress",
        "type": "address"
      }
    ],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
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
    "type": "function"
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
    "type": "function"
  },
  {
    "inputs": [],
    "name": "player1",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "player1Commitment",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "player2",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "player2Choice",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(abi, address);
    console.log(contract);
    console.log(accounts[0]);
    //console.log(await contract.methods.getBalance().call());
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
      coinToss:{}
    }
   
  }

async coinFlip(betChoice){

  var _betAmount=100;
  var tokenSc="0x67b24c4D57Ac8AD75E7D4bDba9a53CDe79034e35";  
  var _takeBet=  this.state.contractData.methods.takeBet(tokenSc,betChoice,_betAmount).call({from: this.state.account.accounts[0]}).then((reponse)=>{
          //this.reveal(betChoice);
          console.log(reponse);
    }).catch((err)=>{
    console.log(err.message);
  });   
  // axios.get("http://localhost:5000/coinflip").then((commitment) =>{   
  //   //console.log(commitment);  
  //   var _takeBet=  this.state.contractData.methods.takeBet(betChoice,amount).send({from: this.state.account.accounts[0], value: window.web3.utils.toWei('1', 'ether')}).then((reponse)=>{
  //           this.reveal(betChoice);
  //     }).catch((err)=>{
  //     console.log(err.message);
  //   });                   
  // }); 
    
}
async reveal(betChoice){

  axios.get('http://localhost:5000/revealResult').then(response=>{
    console.log(response.data.events.GameMessage.returnValues.mesg);
    alert(response.data.events.GameMessage.returnValues.mesg);
  })   
}

async result007(){

    // var _takeBet=  this.state.contractData.methods.result007().call({from:this.state.account.accounts[0]}).then(response=>{
    //   console.log(response);
    // });
    axios.get('http://localhost:5000/revealResult').then(response=>{
      console.log(response);
    })        
}

////
  render() {

    return (
            <>              
     
            <p>Try Your Luck</p>
                    
            {/* <button onClick={() => this.coinFlip()}>Coin Flip</button> */}
            <p>------------Bet Place------------------</p>
            <button onClick={() => this.coinFlip(true)}>Heads </button>
            <button onClick={() => this.coinFlip(false)}>Tails </button>
            {/* <p>-----------Reveal Result------------------</p>
            <button onClick={() => this.result007()}>Reveal Result</button> */}
            </>  

    );
  }
}

export default App;
         


// function reveal(bool choice, uint256 nonce) public view returns (string memory) {
//   // require(player2 != 0);
//    //require(block.timestamp < expiration);
//  require(keccak256(abi.encodePacked(choice, nonce))== player1Commitment);        
   
//    if (player2Choice == choice) {
//        //payable(player2).transfer(address(this).balance);
//        return "player 2 Wins";
       
//    } else {
//        //payable(player1).transfer(address(this).balance);
//        return "player 1 Wins";
//    }
// }