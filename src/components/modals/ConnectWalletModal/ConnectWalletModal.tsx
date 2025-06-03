// --- Wallet connector stubs for local development ---
type TokenType = string;
class WanderWalletConnector { turboSigner: any; tokenType: TokenType = "wander"; async connect() {}; async disconnect() {}; async getGatewayConfig() { return { host: "" }; }; async getWalletAddress() { return ""; } }
class BeaconWalletConnector { turboSigner: any; tokenType: TokenType = "beacon"; async connect() {}; async disconnect() {}; async getGatewayConfig() { return { host: "" }; }; async getWalletAddress() { return ""; } }
class EthWalletConnector { turboSigner: any; tokenType: TokenType = "eth"; constructor(_config?: any) {} async connect() {}; async disconnect() {}; async getGatewayConfig() { return { host: "" }; }; async getWalletAddress() { return ""; } }
class ArweaveAppWalletConnector { turboSigner: any; tokenType: TokenType = "arweave"; async connect() {}; async disconnect() {}; async getGatewayConfig() { return { host: "" }; }; async getWalletAddress() { return ""; } }

// ---- Stubs for missing modules ----
function useIsMobile() { return false; }
const VALIDATION_INPUT_TYPES = { AO_ADDRESS: "AO_ADDRESS" };
function formatForMaxCharCount(s: string, n: number) { return s; }
function isValidAoAddress(addr: string) { return !!addr && addr.length > 0; }
const ValidationInput = ({ value, setValue }: any) => (
  <input value={value} onChange={(e) => setValue(e.target.value)} />
);
const DialogModal = ({ title, body, onCancel, onClose, onNext, nextText, cancelText }: any) => (
  <div>
    <div>{title}</div>
    <div>{body}</div>
    <button onClick={onCancel}>{cancelText || "Cancel"}</button>
    <button onClick={onNext}>{nextText || "Next"}</button>
  </div>
);
// ---- End Stubs ----

import { useEffect, useState } from "react";
// Removed broken imports

function ConnectWalletModal({
  onConnect,
  onClose,
}: {
  onConnect: (connector: any) => void;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();
  const [selectedConnector, setSelectedConnector] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [isValidAddress, setIsValidAddress] = useState<boolean | undefined>();

  useEffect(() => {
    if (!address.length) {
      setIsValidAddress(undefined);
    }
  }, [address]);

  function handleConnect() {
    let connector: any;
    switch (selectedConnector) {
      case "wander":
        connector = new WanderWalletConnector();
        break;
      case "beacon":
        connector = new BeaconWalletConnector();
        break;
      case "eth":
        connector = new EthWalletConnector();
        break;
      case "arweave":
        connector = new ArweaveAppWalletConnector();
        break;
      default:
        connector = undefined;
    }
    if (connector) onConnect(connector);
  }

  return (
    <div className="modal-container" style={isMobile ? { padding: "none" } : {}}>
      <DialogModal
        title={<h2 className="white text-xl">Connect Wallet</h2>}
        body={
          <div className="flex flex-column" style={{ fontSize: "14px", maxWidth: "575px" }}>
            <div className="flex flex-column" style={{ gap: "10px" }}>
              <span className="grey">Wallet Type:</span>
              <select
                value={selectedConnector}
                onChange={(e) => setSelectedConnector(e.target.value)}
                style={{ fontSize: "16px", padding: "8px", marginBottom: "16px" }}
              >
                <option value="">Select Wallet</option>
                <option value="wander">Wander Wallet</option>
                <option value="beacon">Beacon Wallet</option>
                <option value="eth">Ethereum Wallet</option>
                <option value="arweave">Arweave App Wallet</option>
              </select>
            </div>
            <div className="flex flex-column" style={{ gap: "10px" }}>
              <span className="grey">Wallet Address:</span>
              <ValidationInput
                value={address}
                setValue={setAddress}
              />
              <span className="text-color-error">
                {isValidAddress === false ? "invalid address" : ""}
              </span>
            </div>
          </div>
        }
        onCancel={onClose}
        onClose={onClose}
        onNext={selectedConnector && isValidAoAddress(address) ? handleConnect : undefined}
        nextText="Connect"
        cancelText="Cancel"
      />
    </div>
  );
}

export default ConnectWalletModal;