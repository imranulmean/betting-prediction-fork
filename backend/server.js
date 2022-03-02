const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const Web3=require('web3')  
const PancakePredictionV2 = require( './build/contracts/PancakePredictionV2.json');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const app= express();

const events=[];

app.use(cors());
app.use(bodyParser.json());

if (typeof web3 !== 'undefined') {
    var web3 = new Web3(web3.currentProvider); 
} else {
    const provider = new HDWalletProvider("0xde946e372541d6146f44459847bc85f405973bd072ac4a32a0df1d6950f6ee02", 'https://data-seed-prebsc-1-s1.binance.org:8545'); 
    const _web3 = new Web3(provider);
    let _account = _web3.eth.accounts.privateKeyToAccount('0x'+'de946e372541d6146f44459847bc85f405973bd072ac4a32a0df1d6950f6ee02');    
    console.log(_account);  
    var address ="0x77fF14Da03E61639B7FFeA9571acd920F793f4B6";   
    var abi=PancakePredictionV2.abi;
    var contract = new _web3.eth.Contract(abi, address);
    var genesisStart=contract.methods.genesisStartRound().send({from:_account.address}).then(response=>{
        console.log(response);
    });
}

//require('./routes')(express,app);
var port = process.env.PORT || 5000;
app.listen(port);
console.log(`Server Listening on PORT ${port}`);
console.log("Hello");