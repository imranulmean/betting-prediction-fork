var fs = require('fs');

const abi = require('ethereumjs-abi');
const crypto = require('crypto');
const { send } = require('process');


// var async = require('async');

module.exports = function(express, app, _account, contract,tokenContract) {
    
    var hashObject={};

    app.post('/coinflip', function(req, res) {
            console.log(req.body.betChoice);
            // This could come from user input or be randomly generated.  
                 
            var secretChoice = false;
            var randomNumber;
            var coinFlipContractBalance= contract.methods.getBalance(tokenContract._address).call().then(response=>{
              console.log(response);
              //res.send(response);
              if(req.body._betAmount * 2 > response)
              {
                console.log("entering chorai mode");
                if(req.body.betChoice==true){
                  secretChoice=false;
                }
                else{
                  secretChoice=true;
                }
              }
              else{
                console.log("entering Shadhu mode");
                randomNumber = crypto.randomInt(0, 1000000);
                console.log(randomNumber);
                if(randomNumber%2==0){  
                    secretChoice=true;
                }            
              }
                const nonce = "0x" + crypto.randomBytes(32).toString('hex');
                const hash = "0x" + abi.soliditySHA3(
                ["bool", "uint256"],
                [secretChoice, nonce]).toString('hex');                 
            ////////////////Smart Contract Coin Flip Call //////////////////    
                var _coinFlip=  contract.methods.CoinFlip(hash).send({from: _account.address}).then((reponse)=>{                
                  hashObject={'hash':hash,'nonce':nonce,'secretChoice':secretChoice,'randomNumber':randomNumber};        
                  // res.send(hashObject);
                  res.send("commitment Done");
                  }).catch((err)=>{
                    console.log(err.message);
                  });                
            }) 

        });

        app.get('/revealResult', function(req, res) {
        ////////////////Smart Contract Coin Reveal Call //////////////////   
            var revealResult=  contract.methods.reveal(hashObject.secretChoice, hashObject.nonce).send({from: _account.address}).then((reponse)=>{                              
              res.send(reponse)
              }).catch((err)=>{
                console.log(err.message);
              });           

      });        
 

}