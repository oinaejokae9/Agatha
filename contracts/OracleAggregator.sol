// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract OracleAggregator {
    int256 private lastAnswer;
    event AnswerUpdated(int256 answer, uint256 updatedAt);
    function submit(int256 answer) external { lastAnswer = answer; emit AnswerUpdated(answer, block.timestamp); }
    function latestAnswer() external view returns (int256) { return lastAnswer; }
}
// tweak step 22
// tweak step 23
// tweak step 24
// tweak step 25
// tweak step 26
// tweak step 27
// tweak step 28
// tweak step 29
