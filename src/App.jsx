import React, { useState, useEffect } from "react";
import ImageUploader from "./components/Uploader/ImageUploader";
import Instructions from "./components/Instructions/Instructions";
import Title from "./components/Common/Title";
import ThreeScene from "./components/ThreeD/ThreeScene";
import SizeMeasurement from "./components/ThreeD/SizeMeasurement";
import "./App.css";

function App() {
  const [mode, setMode] = useState("3D"); // デフォルトで3Dモードを選択

  useEffect(() => {
    // ページを開いた際に3Dモードが自動で表示される
    setMode("3D");
  }, []);

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
  };

  return (
    <div className="App">
      <Title />

      {/* 右上に2Dモードの切り替えボタン */}
      <div className="popup-button-container">
        <button
          className="popup-button"
          onClick={() => handleModeSelection(mode === "3D" ? "2D" : "3D")}
        >
          {mode === "3D" ? "2D計測モード" : "3D計測モード"}
        </button>
      </div>

      {mode === "3D" && (
        <div>
          <h2>3Dサイズ測定モード</h2>
          <Instructions />

          <SizeMeasurement />
        </div>
      )}
      {mode === "2D" && (
        <div>
          <h2>2Dサイズ測定モード</h2>
          <Instructions />
          <ImageUploader />
        </div>
      )}
    </div>
  );
}

export default App;
