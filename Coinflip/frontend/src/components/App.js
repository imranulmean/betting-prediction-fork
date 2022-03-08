import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import Web3 from 'web3'
import CoinFlipPrediction from './abi.json'
import Mgtoken from './tokenContractAbi.json'
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
    const address ="0x83A50423EB05c8046d003821f39CaB2d18f3145c";
    const tokenContractAddres="0x754629c3ab7270748EcdD504F3325BFC8b1059C9"
    //Token Contract Address
     //const address ="0x4B8fCc859Ce34374e5202BC6F0aCA077bf9cDCAe";
     const abi=CoinFlipPrediction.abi;
     const tokenContractAbi= Mgtoken.abi;             
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(abi, address);
    const tokenContract = new web3.eth.Contract(tokenContractAbi, tokenContractAddres);
    console.log(contract);
    console.log(tokenContract);
    console.log(accounts[0]);
    //console.log(await contract.methods.getBalance().call());
    this.setState({
      account:{
        accounts:accounts
      },
      contractData:contract,
      tokenContractData:tokenContract
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

_betAmount=10;

async coinFlip(betChoice){

  axios.post("http://localhost:5000/coinflip",{betChoice:betChoice,_betAmount:this._betAmount}).then((commitment) =>{   
    console.log(commitment);  
    var _takeBet=  this.state.contractData.methods.takeBet(this.state.tokenContractData._address,betChoice,this._betAmount).send({from: this.state.account.accounts[0]}).then((reponse)=>{
            this.reveal();
      }).catch((err)=>{
      console.log(err.message);
    });                   
  }); 
    
}

async safeApproveERC20ToCoinFlip(){
  
  var _safeApproveERC20ToCoinFlip=  this.state.tokenContractData.methods.approve(this.state.contractData._address,this._betAmount).send({from: this.state.account.accounts[0]}).then((reponse)=>{
          //this.reveal(betChoice);
          console.log(reponse);
    }).catch((err)=>{
    console.log(err.message);
  });      
}

async safeIncreaseERC20Allowance(){
  
  var _safeApproveERC20ToCoinFlip=  this.state.contractData.methods.safeIncreaseERC20Allowance(this.state.tokenContractData._address,this._betAmount).send({from: this.state.account.accounts[0]}).then((reponse)=>{
          //this.reveal(betChoice);
          console.log(reponse);
    }).catch((err)=>{
    console.log(err.message);
  });      
}

async transferERC20ToCoinFlip(){
  
  var _transferERC20ToCoinFlip=  this.state.contractData.methods.transferERC20ToCoinFlip(this.state.tokenContractData._address,this._betAmount).send({from: this.state.account.accounts[0]}).then((reponse)=>{
          //this.reveal(betChoice);
          console.log(reponse);
    }).catch((err)=>{
    console.log(err.message);
  });      
}

async reveal(){

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
            
            <button onClick={() => this.safeApproveERC20ToCoinFlip()}>safeApprove ERC20To CoinFlip </button>
            {/* <button onClick={() => this.transferERC20ToCoinFlip()}>transfer ERC20 To CoinFlip </button> */}
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

// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.4;

// import "@openzeppelin/contracts@4.5.0/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts@4.5.0/token/ERC20/extensions/ERC20Burnable.sol";
// import "@openzeppelin/contracts@4.5.0/access/Ownable.sol";

// contract Mgtoken is ERC20, ERC20Burnable, Ownable {
//     constructor() ERC20("mgtoken", "mgt") {}

//     function mint(address to, uint256 amount) public onlyOwner {
//         _mint(to, amount);
//     }

//     function transferERC20(IERC20 token, address to) public onlyOwner {
        
//         uint256 erc20balance = token.balanceOf(address(this));
//         token.transfer(to, erc20balance);
        
//     }     
// }