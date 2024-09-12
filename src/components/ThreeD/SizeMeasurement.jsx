import React, { useState, useEffect, useRef } from "react";
import ImageUploader from "../Uploader/ImageUploader"; // 既存のImageUploaderをインポート
import cv from "opencv.js"; // OpenCV.jsのインポート

const SizeMeasurement = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [scale, setScale] = useState(null); // スケール設定
  const [points, setPoints] = useState([]); // 基準物体の2点を保持
  const imageRef = useRef(null);

  // ImageUploaderでファイルがアップロードされたときに呼ばれる関数
  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result); // 画像を表示するためのURLをセット
    };
    reader.readAsDataURL(file);
  };

  // 画像上でクリックされた際に基準物体の2点を設定
  const handleImageClick = (e) => {
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (points.length < 2) {
      setPoints([...points, { x, y }]);

      if (points.length === 1) {
        const dx = x - points[0].x;
        const dy = y - points[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy); // 2点間のピクセル距離

        // 仮に1000円札を基準として使用（長さ15.5cm）
        const actualLength = 15.5;
        setScale(actualLength / distance); // スケール設定
        console.log("スケールが設定されました:", actualLength / distance);
      }
    }
  };

  // サイズ測定ロジック
  const handleSizeMeasurement = () => {
    if (!window.cv || !window.cv.imread || !scale) {
      console.error("OpenCV.js or scale is not set!");
      return;
    }

    const imgElement = document.getElementById("uploaded-image");
    const src = window.cv.imread(imgElement);
    const dst = new window.cv.Mat();

    window.cv.cvtColor(src, dst, window.cv.COLOR_RGBA2GRAY, 0);
    window.cv.Canny(dst, dst, 50, 150, 3, false);

    window.cv.imshow("canvasOutput", dst);
    src.delete();
    dst.delete();
  };

  return (
    <div>
      <h2>画像をアップロードしてサイズを測定</h2>

      {/* ImageUploaderコンポーネントを利用して画像アップロード */}
      <ImageUploader onFileUpload={handleImageUpload} />

      {/* アップロードされた画像を表示 */}
      {imageSrc && (
        <img
          id="uploaded-image"
          src={imageSrc}
          alt="Uploaded"
          ref={imageRef}
          onClick={handleImageClick} // 基準物体のクリック処理
          style={{ cursor: "crosshair" }}
        />
      )}

      <canvas id="canvasOutput"></canvas>

      <button onClick={handleSizeMeasurement}>サイズを測定する</button>

      {/* スケールが設定されたら表示 */}
      {scale && (
        <p>スケールが設定されました: 1ピクセル = {scale.toFixed(4)} cm</p>
      )}
    </div>
  );
};

export default SizeMeasurement;
