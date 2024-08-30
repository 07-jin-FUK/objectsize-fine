import React from "react";
import ImageUploader from "./components/Uploader/ImageUploader";
import Instructions from "./components/Instructions/Instructions";
import Title from "./components/Common/Title"; // タイトルコンポーネントをインポート

function App() {
  return (
    <div className="App">
      <Title /> {/* タイトルを表示 */}
      <Instructions />
      <ImageUploader />
    </div>
  );
}

export default App;
