const PancakePredictionV2 = artifacts.require('PancakePredictionV2')

module.exports = async function(deployer, network, accounts) {
    // constructor(
    //     address _oracleAddress,
    //     address _adminAddress,
    //     address _operatorAddress,
    //     uint256 _intervalSeconds,
    //     uint256 _bufferSeconds,
    //     uint256 _minBetAmount,
    //     uint256 _oracleUpdateAllowance,
    //     uint256 _treasuryFee
    // )
    var _oracleAddress='0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526';
    var _adminAddress='0x481d45334874199010c839144dfebbbe12c98a80';
    var _operatorAddress='0x1e88c52496c55b5bcfb542191bce71c761940c84';
    var _intervalSeconds=300;
    var _bufferSeconds=300;
    var _minBetAmount=1;
    var _oracleUpdateAllowance=10;
    var _treasuryFee=3;

  await deployer.deploy(PancakePredictionV2,_oracleAddress,_adminAddress,_operatorAddress,_intervalSeconds,
                        _bufferSeconds,_minBetAmount,_oracleUpdateAllowance,_treasuryFee);

  const pancakePredictionV2 = await PancakePredictionV2.deployed()
  // var a= await pancakePredictionV2.genesisStartRound();
  // var b= await pancakePredictionV2.genesisLockRound();
  // var d= await pancakePredictionV2.oracleLatestRoundId();
  // console.log(d);
  console.log("hellllooo");    
  
  //var d= await pancakePredictionV2.oracleLatestRoundId();
  //var c= await pancakePredictionV2.executeRound();


  // // Deploy TokenFarm
  // await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
  // const tokenFarm = await TokenFarm.deployed()

  // // Transfer all tokens to TokenFarm (1 million)
  // await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // // Transfer 100 Mock DAI tokens to investor
  // await daiToken.transfer(accounts[1], '100000000000000000000')

}
// truffle deploy --network testnet --reset --compile-none