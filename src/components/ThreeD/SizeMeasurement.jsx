import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";

// OpenCVのロードを待つ関数
const loadOpenCV = () => {
  return new Promise((resolve, reject) => {
    if (window.cv) {
      console.log("OpenCVはすでにロードされています");
      resolve(window.cv);
    } else {
      console.log("OpenCVのロードを開始します");
      window.Module = {
        onRuntimeInitialized() {
          console.log("OpenCVの初期化が完了しました");
          resolve(window.cv);
        },
      };
      setTimeout(() => {
        if (!window.cv) {
          reject(new Error("OpenCVが正常に読み込まれませんでした"));
        }
      }, 5000); // 5秒後にエラーチェック
    }
  });
};

const SizeMeasurement = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [points, setPoints] = useState([]); // クリックされたポイント（4点）
  const [scale, setScale] = useState(null); // スケールを保持
  const [result, setResult] = useState(null); // 測定結果
  const [message, setMessage] = useState("画像をアップロードしてください"); // メッセージ表示用
  const [isReadyForMeasurement, setIsReadyForMeasurement] = useState(false); // 計測ボタンの表示
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      setMessage(
        `画像サイズ: ${img.naturalWidth} x ${img.naturalHeight} ピクセル`
      );
    }
  }, [imageSrc]);

  // 画像がアップロードされたときに呼ばれる関数
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result); // 画像の表示
      setMessage(
        "画像がアップロードされました。千円札の左上をクリックしてください。"
      );
      setPoints([]); // ポイントをリセット
      setIsReadyForMeasurement(false); // 計測ボタンを非表示に
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // 画像上でクリックして4点の位置を取得
  const handleImageClick = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();

    // 実際のサイズと表示サイズのスケールを計算
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;

    // 表示サイズでの座標計算
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // ポイントを更新
    if (points.length < 4) {
      setPoints([...points, { x, y }]);

      // メッセージ更新
      if (points.length === 0) {
        setMessage("2点目: 千円札の右上をクリックしてください。");
      } else if (points.length === 1) {
        setMessage("3点目: 千円札の右下をクリックしてください。");
      } else if (points.length === 2) {
        setMessage("4点目: 千円札の左下をクリックしてください。");
      } else if (points.length === 3) {
        setMessage(
          "全ての点が選択されました。「計測を開始する」を押してください。"
        );
        setIsReadyForMeasurement(true); // 計測ボタンを表示
      }
    }
  };

  // 計測を開始する関数
  const startMeasurement = async () => {
    console.log("スケール計測の準備中...");
    try {
      const cv = await loadOpenCV(); // OpenCVの読み込みを待つ
      console.log("OpenCVがロードされました");

      if (!cv) {
        throw new Error("OpenCVがロードされていません");
      }

      setMessage("スケール計測中...");
      console.log("スケール計測開始");

      // 透視変換の処理
      console.log("クリックされた4点:", points);

      if (points.length !== 4) {
        throw new Error("4点のクリックが完了していません");
      }

      const srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
        points[0].x,
        points[0].y, // 1点目
        points[1].x,
        points[1].y, // 2点目
        points[2].x,
        points[2].y, // 3点目
        points[3].x,
        points[3].y, // 4点目
      ]);
      const dstCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0,
        0, // 目標の座標
        155,
        0, // 千円札の幅15.5cmに相当
        155,
        76, // 15.5cm × 7.6cm
        0,
        76,
      ]);

      const imgElement = document.getElementById("uploaded-image");
      if (!imgElement) {
        throw new Error("画像が見つかりませんでした");
      }
      console.log("画像要素の取得:", imgElement);

      const src = cv.imread(imgElement);
      if (src.empty()) {
        throw new Error("画像の読み込みに失敗しました。");
      }

      const dst = new cv.Mat();

      const transformMatrix = cv.getPerspectiveTransform(srcCoords, dstCoords);
      console.log("透視変換マトリックスの作成完了:", transformMatrix);

      try {
        cv.warpPerspective(src, dst, transformMatrix, new cv.Size(155, 76));
        console.log("透視変換が完了しました");

        // 結果をキャンバスに表示
        cv.imshow("canvasOutput", dst);

        setScale(0.1); // 仮に1ピクセル = 0.1cmとして設定
        setMessage("スケール計測が完了しました。");
      } catch (error) {
        console.error("透視変換中にエラーが発生しました:", error);
        setMessage("計測中にエラーが発生しました。");
      } finally {
        // クリーンアップ
        src.delete();
        dst.delete();
        srcCoords.delete();
        dstCoords.delete();
        transformMatrix.delete();
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
      setMessage("エラーが発生しました。再度お試しください。");
    }
  };

  return (
    <div style={styles.container}>
      <h2>3Dサイズ測定</h2>

      {/* Dropzone部分 */}
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        <p>ここに画像をドラッグ＆ドロップ、またはクリックしてファイルを選択</p>
      </div>

      {/* アップロードされた画像を表示 */}
      {imageSrc && (
        <div style={styles.imageContainer}>
          <img
            id="uploaded-image"
            src={imageSrc}
            alt="Uploaded"
            ref={imageRef}
            onClick={handleImageClick} // 4点クリックでポイント設定
            style={styles.image}
          />
          {/* クリックされた場所にマーカーを表示 */}
          {points.map((point, index) => (
            <div
              key={index}
              style={{
                ...styles.pointMarker,
                left:
                  point.x /
                    (imageRef.current.naturalWidth / imageRef.current.width) -
                  5,
                top:
                  point.y /
                    (imageRef.current.naturalHeight / imageRef.current.height) -
                  5,
              }}
            />
          ))}
          {/* 点と点を結ぶ線を描画 */}
          {points.length > 1 && (
            <svg style={styles.svgOverlay}>
              {points.map((point, index) => {
                if (index === 0) return null; // 最初の点は線を引かない
                return (
                  <line
                    key={index}
                    x1={
                      points[index - 1].x /
                      (imageRef.current.naturalWidth / imageRef.current.width)
                    }
                    y1={
                      points[index - 1].y /
                      (imageRef.current.naturalHeight / imageRef.current.height)
                    }
                    x2={
                      point.x /
                      (imageRef.current.naturalWidth / imageRef.current.width)
                    }
                    y2={
                      point.y /
                      (imageRef.current.naturalHeight / imageRef.current.height)
                    }
                    style={styles.line}
                  />
                );
              })}
              {/* 四角形を作るために、4点目と1点目の間に線を引く */}
              {points.length === 4 && (
                <line
                  x1={
                    points[3].x /
                    (imageRef.current.naturalWidth / imageRef.current.width)
                  }
                  y1={
                    points[3].y /
                    (imageRef.current.naturalHeight / imageRef.current.height)
                  }
                  x2={
                    points[0].x /
                    (imageRef.current.naturalWidth / imageRef.current.width)
                  }
                  y2={
                    points[0].y /
                    (imageRef.current.naturalHeight / imageRef.current.height)
                  }
                  style={styles.line}
                />
              )}
            </svg>
          )}
        </div>
      )}

      <canvas id="canvasOutput" style={styles.canvas}></canvas>

      {/* メッセージを表示 */}
      <div style={styles.messageContainer}>
        <p>{message}</p>
      </div>

      {/* 計測ボタンを表示 */}
      {isReadyForMeasurement && (
        <button style={styles.measureButton} onClick={startMeasurement}>
          計測を開始する
        </button>
      )}

      {/* 測定結果を表示 */}
      {result && <p>{result}</p>}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    textAlign: "center",
    minHeight: "100vh",
    paddingBottom: "50px",
    overflowY: "auto",
  },
  dropzone: {
    border: "2px dashed #cccccc",
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "20px",
    width: "80%",
    maxWidth: "1000px",
    margin: "0 auto",
    marginTop: "20px",
  },
  imageContainer: {
    position: "relative",
    display: "inline-block",
  },
  image: {
    cursor: "crosshair",
    maxWidth: "100%", // 幅を100%に設定
    maxHeight: "500px", // 高さを500pxに制限
  },
  canvas: {
    marginTop: "20px",
    border: "1px solid #000",
    maxWidth: "80%",
  },
  messageContainer: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#f8f8f8",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "80%",
    maxWidth: "1000px",
  },
  pointMarker: {
    position: "absolute",
    width: "10px",
    height: "10px",
    backgroundColor: "red",
    borderRadius: "50%",
  },
  svgOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none", // マウスイベントを通さない
  },
  line: {
    stroke: "blue",
    strokeWidth: 2,
  },
  measureButton: {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default SizeMeasurement;
