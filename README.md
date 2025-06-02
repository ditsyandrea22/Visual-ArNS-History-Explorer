# Visual ArNS History Explorer

**Visual ArNS History Explorer** is a modern, responsive React web application for searching and viewing the history of Arweave Name Service (.ar.io) names or Arweave wallet addresses. It supports dark mode, interactive UI, ArConnect wallet integration, and direct links for name management on [arns.ar.io](https://arns.ar.io).

![screenshot](./screenshot.png)

## Features

- 🔍 **Search .ar.io Names & Wallets:** Instantly look up ArNS (.ar.io) names or Arweave wallet addresses.
- 🕵️ **Full History:** View complete registration and management history for any name.
- 💡 **Dark Mode:** Automatic and toggleable dark mode with glowing UI effects.
- 🔑 **ArConnect Integration:** Connect your Arweave wallet to autofill your address and see your names.
- ⚡ **Live Feedback:** Loading spinner, error messages, and interactive inputs for seamless UX.
- 🖱️ **Manage Links:** Direct "Manage" action for every name, opening the [AR.IO management page](https://arns.ar.io/#/manage/names/).
- 📱 **Responsive:** Fully mobile-friendly.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

```bash
git clone https://github.com/ditsyandrea22/Visual-ArNS-History-Explorer.git
cd rewind-arns-history
npm install
# or
yarn install
```

### Running Locally

```bash
npm start
# or
yarn start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
# or
yarn build
```

## Usage

1. **Connect your ArConnect wallet** (optional) for auto-filling your address.
2. **Search** for any `.ar.io` name (e.g., `permaweb.ar.io`) or an Arweave wallet address.
3. **Browse history** and manage names with direct links.

## Project Structure

```
src/
  App.tsx           # Main React app
  app.css           # Styles (light/dark mode, effects)
public/
  favicon.ico       # Favicon
  index.html        # Entry HTML
README.md           # This file
```

## Credits

- **AR.IO / Arweave Name Service** ([arns.ar.io](https://arns.ar.io))
- **React** for UI
- **ArConnect** for wallet integration

## License

MIT

---

*Made with 💙 for the Arweave and AR.IO community.*
