
pragma solidity 0.8.0;

import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

//chainlink oracle interface
interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);
    function getRoundData(uint80 _roundId) external view returns (
        uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
    function latestRoundData() external view returns (
        uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt,uint80 answeredInRound);
}

//prediction contracts are owned by the PredictionFactory contract





contract PredictionFactory is Ownable {
    using SafeERC20 for IERC20;
    
    uint256 public predictionCount;
    address public adminAddress;
    address public operatorAddress;

    mapping(uint256 => Prediction) public predictions;
    mapping(uint256 => IERC20) public betTokens;
 
    IStaker public staker;

    constructor(
        address _adminAddress,
        address _operatorAddress,
        address _stakerSystemAddress
    ) {
        adminAddress = _adminAddress;
        operatorAddress = _operatorAddress;
        staker = IStaker(_stakerSystemAddress);
    }

    function createPrediction(
        AggregatorV3Interface _oracle,
        uint32 _intervalSeconds,
        uint256 _minBetAmount,
        IERC20 _betToken,
        uint256 _treasuryRate,
    ) external onlyAdmin {
        Prediction pred = new Prediction();

        betTokens[predictionCount] = _betToken;
        predictions[predictionCount++] = pred;

        pred.initialize(
            _oracle,
            _intervalSeconds,
            _minBetAmount,
            _betToken,
            _treasuryRate, 
            address(staker)
        );
    }

    function _isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    modifier notContract() {
        require(!_isContract(msg.sender), "no contract");
        require(msg.sender == tx.origin, "no proxy contract");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == adminAddress, "adm");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operatorAddress, "op");
        _;
    }

    modifier onlyAdminOrOperator() {
        require(msg.sender == adminAddress || msg.sender == operatorAddress, "adm|op");
        _;
    }

    /**
     * @dev set admin address
     * callable by owner
     */
    function setAdmin(address _adminAddress) external onlyOwner {
        require(_adminAddress != address(0));
        adminAddress = _adminAddress;
    }

    /**
     * @dev set operator address
     * callable by admin
     */
    function setOperator(address _operatorAddress) external onlyAdmin {
        require(_operatorAddress != address(0));
        operatorAddress = _operatorAddress;
    }

    /**
     * @dev set interval Seconds
     * callable by admin
     */
    function setIntervalSeconds(uint256 _index, uint32 _intervalSeconds) external onlyAdmin {
        predictions[_index].setIntervalSeconds(_intervalSeconds);
    }

    /**
     * @dev set Oracle address
     * callable by admin
     */
    function setOracle(uint256 _index, address _oracle) external onlyAdmin {
        predictions[_index].setOracle(_oracle);
    }

    /**
     * @dev set treasury rate
     * callable by admin
     */
    function setTreasuryRate(uint256 _index, uint256 _treasuryRate) external onlyAdmin {
        predictions[_index].setTreasuryRate(_treasuryRate);
    }


    function setMinBetAmount(uint256 _index, uint256 _minBetAmount) external onlyAdmin {
        predictions[_index].setMinBetAmount(_minBetAmount);
    }

    /**
     * @dev Start genesis round
     */
    function genesisStartRound(uint256 _index) external onlyOperator {
        predictions[_index].genesisStartRound();
    }

    /**
     * @dev Lock genesis round
     */
    function genesisLockRound(uint256 _index) external onlyOperator {
        predictions[_index].genesisLockRound();
    }

    /**
     * @dev Start the next round n, lock price for round n-1, end round n-2
     */
    function executeRound(uint256 _index) external {
        predictions[_index].executeRound();
    }

    /**
     * @dev Bet bear position
     */
    function betBear(uint256 _index, uint256 epoch, uint256 amount) external notContract {
        Prediction pred = predictions[_index];
        betTokens[_index].safeTransferFrom(msg.sender, address(pred), amount);
        pred.betBear(epoch, msg.sender, amount);
    }

    /**
     * @dev Bet bull position
     */
    function betBull(uint256 _index, uint256 epoch, uint256 amount) external notContract {
        Prediction pred = predictions[_index];
        betTokens[_index].safeTransferFrom(msg.sender, address(pred), amount);
        pred.betBull(epoch, msg.sender, amount);
    }

    function claimAllPredictions(uint256[] calldata indeces, uint256[][] calldata epochs) external notContract {
        require(indeces.length == epochs.length);
        for (uint256 i = 0; i < indeces.length; i++) {
            predictions[indeces[i]].claim(msg.sender, epochs[i]);
        }
    }

    function claim(uint256 _index, uint256[] calldata epochs) external notContract {
        predictions[_index].claim(msg.sender, epochs);
    }


    /**
     * @dev Claim all rewards in treasury
     * callable by admin
     */
    function claimTreasury(uint256 _index) external onlyAdmin {
        predictions[_index].claimTreasury(adminAddress);
    }

    /**
     * @dev called by the admin to pause, triggers stopped state
     */
    function pause(uint256 _index) external onlyAdminOrOperator {
        predictions[_index].pause();
    }

    /**
     * @dev called by the admin to unpause, returns to normal state
     */
    function unpause(uint256 _index) external onlyAdminOrOperator {
        predictions[_index].unpause();
    }

     /**
     * @dev It allows the owner to recover tokens sent to the contract by mistake
     */
    function recoverToken(uint256 _index, address _token, uint256 _amount) external onlyAdmin {
        predictions[_index].recoverToken(_token, _amount, msg.sender);
    }

    // Read Functions

    /**
     * @dev Get the claimable stats of specific epoch and user account
     */
    function claimable(uint256 _index, uint256 epoch, address user) external view returns (bool) {
        return predictions[_index].claimable(epoch, user);
    }

    /**
     * @dev Get the refundable stats of specific epoch and user account
     */
    function refundable(uint256 _index, uint256 epoch, address user) external view returns (bool) {
        return predictions[_index].refundable(epoch, user);
    }

    /**
     * @dev Get the oracle address for the specified prediction
     */
    function getOracleInfo(uint256 _index) external view returns (address) {
        return predictions[_index].oracleInfo();
    }


    //STAKING AND REFERENCE SYSTEM FUNCTIONS

    function setStaker(uint256 _index, address _stakerAddress) external onlyAdmin {
        staker = IStaker(_stakerAddress);
        predictions[_index].setStaker(_stakerAddress);
    }

    function setStakingLevelBonuses(uint256 _index, uint256[] calldata _bonuses) external onlyAdmin {
        predictions[_index].setStakingLevelBonuses(_bonuses);
    }


}