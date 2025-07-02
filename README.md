# FRC Reefscape Robotics Scouting App

A comprehensive scouting application for FIRST Robotics Competition teams, designed specifically for Team 5268 The BioMech Falcons.

### Features

- **Team Management**: Track and manage information about competing teams
- **Match Scouting**: Record detailed performance data with level-specific scoring
- **Notes System**: Add observations with tags from predefined categories
- **Alliance Selection**: Get recommendations for potential alliance partners
- **Data Sharing**: Transfer scouting data between devices without internet
- **REEFSCAPE Game Guide**: Reference for the 2025 FRC game

### Getting Started

#### Prerequisites

- Node.js (v18+ recommended)
- npm (`bun`, `yarn`, and `pnpm` are **not supported**)
- Expo CLI:
  ```bash
  npm install -g expo-cli
  ```

#### Installation

```bash
git clone https://github.com/whomewhat/FRC-ReefscapeScout.git
cd FRC-ReefscapeScout

npm install
npm start
```

Then scan the QR code using the **Expo Go** app on your mobile device.

### Development Tips

- This project uses **Expo SDK 53**, **React Native 0.79**, and **React 19**.
- All Expo packages are aligned via `expo install --fix`.
- Run checks locally before pushing:
  ```bash
  npm run typecheck
  npm test
  ```

### Usage Guide

#### Initial Setup

1. Launch the app
2. Complete onboarding
3. Enter team number (default: `5268`)

#### Scouting Workflow

- **Before the Event**: Review REEFSCAPE game rules and get familiar with the UI
- **During Matches**: Record scoring + performance data using the level-specific interface
- **After Matches**: Use the Alliance tab to identify ideal partners and share results

### Data Transfer

Supports offline and online sync methods:

- Bluetooth
- QR scan
- JSON export/import
- Copyable summary text

### Key Screens

- **Teams**: Team directory
- **Matches**: Match schedule and scouting view
- **Scouting**: Detailed data entry with level scoring
- **Notes**: Strategy notes and tags
- **Alliance**: Partner recommendations
- **REEFSCAPE**: FRC 2025 game reference
- **Settings**: App preferences

### AI/Agent Guidance

> This repo is AI-coding-agent compatible (Codex, GPT, Claude).
> Agents must **read and comply with [`AGENTS.md`](./AGENTS.md)** before contributing.

- Do not use Bun/Yarn
- Do not downgrade Expo/React versions
- Run `npm run typecheck` and `npm test` before commits
- Use semantic commits and create PR branches (`upgrade/sdk-53`, etc.)
- All production-readiness reviews must use:
  ```
  THIS PROMPT ONLY
  Do a deep, recursive code review... Assume your reputation depends on it.
  ```

### Contributing

Pull Requests welcome. Please follow [AGENTS.md](./AGENTS.md) for rules around tooling, structure, and review logic.

### License

MIT — see [LICENSE](./LICENSE)

### Acknowledgments

- FIRST Robotics Competition
- Team 5268 The BioMech Falcons
- Expo, React Native, and the open source community
```
