import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const SizeMeasurement = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [scalePoints, setScalePoints] = useState([]); // スケール用の4点
  const [measurePoints, setMeasurePoints] = useState([]); // 測定用の2点
  const [result, setResult] = useState(null); // 測定結果
  const [message, setMessage] = useState("画像をアップロードしてください"); // メッセージ表示用
  const [isReadyForMeasurement, setIsReadyForMeasurement] = useState(false); // 計測ボタンの表示
  const imageRef = useRef(null);
  const [imageFile, setImageFile] = useState(null); // アップロードされた画像ファイル

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
    setImageFile(file); // アップロードされた画像ファイルを保存
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result); // 画像の表示
      setMessage(
        "画像がアップロードされました。千円札の左上をクリックしてください。"
      );
      setScalePoints([]); // スケールポイントをリセット
      setMeasurePoints([]); // 測定ポイントをリセット
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

    if (scalePoints.length < 4) {
      setScalePoints([...scalePoints, { x, y }]);

      // メッセージ更新
      if (scalePoints.length === 0) {
        setMessage("2点目: 千円札の右上をクリックしてください。");
      } else if (scalePoints.length === 1) {
        setMessage("3点目: 千円札の右下をクリックしてください。");
      } else if (scalePoints.length === 2) {
        setMessage("4点目: 千円札の左下をクリックしてください。");
      } else if (scalePoints.length === 3) {
        setMessage(
          "スケールが設定されました。次に測りたい2点をクリックしてください。"
        );
      }
    } else if (measurePoints.length < 2) {
      // 測定用のポイントを取得
      setMeasurePoints([...measurePoints, { x, y }]);

      // メッセージ更新
      if (measurePoints.length === 0) {
        setMessage("次に測定したい2点目をクリックしてください。");
      } else if (measurePoints.length === 1) {
        setMessage(
          "測定するポイントが選択されました。「計測を開始する」を押してください。"
        );
        setIsReadyForMeasurement(true); // 計測ボタンを表示
      }
    }
  };

  // 画像をPythonバックエンドに送信して処理を依頼
  const startMeasurement = async () => {
    console.log("スケール計測の準備中...");
    try {
      const formData = new FormData();
      formData.append("image", imageFile); // アップロードした画像を追加
      const allPoints = [...scalePoints, ...measurePoints];
      formData.append("points", JSON.stringify(allPoints)); // クリックされたスケール4点と測定2点を追加

      const response = await axios.post(
        "http://127.0.0.1:5000/process-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("サーバーレスポンス: ", response.data); // レスポンスを確認

      // サーバーからの結果をフロント側で表示するために状態を更新
      if (response.data.measured_length) {
        setResult(response.data.measured_length); // 結果をセット
        setMessage(`計測結果: ${response.data.measured_length} cm`); // 計測結果をメッセージに反映
      } else {
        setMessage("計測が完了しましたが、結果が得られませんでした。");
      }
    } catch (error) {
      console.error("計測中にエラーが発生しました:", error);
      setMessage("計測中にエラーが発生しました。");
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
            onClick={handleImageClick} // スケール4点と測定用2点のクリックを処理
            style={styles.image}
          />
          {/* スケール設定用のクリックされた場所にマーカーを表示（赤） */}
          {scalePoints.map((point, index) => (
            <div
              key={index}
              style={{
                ...styles.pointMarker,
                backgroundColor: "red", // 赤色
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

          {/* 測定用のクリックされた場所にマーカーを表示（青） */}
          {measurePoints.map((point, index) => (
            <div
              key={index}
              style={{
                ...styles.pointMarker,
                backgroundColor: "blue", // 青色
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
          {scalePoints.length > 1 && (
            <svg style={styles.svgOverlay}>
              {scalePoints.map((point, index) => {
                if (index === 0) return null; // 最初の点は線を引かない
                return (
                  <line
                    key={index}
                    x1={
                      scalePoints[index - 1].x /
                      (imageRef.current.naturalWidth / imageRef.current.width)
                    }
                    y1={
                      scalePoints[index - 1].y /
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
                    style={styles.redLine} // スケール用の線を赤色に
                  />
                );
              })}
              {/* スケール用の四角形を作るために、4点目と1点目の間に線を引く */}
              {scalePoints.length === 4 && (
                <line
                  x1={
                    scalePoints[3].x /
                    (imageRef.current.naturalWidth / imageRef.current.width)
                  }
                  y1={
                    scalePoints[3].y /
                    (imageRef.current.naturalHeight / imageRef.current.height)
                  }
                  x2={
                    scalePoints[0].x /
                    (imageRef.current.naturalWidth / imageRef.current.width)
                  }
                  y2={
                    scalePoints[0].y /
                    (imageRef.current.naturalHeight / imageRef.current.height)
                  }
                  style={styles.redLine} // 赤色の線
                />
              )}

              {/* 測定用の2点を結ぶ線を描画（青色） */}
              {measurePoints.length === 2 && (
                <line
                  x1={
                    measurePoints[0].x /
                    (imageRef.current.naturalWidth / imageRef.current.width)
                  }
                  y1={
                    measurePoints[0].y /
                    (imageRef.current.naturalHeight / imageRef.current.height)
                  }
                  x2={
                    measurePoints[1].x /
                    (imageRef.current.naturalWidth / imageRef.current.width)
                  }
                  y2={
                    measurePoints[1].y /
                    (imageRef.current.naturalHeight / imageRef.current.height)
                  }
                  style={styles.blueLine} // 青色の線
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

      {/* 結果を表示 */}
      {result && (
        <div style={styles.resultContainer}>
          <h3>計測結果: {result} cm</h3>
        </div>
      )}
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
    maxWidth: "100%",
    maxHeight: "500px",
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
    borderRadius: "50%",
  },
  svgOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  redLine: {
    stroke: "red",
    strokeWidth: "3",
    fill: "none",
  },
  blueLine: {
    stroke: "blue",
    strokeWidth: "3",
    fill: "none",
  },
  measureButton: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  resultContainer: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "80%",
    maxWidth: "1000px",
  },
};

export default SizeMeasurement;
