import React, { useState } from "react";
import { ArnsProfileExplorer } from "./components/ArnsHistoryExplorer";

const App: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);

  const handleToggleHistory = () => {
    setShowHistory((prev) => !prev);
  };

  return (
    <div>
      <h1>ARNs Application</h1>
      <button onClick={handleToggleHistory}>
        {showHistory ? "Hide" : "Show"} History Explorer
      </button>
      {showHistory && <ArnsProfileExplorer />}
    </div>
  );
};

export default App;