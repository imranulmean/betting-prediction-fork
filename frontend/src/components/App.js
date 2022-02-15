import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import Web3 from 'web3'
import PancakePredictionV2 from './abi.json'
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
     if(this.state.runningRound.closeTimestamp!=0 && this.state.runningRound.closeTimestamp < Date.now()/1000){
         //this.executeRound("send");           
     }    
      
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
    const address="0xD7Fe20b1a27fBb3f3E7cB968B10dF1649cdD5bd9";
    const abi=PancakePredictionV2.abi;
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
      allRounds:[]
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
     var genesisStartRound=await this.state.contractData.methods.genesisStartRound().send
     ({from: this.state.account.accounts[0],value:0}).then((reponse)=>{
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
      console.log("Executing Now");
  
           if(calling==='send'){
            var executeRoundCall= await this.state.contractData.methods.executeRound().call({ from: this.state.account.accounts[0]}).then((reponse)=>{
              console.log(reponse);
              clearInterval(this.timer);   
////////////////////
                var executeRound= this.state.contractData.methods.executeRound().send({ from: this.state.account.accounts[0]}).then((reponse)=>{
                  console.log(reponse);
                  this.setState({
                    runningRound:{}
                  });
                  this.loadEpoch();           
                  this.startTimer();             
                });
///////////////////////                   
            }).catch((err)=>{
              console.log(err.message);
            });
        }
} 



async betBull(param){
  
    var betBull= await this.state.contractData.methods.betBull(param).send({ from: this.state.account.accounts[0],value: window.web3.utils.toWei('0.1', 'ether')}).then((reponse)=>{
      console.log(reponse);
    }).catch((err)=>{
      console.log(err.message);
    }); 
}
async betBear(param){
    var betBear= await this.state.contractData.methods.betBear(param).send({ from: this.state.account.accounts[0],value: window.web3.utils.toWei('0.1', 'ether')}).then((reponse)=>{
      console.log(reponse);
    }).catch((err)=>{
      console.log(err.message);
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
    }); 
}


async _getUserRoundsShow(_view){
    var _getUserRoundsLength=await this.state.contractData.methods.getUserRoundsLength(this.state.account.accounts[0]).call();
    console.log('_getUserRoundsLength: '+_getUserRoundsLength);
      
    var cursorVal=document.getElementById("cursor").value;
    var _getUserRounds=await this.state.contractData.methods.getUserRounds(this.state.account.accounts[0],cursorVal,_getUserRoundsLength).call();
    console.log(_getUserRounds['0']);
    for(var i=0;i<_getUserRounds['0'].length;i++){
      for(var j=0;j<this.state.allRounds.length;j++){
          if(_getUserRounds['0'][i]===this.state.allRounds[j]['epoch']){           
            this.state.allRounds[j].betted="Yes";
            break;
          }
      }
    }
    this.setState({
      allRounds:this.state.allRounds
    });
    //   //////////////////Claim Function////////////////////
    //   console.log('Claim Function Called');
    // var _roundIdInput=document.getElementById("roundIdInput").value;      
    //   if(_view){
    //     var _claim= await this.state.contractData.methods.claim([_roundIdInput]).call({ from: this.state.account.accounts[0]}).then((reponse)=>{
    //       console.log(reponse);
    //     }).catch((err)=>{
    //       console.log(err.message);
    //     });        
    //   } 
    //   else{
    //     var _claim= await this.state.contractData.methods.claim([_roundIdInput]).send({ from: this.state.account.accounts[0]}).then((reponse)=>{
    //       console.log(reponse);
    //     }).catch((err)=>{
    //       console.log(err.message);
    //     });        
    //   }      
}

async loadAllRoundData(){
  console.log(this.state.bettable-2);
  var _allRounds=[];
  for(var i=0;i<this.state.bettable-2;i++)
  {
    const r=await this.state.contractData.methods.rounds(i+1).call({ from: this.state.account.accounts[0]}).then((reponse)=>{
     // console.log(reponse);
      _allRounds.push(reponse);     
     
    }).catch((err)=>{
      console.log(err.message);
    });
  }
  this.setState({
    allRounds:_allRounds
  });

  console.log(this.state.allRounds) 
       
}

////
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
            <button onClick={() => this.loadAllRoundData()}>Load All Round Data</button>
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

            { 
              this.state.allRounds.map(round=>
                <p>Round ID: {round.epoch}.. Locked Price:${round.lockPrice/100000000}.. Closed Price:${round.closePrice/100000000}.. <b>Betted:{round.betted}</b></p>
              )
            }

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

