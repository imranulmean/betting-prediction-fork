import React, { Component } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, CardColumns } from "react-bootstrap";
import { Button } from 'react-bootstrap';
import axios from 'axios';
class NftCards extends Component {


 async handleClick(contractData,tokenID,accountId) {

   //console.log('account ID:', this.state.account.accountId);
    // console.log(this.state.contractData); 
  
    var respond=await contractData.methods.safeMint(accountId,tokenID).send({ from: accountId,value: window.web3.utils.toWei('0.03', 'ether') }).then((reponse)=>{
      
        console.log(reponse.transactionHash);
        alert(`Minted Succesfully. Hash ${reponse.transactionHash}`);
        axios.post(`https://tranquil-plains-03610.herokuapp.com/editTokenJson/${tokenID}`, {
            transactionHash: reponse.transactionHash,
            minted: true
          })
          .then(function (response) {
            console.log(response);
          })        
    }).catch((err)=>{
      //console.log(err.message);
      var errorMessageInJson =JSON.parse(err.message.slice(58, err.message.length - 2));
      var errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;
      console.log(errorMessageToShow);
      if(errorMessageToShow==="ERC721: token already minted"){
        alert("already minted");
      }
    });
    axios.get(`https://tranquil-plains-03610.herokuapp.com/${tokenID}`).then((response) =>{
      //console.log(response.data);
        // this.setState({
        //   metaData:metaData
        // });
       
    });       
  }

  render() {
    return (
      
         <CardColumns>    
           {
                this.props.nftData.metaData.map(nftData =>
                    <Card  style={{ width: "18rem" }}>
                      <Card.Img variant="top" src={nftData.link} />
                      <Card.Body>
                        <Card.Title>nftData.name}</Card.Title>
                        <Card.Text>
                            {nftData.name}>{nftData.link}
                        </Card.Text>
                      </Card.Body>
                      <Card.Footer>
                        <small className="text-muted">Last updated 11 mins ago</small>
                        <Button variant="primary" onClick={() => this.handleClick(this.props.nftData.contractData,nftData.counter,this.props.nftData.account.accountId)}>Mint me</Button>
                      </Card.Footer>
                    </Card>                   
            )}   
          </CardColumns> 

    );

  }
}

export default NftCards;
 