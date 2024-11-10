# Agatha Oracle Network

A modular, decentralized oracle network monorepo delivering robust off-chain data to EVM chains.

## Key Features
- Deterministic data aggregation (median, trimmed mean) and outlier detection
- Concurrency-aware pipeline with retries for resilient data collection
- Minimal on-chain aggregator contract exposing latest value and timestamp
- Simple dashboard scaffolding for future visualizations
- Test setup for backend logic

## Monorepo Layout
- `backend/`: TypeScript data pipeline and aggregation logic
- `contracts/`: Solidity smart contracts for on-chain storage
- `apps/dashboard/`: Frontend scaffolding (widgets, dashboard shell)
- `tests/`: Backend and contract tests
- `scripts/`: Dev helper scripts (commit automation, token checks)

## Backend
- `core/aggregator.ts`: median, trimmed-mean, outlier detection
- `core/pipeline.ts`: concurrency + retry pipeline
- `datasources/`: pluggable mock data sources (extendable)

## Contracts
- `OracleAggregator.sol`: store `latestAnswer` and `latestTimestamp`

## Getting Started
1. Node.js >= 18
2. Install: `cd backend && npm i && npm run build`
3. Test: `npm run test` (placeholder)

## Roadmap
- Multi-source signature aggregation
- SLA and dispute resolution
- Cross-chain relaying
- Real data connectors and adapters

## Security
This repository contains example code and is not production-ready. Review and audit before deployment.
