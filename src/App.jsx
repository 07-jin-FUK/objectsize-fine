import React from "react";
import ImageUploader from "./ImageUploader";
import Instructions from "./Instructions";
import Title from "./Title"; // タイトルコンポーネントをインポート

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
