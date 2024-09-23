import React, { useState } from "react";
import ImageUploader from "./components/Uploader/ImageUploader";
import Instructions from "./components/Instructions/Instructions";
import Title from "./components/Common/Title";
import SizeMeasurement from "./components/ThreeD/SizeMeasurement";
import "./App.css";
import ThreeDMeasurement from "./components/NewThreeD/ThreeDMeasurement";

function App() {
  const [mode, setMode] = useState(null); // 初期状態ではモード未選択

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
  };

  return (
    <div className="App">
      <Title />

      {/* 最初の画面で2つの画像を表示 */}
      {!mode && (
        <div className="mode-selection-container">
          <div
            className="mode-selection-section"
            onClick={() => handleModeSelection("flat")}
          >
            <img
              src="/src/img/千円札.jpg"
              alt="平面サイズ測定"
              className="mode-image"
            />
            <h2>千円札で長さを測る</h2>
          </div>
          <div
            className="mode-selection-section"
            onClick={() => handleModeSelection("3D")}
          >
            <img
              src="/src/img/立体.jpg"
              alt="立体サイズ測定"
              className="mode-image"
            />
            <h2>千円札で立体サイズを測る</h2>
          </div>
        </div>
      )}

      {/* 平面モード */}
      {mode === "flat" && (
        <div>
          <h2>平面サイズ測定モード</h2>
          <Instructions />
          <SizeMeasurement />
        </div>
      )}

      {/* 3Dモード */}
      {mode === "3D" && (
        <div>
          <h2>3Dサイズ測定モード</h2>
          <Instructions />
          <ThreeDMeasurement />
        </div>
      )}
    </div>
  );
}

export default App;
