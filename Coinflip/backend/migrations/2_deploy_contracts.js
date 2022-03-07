
const CoinFlipPrediction = artifacts.require('CoinFlipPrediction')
module.exports = async function(deployer, network, accounts) {

  await deployer.deploy(CoinFlipPrediction);
  const _CoinFlipPrediction = await CoinFlipPrediction.deployed()
  console.log("hellllooo");    

}


// Token Contract Address 
// 0x0A32B269c29f730fe5f08CDc10fFBB585A85eBac

//CoinFlip Contract adrres
// 0x55860C24eF73Af87d182b9E3C087511C37f46C27

// Accounts:
// (0) 0x481d45334874199010c839144dfebbbe12c98a80
// (1) 0x1e88c52496c55b5bcfb542191bce71c761940c84
// (2) 0x5acf7c87beeaed3ed337c301e271c0c50fb29234
// (3) 0x2285439d1447eae23c3678cb3be1faa110b42f71
// (4) 0x787eeacaacd45fe246872a94c0d9071ac585b21b
// (5) 0xcdab8c9c4a72ce15d093d84f6f2f0b7eba0a211a
// (6) 0x26ddb4e491b7a2d5a9ab2bbd615e612422362ea1
// (7) 0xb22e595c23974fd0e80f96c37f8162cbd764a532
// (8) 0xb199e2c24deb796382da676866edddc62fb17af1
// (9) 0xa59025d0b53ae4e0da79337f1578687de81ce146

// Private Keys:
// (0) de946e372541d6146f44459847bc85f405973bd072ac4a32a0df1d6950f6ee02
// (1) e81aa8963391545691e99bd7237d550ba9263a91f8450a87e2036055823baacf
// (2) 645e4c2192c5db84dbfca5fabf9d516dd63bb865161b28faa97f74eaee37c0bc
// (3) fcf7ada41ea7a4cc1b9bd45d0d364c367d54e448f9f6986bfce21ecb7b356159
// (4) 465b0b55a63bdcdfcc3c7ee42729882030c94cad4806ff8d19be8ee53f2dee17
// (5) 9eefd372addcbf86cc4bce930e8fc8c70c63a3afbd73d51f24ca38fa8c658c4c
// (6) b90325eeb8ef8e823825915b817a019e96fecad84e8dac477d9e8608185656fa
// (7) 9d8ae930f6e7c4ecfa5cacfcd74615a50b0b592eb5b7f5027bdcfa61e6ecc8e0
// (8) 29a756f4bc9e6b038c3ced28d2b22bb77893a00e8c69195f47685d8886dbf72d
// (9) 6cc87248c2aeabfc9a57662c77f477347a7604199f507544527e3259943e210c
// truffle deploy --network testnet --reset --compile-none


