import React, { useState } from "react";
import ImageUploader from "./components/Uploader/ImageUploader";
import Instructions from "./components/Instructions/Instructions";
import Title from "./components/Common/Title";
import SizeMeasurement from "./components/ThreeD/SizeMeasurement";
import "./App.css";
import ThreeDMeasurement from "./components/NewThreeD/ThreeDMeasurement";
import CylinderMeasurement from "./components/CylinderMeasurement/CylinderMeasurement"; // 新しく追加する円柱用コンポーネント

function App() {
  const [mode, setMode] = useState(null); // 初期状態ではモード未選択

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
  };

  const handleBackToTop = () => {
    setMode(null); // トップ画面に戻る
  };

  return (
    <div className="App">
      <Title />

      {/* トップ画面に戻るボタン */}
      {mode && (
        <div className="button-container">
          <button onClick={handleBackToTop} className="top-button">
            トップ画面に戻る
          </button>

          {/* モード切り替えボタン */}
          <div className="mode-switch-container">
            {mode !== "flat" && (
              <button
                onClick={() => handleModeSelection("flat")}
                className="mode-switch-button"
              >
                平面長さ測定モード
              </button>
            )}
            {mode !== "3D" && (
              <button
                onClick={() => handleModeSelection("3D")}
                className="mode-switch-button"
              >
                立体長さ測定モード（キューブ）
              </button>
            )}
            {mode !== "cylinder" && (
              <button
                onClick={() => handleModeSelection("cylinder")}
                className="mode-switch-button"
              >
                円柱サイズ測定モード
              </button>
            )}
          </div>
        </div>
      )}

      {/* 最初の画面で3つのモード選択ボタンを表示 */}
      {!mode && (
        <div className="mode-selection-container">
          <div
            className="mode-selection-section"
            onClick={() => handleModeSelection("flat")}
          >
            <img
              src="/img/senen.jpg"
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
              src="/img/rittai.jpg"
              alt="立体サイズ測定（キューブ）"
              className="mode-image"
            />
            <h2>千円札で立体サイズを測る</h2>
          </div>
          <div
            className="mode-selection-section"
            onClick={() => handleModeSelection("cylinder")}
          >
            <img
              src="/img/tire.jpg"
              alt="円柱サイズ測定"
              className="mode-image"
            />
            <h2>千円札で円柱サイズを測る</h2>
          </div>
        </div>
      )}

      {/* 平面モード */}
      {mode === "flat" && (
        <div>
          <h2>平面サイズ測定モード</h2>
          <Instructions mode="flat" />
          <SizeMeasurement />
        </div>
      )}

      {/* 3Dモード（キューブ） */}
      {mode === "3D" && (
        <div>
          <h2>3Dサイズ測定モード（キューブ）</h2>
          <Instructions mode="3D" />
          <ThreeDMeasurement />
        </div>
      )}

      {/* 円柱モード */}
      {mode === "cylinder" && (
        <div>
          <h2>円柱サイズ測定モード</h2>
          <Instructions mode="cylinder" />
          <CylinderMeasurement />
        </div>
      )}
    </div>
  );
}

export default App;
