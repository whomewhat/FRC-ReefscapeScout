# AGENTS.md

This file defines project constraints and behavioral rules for all coding agents, reviewers, and assistants contributing to this app.

You are working on an Expo-based React Native app with Expo Router, intended for production deployment via Expo Go and/or EAS.

---

## ✅ DO

- Extend `expo/tsconfig.base` in `tsconfig.json` and override `"module": "esnext"` for TypeScript 5.3+ compatibility.
- Use `npm` for all installs. This project does **not** use `bun`, `yarn`, or `pnpm`.
- Assume TypeScript ~5.8, React 19, and React Native 0.79.
- Use `expo-router` navigation patterns.
- Use `expo install --fix --npm` to align all SDK 53-compatible packages.
- Use semantic commit messages (e.g. `chore: upgrade to SDK 53`).
- Escape literal `>` / `<` / `&` characters in `<Text>` elements (`&gt;`, `&lt;`, etc.).
- Normalize line endings using `.gitattributes` with `* text=auto`.
- Assume a mobile-first design context with Expo Go as the runtime.
- Respect `package.json` version ranges. Do not introduce major version upgrades without approval.

---

## 🚫 DON'T

- Do NOT downgrade SDK or Expo packages to "force" compatibility.
- Do NOT touch files outside the current repo context or working directory.
- Do NOT recommend alternative package managers (bun, yarn, etc.).
- Do NOT modify `.expo`, `package-lock.json`, or `.git` metadata manually.
- Do NOT introduce changes to `package.json` scripts without approval.
- Do NOT remove the `test`, `typecheck`, or `start` scripts.

---

## 🧪 PRODUCTION-READINESS REVIEW

When asked to perform a production readiness review, respond with:

- A **GO** or **NO-GO** decision.
- A prioritized list of **blocking issues** or missing implementations.
- Optional UX or accessibility improvements.
- Evidence of recursive code analysis—do not just check top-level files.

> Prompt:  
> `THIS PROMPT ONLY. Do a deep, recursive code review... Assume your reputation depends on it.`

---

## 🤖 AGENT ENVIRONMENT

- GitHub repo: [linked](./)
- Local dev: Windows environment, command prompt + QR-based Expo preview
- Deployment: Expo Go + optional EAS Build
- CI/CD: GitHub PR-based. `npm run typecheck` and `npm test` must pass.

---

## 👋 Welcome Message for New Agents

> Welcome! You're working on a mobile-first Expo app using SDK 53, React Native 0.79, and Expo Router. All Expo-managed dependencies are version-aligned. Focus on high mobile UX, accessibility, and build integrity. Follow the rules above—especially for linting, JSX safety, and tooling compatibility.
