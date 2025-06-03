# Visual-ArNS-History-Explorer

[Live Demo](https://visual-ar-ns-history-explorer.vercel.app)

## Overview

**Visual-ArNS-History-Explorer** is a TypeScript/React application designed to visually explore ArNS (Arweave Name System) history and data. This project leverages the Arweave ecosystem to provide an interactive and user-friendly interface for querying, visualizing, and understanding ArNS records, transactions, and their historical evolution.

## Features

- Visualize ArNS history and record changes over time.
- Explore detailed data from the Arweave blockchain.
- Modern TypeScript codebase with React and Vite.
- Rich UI using Ant Design components and Radix UI.
- Wallet connectivity (ArConnect, Arweave wallet, and more).
- Robust data fetching and caching with React Query.
- Arweave and ArNS SDK integrations.
- Stripe integration for payments (if enabled).
- Storybook for UI component development and testing.

## Getting Started

### Prerequisites

- Node.js (v18 or above recommended)
- Yarn

### Installation

```bash
git clone https://github.com/ditsyandrea22/Visual-ArNS-History-Explorer.git
cd Visual-ArNS-History-Explorer
yarn install
```

### Local Development

```bash
yarn dev
```

Visit [http://localhost:5173](http://localhost:5173) to view the app.

### Build for Production

```bash
yarn build
```

### Storybook

To run the Storybook UI component explorer:

```bash
yarn storybook
```

## Scripts

- `yarn dev` – Start local development server
- `yarn build` – Build for production
- `yarn storybook` – Run Storybook
- `yarn test` – Run tests
- `yarn lint:check` – Lint codebase
- `yarn format` – Format code using Prettier

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **UI:** Ant Design, Radix UI, Tailwind CSS, Framer Motion
- **State/Data:** React Query, Redux (if used)
- **Blockchain:** Arweave SDK, ArNS, ArConnect, ArDrive
- **Payments:** Stripe (optional)
- **Testing:** Jest, Playwright, Testing Library
- **Documentation:** Storybook, Typedoc

## Deployment

The app can be deployed to Vercel or any static hosting provider.

## Contribution

Contributions are welcome! Please fork the repository and submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## License

This project is currently **not licensed**. If you plan to use or contribute, please open an issue to discuss licensing.

---

© 2025 [ditsyandrea22](https://github.com/ditsyandrea22) 
