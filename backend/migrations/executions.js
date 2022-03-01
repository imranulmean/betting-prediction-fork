const PancakePredictionV2 = artifacts.require('PancakePredictionV2')

module.exports = async function(callback) {
  let PancakePredictionV2 = await PancakePredictionV2.deployed()
  await PancakePredictionV2.genesisStartRound()
  // Code goes here...
  console.log("geneis Started")
  callback()
}
