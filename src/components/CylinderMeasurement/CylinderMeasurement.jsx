import React, { useState } from "react";

const CylinderMeasurement = () => {
  const [diameter, setDiameter] = useState(null); // 円柱の直径
  const [height, setHeight] = useState(null); // 円柱の高さ

  const handleMeasurement = () => {
    // ここに測定ロジックを実装
    console.log("円柱の測定を開始します");
  };

  return (
    <div>
      <h3>円柱のサイズを測定する</h3>
      <p>千円札を円柱の隣に置いて、画像をアップロードしてください。</p>

      {/* 画像アップロード用のコンポーネントや測定用のフォームをここに配置 */}
      <button onClick={handleMeasurement}>計測開始</button>
    </div>
  );
};

export default CylinderMeasurement;
