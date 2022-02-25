contract Prediction is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Round {
        bool oracleCalled;
        uint256 bullAmount;
        uint256 bearAmount;
        uint256 rewardBaseCalAmount;
        uint256 rewardAmount;
        uint256 treasuryAmount;
        uint256 bullBonusAmount;
        uint256 bearBonusAmount;
        int256 lockPrice;
        int256 closePrice;
    }

    struct Timestamps {
        uint32 startTimestamp;
        uint32 lockTimestamp;
        uint32 closeTimestamp;
    }

    enum Position {Bull, Bear, Undefined}

    struct BetInfo {
        Position position;
        uint256 amount;
        uint256 refereeAmount;
        uint256 referrerAmount;
        uint256 stakingAmount;
        bool claimed;
    }

    IERC20 public betToken;

    mapping(uint256 => Round) public rounds;
    mapping(uint256 => Timestamps) public timestamps;
    mapping(uint256 => mapping(address => BetInfo)) public ledger;
    mapping(address => uint256) public userReferenceBonuses;
    mapping(address => uint256) public totalUserReferenceBonuses;
    uint256 public currentEpoch;
    uint32 public intervalSeconds;
    uint256 public treasuryAmount;
    AggregatorV3Interface public oracle;
    uint256 public oracleLatestRoundId;

    uint256 public constant TOTAL_RATE = 100;
    uint256 public rewardRate;
    uint256 public treasuryRate;
    uint256 public referrerRate;
    uint256 public refereeRate;
    uint256 public minBetAmount;

    bool public genesisStartOnce = false;
    bool public genesisLockOnce = false;

    bool public initialized = false;

    IReferral public referralSystem;
    IStaker public staker;
    uint[] public stakingBonuses;

    event PredictionsStartRound(uint256 indexed epoch, uint256 blockNumber);
    event PredictionsLockRound(uint256 indexed epoch, uint256 blockNumber, int256 price);
    event PredictionsEndRound(uint256 indexed epoch, uint256 blockNumber, int256 price);
    event PredictionsPause(uint256 epoch);
    event PredictionsUnpause(uint256 epoch);
    event PredictionsBet(address indexed sender, uint256 indexed currentEpoch, uint256 amount, uint256 refereeAmount, uint256 stakingAmount, uint8 position);
    event PredictionsClaim(address indexed sender, uint256 indexed currentEpoch, uint256 amount);
    event PredictionsRewardsCalculated(uint256 indexed currentEpoch, uint8 position, uint256 rewardBaseCalAmount, uint256 rewardAmount, uint256 treasuryAmount);
    event PredictionsReferrerBonus(address indexed user, address indexed referrer, uint256 amount, uint256 indexed currentEpoch);
    event PredictionsSetReferralRates(uint256 currentEpoch, uint256 _referrerRate, uint256 _refereeRate);
    event PredictionsSetOracle(uint256 currentEpoch, address _oracle);
    event PredictionsSetTreasuryRate(uint256 currentEpoch, uint256 _treasuryRate);
    event PredictionsSetStakingLevelBonuses(uint256 currentEpoch, uint256[] _bonuses);

    constructor() {
        //index 0 for staking bonuses is always 0
        stakingBonuses.push(0);
    }

    function initialize(
        AggregatorV3Interface _oracle,
        uint32 _intervalSeconds,
        uint256 _minBetAmount,
        IERC20 _betToken,
        uint256 _treasuryRate,
        uint256 _referrerRate,
        uint256 _refereeRate,
        address _referralSystemAddress,
        address _stakerAddress
    ) external onlyOwner {
        require(!initialized);
        require(_treasuryRate <= 10, "<10");
        require(_referrerRate + _refereeRate <= 100, "<100");
        require(_minBetAmount > 100000, ">100000");

        initialized = true;

        oracle = _oracle;
        intervalSeconds = _intervalSeconds;
        minBetAmount = _minBetAmount;

        betToken = _betToken;

        rewardRate = TOTAL_RATE - _treasuryRate;
        treasuryRate = _treasuryRate;
        referrerRate = _referrerRate;
        refereeRate = _refereeRate;

        referralSystem = IReferral(_referralSystemAddress);
        staker = IStaker(_stakerAddress);
    }

    /**
     * @dev set interval blocks
     * callable by owner
     */
    function setIntervalSeconds(uint32 _intervalSeconds) external onlyOwner whenPaused {
        intervalSeconds = _intervalSeconds;
    }


    /**
     * @dev set Oracle address
     * callable by owner
     */
    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0));
        oracle = AggregatorV3Interface(_oracle);
        emit PredictionsSetOracle(currentEpoch, _oracle);
    }

    /**
     * @dev set treasury rate
     * callable by owner
     */
    function setTreasuryRate(uint256 _treasuryRate) external onlyOwner {
        require(_treasuryRate <= 10, "<10");

        rewardRate = TOTAL_RATE - _treasuryRate;
        treasuryRate = _treasuryRate;
        
        emit PredictionsSetTreasuryRate(currentEpoch, _treasuryRate);
    }

    /**
     * @dev set minBetAmount
     * callable by owner
     */
    function setMinBetAmount(uint256 _minBetAmount) external onlyOwner {
        require(_minBetAmount > 100000, ">100000");
        minBetAmount = _minBetAmount;
    }

    /**
     * @dev Start genesis round
     */
    function genesisStartRound() external onlyOwner whenNotPaused {
        require(!genesisStartOnce);

        currentEpoch = currentEpoch + 1;
        _startRound(currentEpoch);
        genesisStartOnce = true;
    }

    /**
     * @dev Lock genesis round, intervalSeconds is used as the buffer period
     */
    function genesisLockRound() external onlyOwner whenNotPaused {
        require(genesisStartOnce, "req genesisStart");
        require(!genesisLockOnce);
        require(block.timestamp <= timestamps[currentEpoch].lockTimestamp + intervalSeconds,">buffer");

        int256 currentPrice = _getPriceFromOracle();
        _safeLockRound(currentEpoch, currentPrice);

        currentEpoch = currentEpoch + 1;
        _startRound(currentEpoch);
        genesisLockOnce = true;
    }

    /**
     * @dev Start the next round n, lock price for round n-1, end round n-2
     */
    function executeRound() external whenNotPaused {
        require(genesisStartOnce && genesisLockOnce, "req genesis");

        int256 currentPrice = _getPriceFromOracle();
        // CurrentEpoch refers to previous round (n-1)
        _safeLockRound(currentEpoch, currentPrice);
        _safeEndRound(currentEpoch - 1, currentPrice);
        _calculateRewards(currentEpoch - 1);

        // Increment currentEpoch to current round (n)
        currentEpoch = currentEpoch + 1;
        _safeStartRound(currentEpoch);
    }

    /**
     * @dev Bet bear position
     */
    function betBear(uint256 epoch, address user, uint256 amount) external whenNotPaused nonReentrant onlyOwner {
        require(epoch == currentEpoch, "Bet earlylate");
        require(_bettable(currentEpoch), "not bettable");
        require(amount >= minBetAmount);
        require(ledger[currentEpoch][user].amount == 0, "alreadybet");

        // Update round data
        Round storage round = rounds[currentEpoch];
        round.bearAmount = round.bearAmount + amount;

        //if the user has a referrer, set the referral bonuses and subtract it from the treasury amount
        uint refereeAmt = 0;
        uint referrerAmt = 0;
        uint stakingAmt = 0;
        uint treasuryAmt = amount * treasuryRate / TOTAL_RATE;
        
        //check and set referral bonuses
        if(referralSystem.hasReferrer(user))
        {
            refereeAmt = treasuryAmt * refereeRate / 100;
            referrerAmt = treasuryAmt * referrerRate / 100;
            round.bearBonusAmount = round.bearBonusAmount + refereeAmt + referrerAmt;
        }

        //check and set staking bonuses
        uint stakingLvl = staker.getUserStakingLevel(user);
        if(stakingLvl >= stakingBonuses.length)
            stakingLvl = stakingBonuses.length - 1;

        if(stakingLvl > 0)
        {
            stakingAmt = treasuryAmt * stakingBonuses[stakingLvl] / 100;
            round.bearBonusAmount = round.bearBonusAmount + stakingAmt;
        }

        //round treasury amount includes the staking and referral bonuses until the calculation
        //these amounts will be deducted on rewards calculation
        round.treasuryAmount = round.treasuryAmount + treasuryAmt;

        // Update user data
        BetInfo storage betInfo = ledger[currentEpoch][user];
        betInfo.position = Position.Bear;
        betInfo.amount = amount;
        betInfo.refereeAmount = refereeAmt;
        betInfo.referrerAmount = referrerAmt;
        betInfo.stakingAmount = stakingAmt;

        emit PredictionsBet(user, epoch, amount, refereeAmt, stakingAmt, uint8(Position.Bear));
    }

    /**
     * @dev Bet bull position
     */
    function betBull(uint256 epoch, address user, uint256 amount) external whenNotPaused nonReentrant onlyOwner {
        require(epoch == currentEpoch, "Bet earlylate");
        require(_bettable(currentEpoch), "not bettable");
        require(amount >= minBetAmount);
        require(ledger[currentEpoch][user].amount == 0, "alreadybet");

        // Update round data
        Round storage round = rounds[currentEpoch];
        round.bullAmount = round.bullAmount + amount;

        //if the user has a referrer, set the referral bonuses and subtract it from the treasury amount
        uint refereeAmt = 0;
        uint referrerAmt = 0;
        uint stakingAmt = 0;
        uint treasuryAmt = amount * treasuryRate / TOTAL_RATE;

        //check and set referral bonuses
        if(referralSystem.hasReferrer(user))
        {
            refereeAmt = treasuryAmt * refereeRate / 100;
            referrerAmt = treasuryAmt * referrerRate / 100;
            round.bullBonusAmount = round.bullBonusAmount + refereeAmt + referrerAmt;
        }

        //check and set staking bonuses
        uint stakingLvl = staker.getUserStakingLevel(user);
        if(stakingLvl >= stakingBonuses.length)
            stakingLvl = stakingBonuses.length - 1;

        if(stakingLvl > 0)
        {
            stakingAmt = treasuryAmt * stakingBonuses[stakingLvl] / 100;
            round.bullBonusAmount = round.bullBonusAmount + stakingAmt;
        }

        //round treasury amount includes the staking and referral bonuses until the calculation
        //these amounts will be deducted on rewards calculation
        round.treasuryAmount = round.treasuryAmount + treasuryAmt;

        // Update user data
        BetInfo storage betInfo = ledger[currentEpoch][user];
        betInfo.position = Position.Bull;
        betInfo.amount = amount;
        betInfo.refereeAmount = refereeAmt;
        betInfo.referrerAmount = referrerAmt;
        betInfo.stakingAmount = stakingAmt;

        emit PredictionsBet(user, epoch, amount, refereeAmt, stakingAmt, uint8(Position.Bull));
    }

    function hasReferenceBonus(address _user) external view returns (bool) {
        return userReferenceBonuses[_user] > 0;
    }

    function claimReferenceBonus(address _user) external nonReentrant onlyOwner {
        require(userReferenceBonuses[_user] > 0, "nobonuses");
        uint reward = userReferenceBonuses[_user];
        userReferenceBonuses[_user] = 0;
        betToken.safeTransfer(_user, reward);
    }

    /**
     * @dev Claim reward
     */
    function claim(address user, uint256[] calldata epochs) external nonReentrant onlyOwner {
        uint256 reward; // Initializes reward

        for (uint256 i = 0; i < epochs.length; i++) {
            require(timestamps[epochs[i]].startTimestamp != 0);
            require(block.timestamp > timestamps[epochs[i]].closeTimestamp);

            uint256 addedReward = 0;
            BetInfo storage betInfo = ledger[epochs[i]][user];

            // Round valid, claim rewards
            if (rounds[epochs[i]].oracleCalled) {
                require(claimable(epochs[i], user), "No claim");
                Round memory round = rounds[epochs[i]];
                addedReward = betInfo.amount * round.rewardAmount / round.rewardBaseCalAmount + betInfo.refereeAmount + betInfo.stakingAmount;

                //if there is a referrer bonus, add it to that user's referrer bonus amount so they can claim it themselves
                if(betInfo.referrerAmount > 0)
                {
                    address referrerUser = referralSystem.getReferrer(user);
                    userReferenceBonuses[referrerUser] = userReferenceBonuses[referrerUser] + betInfo.referrerAmount;
                    totalUserReferenceBonuses[referrerUser] = totalUserReferenceBonuses[referrerUser] + betInfo.referrerAmount;

                    emit PredictionsReferrerBonus(user, referrerUser, betInfo.referrerAmount, epochs[i]);
                }
            }
            // Round invalid, refund bet amount
            else {
                require(refundable(epochs[i], user), "No refund");
                addedReward = betInfo.amount;
            }

            betInfo.claimed = true;
            reward = reward + addedReward;

            emit PredictionsClaim(user, epochs[i], addedReward);
        }

        if (reward > 0) {
            betToken.safeTransfer(user, reward);
        }
    }

    /**
     * @dev Claim all rewards in treasury
     * callable by owner
     */
    function claimTreasury(address _recipient) external nonReentrant onlyOwner {
        uint256 currentTreasuryAmount = treasuryAmount;
        treasuryAmount = 0;
        betToken.safeTransfer(_recipient, currentTreasuryAmount);
    }

    /**
     * @dev called by the owner to pause, triggers stopped state
     */
    function pause() external onlyOwner whenNotPaused {
        _pause();

        emit PredictionsPause(currentEpoch);
    }

    /**
     * @dev called by the owner to unpause, returns to normal state
     * Reset genesis state. Once paused, the rounds would need to be kickstarted by genesis
     */
    function unpause() external onlyOwner whenPaused {
        genesisStartOnce = false;
        genesisLockOnce = false;
        _unpause();

        emit PredictionsUnpause(currentEpoch);
    }

    /**
     * @dev Get the claimable stats of specific epoch and user account
     */
    function claimable(uint256 epoch, address user) public view returns (bool) {
        BetInfo memory betInfo = ledger[epoch][user];
        Round memory round = rounds[epoch];
        if (round.lockPrice == round.closePrice) {
            return false;
        }
        return
            round.oracleCalled && betInfo.amount > 0 && !betInfo.claimed &&
            ((round.closePrice > round.lockPrice && betInfo.position == Position.Bull) ||
                (round.closePrice < round.lockPrice && betInfo.position == Position.Bear));
    }

    /**
     * @dev Get the refundable stats of specific epoch and user account
     */
    function refundable(uint256 epoch, address user) public view returns (bool) {
        BetInfo memory betInfo = ledger[epoch][user];
        Round memory round = rounds[epoch];
        return !round.oracleCalled && block.timestamp > (timestamps[epoch].closeTimestamp + intervalSeconds) && betInfo.amount != 0 && !betInfo.claimed;
    }

    function oracleInfo() external view returns (address) {
        return address(oracle);
    }

    /**
     * @dev Start round
     * Previous round n-2 must end
     */
    function _safeStartRound(uint256 epoch) internal {
        require(genesisStartOnce, "req gnsstart");
        require(timestamps[epoch - 2].closeTimestamp != 0);
        require(block.timestamp >= timestamps[epoch - 2].closeTimestamp);
        _startRound(epoch);
    }

    function _startRound(uint256 epoch) internal {
        Timestamps storage ts = timestamps[epoch];
        ts.startTimestamp = uint32(block.timestamp);
        ts.lockTimestamp = uint32(block.timestamp) + intervalSeconds;
        ts.closeTimestamp = uint32(block.timestamp) + (intervalSeconds * 2);

        emit PredictionsStartRound(epoch, block.timestamp);
    }

    /**
     * @dev Lock round, intervalSeconds is used as the buffer period
     */
    function _safeLockRound(uint256 epoch, int256 price) internal {
        require(timestamps[epoch].startTimestamp != 0);
        require(block.timestamp >= timestamps[epoch].lockTimestamp);
        require(block.timestamp <= timestamps[epoch].lockTimestamp + intervalSeconds, ">buffer");
        _lockRound(epoch, price);
    }

    function _lockRound(uint256 epoch, int256 price) internal {
        Round storage round = rounds[epoch];
        round.lockPrice = price;

        emit PredictionsLockRound(epoch, block.timestamp, round.lockPrice);
    }

    /**
     * @dev End round, intervalSeconds is used as the buffer period
     */
    function _safeEndRound(uint256 epoch, int256 price) internal {
        require(timestamps[epoch].lockTimestamp != 0);
        require(block.timestamp >= timestamps[epoch].closeTimestamp);
        require(block.timestamp <= timestamps[epoch].closeTimestamp + intervalSeconds, ">buffer");
        _endRound(epoch, price);
    }

    function _endRound(uint256 epoch, int256 price) internal {
        Round storage round = rounds[epoch];
        round.closePrice = price;
        round.oracleCalled = true;

        emit PredictionsEndRound(epoch, block.timestamp, round.closePrice);
    }

    /**
     * @dev Calculate rewards for round
     */
    function _calculateRewards(uint256 epoch) internal {
        require(rounds[epoch].rewardBaseCalAmount == 0 && rounds[epoch].rewardAmount == 0);
        Round storage round = rounds[epoch];
        uint256 rewardBaseCalAmount;
        uint256 rewardAmount;
        uint256 treasuryAmt;
        uint8 position = uint8(Position.Undefined);
        // Bull wins
        if (round.closePrice > round.lockPrice) {
            rewardBaseCalAmount = round.bullAmount;
            //round treasury amount includes the referral bonuses at this stage, so deducting it from the total amount
            rewardAmount = round.bearAmount + round.bullAmount - round.treasuryAmount;
            //bonus amount from the fees of the winning side is deducted from the total treasury amount
            treasuryAmt = round.treasuryAmount - round.bullBonusAmount;
            position = uint8(Position.Bull);
        }
        // Bear wins
        else if (round.closePrice < round.lockPrice) {
            rewardBaseCalAmount = round.bearAmount;
            //round treasury amount includes the referral bonuses at this stage, so deducting it from the total amount
            rewardAmount = round.bearAmount + round.bullAmount - round.treasuryAmount;
            //bonus amount from the fees of the winning side is deducted from the total treasury amount
            treasuryAmt = round.treasuryAmount - round.bearBonusAmount;
            position = uint8(Position.Bear);
        }
        // House wins
        else {
            rewardBaseCalAmount = 0;
            rewardAmount = 0;
            treasuryAmt = round.bearAmount + round.bullAmount;
        }
        round.rewardBaseCalAmount = rewardBaseCalAmount;
        round.treasuryAmount = treasuryAmt;
        round.rewardAmount = rewardAmount;

        // Add to treasury
        treasuryAmount = treasuryAmount + treasuryAmt;

        emit PredictionsRewardsCalculated(epoch, position, rewardBaseCalAmount, rewardAmount, treasuryAmt);
    }

    /**
     * @dev Get latest recorded price from oracle
     * If it has not updated, it would be invalid
     */
    function _getPriceFromOracle() internal returns (int256) {
        (uint80 roundId, int256 price, , , ) = oracle.latestRoundData();
        require(roundId > oracleLatestRoundId, "same oracle rnd");
        oracleLatestRoundId = uint256(roundId);
        return price;
    }

    /**
     * @dev Determine if a round is valid for receiving bets
     * Round must have started and locked
     * Current block must be within startTimestamp and lockTimestamp
     */
    function _bettable(uint256 epoch) internal view returns (bool) {
        return
            timestamps[epoch].startTimestamp != 0 &&
            timestamps[epoch].lockTimestamp != 0 &&
            block.timestamp > timestamps[epoch].startTimestamp &&
            block.timestamp < timestamps[epoch].lockTimestamp;
    }

    /**
     * @notice It allows the owner to recover tokens sent to the contract by mistake
     * @param _token: token address
     * @param _amount: token amount
     * @dev Callable by owner
     */
    function recoverToken(address _token, uint256 _amount, address receiver) external nonReentrant onlyOwner {
        IERC20(_token).safeTransfer(receiver, _amount);
    }

    function setReferralRates(uint256 _referrerRate, uint256 _refereeRate) external onlyOwner {
        require(_referrerRate + _refereeRate + stakingBonuses[stakingBonuses.length - 1] <= 100, "<100");
        referrerRate = _referrerRate;
        refereeRate = _refereeRate;

        emit PredictionsSetReferralRates(currentEpoch, _referrerRate, _refereeRate);
    }

    function setStaker(address _stakerAddress) external onlyOwner {
        staker = IStaker(_stakerAddress);
    }

    function setReferralSystem(address _referralSystemAddress) external onlyOwner {
        referralSystem = IReferral(_referralSystemAddress);
    }

    function setStakingLevelBonuses(uint256[] calldata _bonuses) external onlyOwner {
        require(_bonuses.length > 0 && _bonuses[0] == 0, "l0is0");
        require(_bonuses[_bonuses.length - 1] + refereeRate + referrerRate <= 100, "<100");
        for (uint256 i = 0; i < _bonuses.length - 1; i++) {
            require(_bonuses[i] <= _bonuses[i+1],"reqhigher");
        }
        stakingBonuses = _bonuses;
        emit PredictionsSetStakingLevelBonuses(currentEpoch, _bonuses);
    }

}