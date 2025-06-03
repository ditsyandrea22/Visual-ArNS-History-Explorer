// Add these stubs at the top of your file if you don't have the real implementations:

type TokenType = string; // Adjust to your real type if needed

class WanderWalletConnector {
  turboSigner: any;
  tokenType: TokenType = "wander";
  async connect() {}
  async disconnect() {}
  async getGatewayConfig() { return { host: "" }; }
  async getWalletAddress() { return ""; }
}
class BeaconWalletConnector {
  turboSigner: any;
  tokenType: TokenType = "beacon";
  async connect() {}
  async disconnect() {}
  async getGatewayConfig() { return { host: "" }; }
  async getWalletAddress() { return ""; }
}
class EthWalletConnector {
  turboSigner: any;
  tokenType: TokenType = "eth";
  constructor(_config?: any) {}
  async connect() {}
  async disconnect() {}
  async getGatewayConfig() { return { host: "" }; }
  async getWalletAddress() { return ""; }
}
class ArweaveAppWalletConnector {
  turboSigner: any;
  tokenType: TokenType = "arweave";
  async connect() {}
  async disconnect() {}
  async getGatewayConfig() { return { host: "" }; }
  async getWalletAddress() { return ""; }
}