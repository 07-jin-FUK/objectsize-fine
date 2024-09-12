import React, { useState } from "react";
import ImageUploader from "./components/Uploader/ImageUploader";
import Instructions from "./components/Instructions/Instructions";
import Title from "./components/Common/Title"; // タイトルコンポーネントをインポート
import ThreeScene from "./components/ThreeD/ThreeScene";
import SizeMeasurement from "./components/ThreeD/SizeMeasurement"; // パスを更新

import "./App.css"; // CSSファイルをインポート

function App() {
  const [mode, setMode] = useState(null); // 3Dか2Dのモードを選択

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode); // モードを選択
  };

  return (
    <div className="App">
      <Title /> {/* タイトルを表示 */}
      {/* まだモードが選ばれていない場合、モード選択を表示 */}
      {!mode && (
        <div className="mode-selection-container">
          <h2>どちらのモードで計測しますか？</h2>
          <div className="button-container">
            <button
              className="styled-button"
              onClick={() => handleModeSelection("3D")}
            >
              3Dサイズ測定
            </button>
            <button
              className="styled-button"
              onClick={() => handleModeSelection("2D")}
            >
              2Dサイズ測定
            </button>
          </div>
        </div>
      )}
      {/* 3Dモードの場合 */}
      {mode === "3D" && (
        <div>
          <h2>3Dサイズ測定モード</h2>
          <Instructions /> {/* 3D向けの説明を追加する場合 */}
          <ThreeScene /> {/* Three.js を使った3Dサイズ測定 */}
          <SizeMeasurement />{" "}
          {/* 3Dサイズ測定のための画像アップロードとサイズ測定 */}
        </div>
      )}
      {/* 2Dモードの場合 */}
      {mode === "2D" && (
        <div>
          <h2>2Dサイズ測定モード</h2>
          <Instructions /> {/* 2D向けの説明 */}
          <ImageUploader /> {/* 2Dサイズ測定のためのアップロード */}
        </div>
      )}
    </div>
  );
}

export default App;
