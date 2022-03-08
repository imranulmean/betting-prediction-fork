const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const Web3=require('web3')  
const CoinFlipPrediction = require( './build/contracts/CoinFlipPrediction.json');
const Mgtoken = require( './build/contracts/CoinFlipPrediction.json');
const HDWalletProvider = require('@truffle/hdwallet-provider');
var _account;
var contract;
const app= express();

const events=[];

app.use(cors());
app.use(bodyParser.json());

if (typeof web3 !== 'undefined') {
    var web3 = new Web3(web3.currentProvider); 
} else {
    const provider = new HDWalletProvider("0xde946e372541d6146f44459847bc85f405973bd072ac4a32a0df1d6950f6ee02", 'http://127.0.0.1:9545'); 
    const _web3 = new Web3(provider);
     _account = _web3.eth.accounts.privateKeyToAccount('0x'+'de946e372541d6146f44459847bc85f405973bd072ac4a32a0df1d6950f6ee02');    
    var contractAddress ="0x83A50423EB05c8046d003821f39CaB2d18f3145c";  
    var tokenContractAddress ="0x754629c3ab7270748EcdD504F3325BFC8b1059C9";   
    var abi=CoinFlipPrediction.abi;
    var tokenContractAbi=Mgtoken.abi;
    contract = new _web3.eth.Contract(abi, contractAddress);
    tokenContract = new _web3.eth.Contract(tokenContractAbi, tokenContractAddress);
    
    // var genesisStart=contract.methods.genesisStartRound().send({from:_account.address}).then(response=>{
    //     console.log(response);
    // });
}

require('./routes')(express,app,_account,contract,tokenContract);
var port = process.env.PORT || 5000;
app.listen(port);
console.log(`Server Listening on PORT ${port}`);
console.log("Hello");