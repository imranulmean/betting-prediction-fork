const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const Web3=require('web3')  
const CoinFlipPrediction = require( './build/contracts/CoinFlipPrediction.json');
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
    var contractAddress ="0xfa88c5fc0e8F9BCdC4ccb8F08687B8a52E9e6383";   
    var abi=CoinFlipPrediction.abi;
    contract = new _web3.eth.Contract(abi, contractAddress);
    
    // var genesisStart=contract.methods.genesisStartRound().send({from:_account.address}).then(response=>{
    //     console.log(response);
    // });
}

require('./routes')(express,app,_account,contract);
var port = process.env.PORT || 5000;
app.listen(port);
console.log(`Server Listening on PORT ${port}`);
console.log("Hello");