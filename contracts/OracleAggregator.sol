// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title OracleAggregator
/// @notice Minimal on-chain store for aggregated oracle answers
contract OracleAggregator {
    int256 private lastAnswer;
    uint256 private lastUpdatedAt;

    event AnswerUpdated(int256 answer, uint256 updatedAt);

    function submit(int256 answer) external {
        lastAnswer = answer;
        lastUpdatedAt = block.timestamp;
        emit AnswerUpdated(answer, lastUpdatedAt);
    }

    function latestAnswer() external view returns (int256) {
        return lastAnswer;
    }

    function latestTimestamp() external view returns (uint256) {
        return lastUpdatedAt;
    }
}
