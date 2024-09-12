import React, { useState } from "react";
import ImageUploader from "../Uploader/ImageUploader"; // パスを修正
import cv from "opencv.js"; // OpenCV.jsのインポート

const SizeMeasurement = () => {
  const [imageSrc, setImageSrc] = useState(null);

  // ImageUploaderでファイルがアップロードされたときに呼ばれる関数
  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result); // 画像を表示するためのURLをセット
    };
    reader.readAsDataURL(file);
  };

  // サイズ測定ロジック
  const handleSizeMeasurement = () => {
    if (!window.cv || !window.cv.imread) {
      console.error("OpenCV.js is not loaded yet!");
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
      {imageSrc && <img id="uploaded-image" src={imageSrc} alt="Uploaded" />}

      <canvas id="canvasOutput"></canvas>

      <button onClick={handleSizeMeasurement}>サイズを測定する</button>
    </div>
  );
};

export default SizeMeasurement;
