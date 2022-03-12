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
    var coinFlipContractAddress ="0x44B65723611Df474a07bDf134c1BaB45C34202E4";  
    var tokenContractAddress ="0x0A32B269c29f730fe5f08CDc10fFBB585A85eBac";   
    var abi=CoinFlipPrediction.abi;
    var tokenContractAbi=Mgtoken.abi;
    contract = new _web3.eth.Contract(abi, coinFlipContractAddress);
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