import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const SizeMeasurement = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [scalePoints, setScalePoints] = useState([]); // スケール用の4点
  const [measurePoints, setMeasurePoints] = useState([]); // 測定用の2点
  const [result, setResult] = useState(null); // 測定結果
  const [message, setMessage] = useState("画像をアップロードしてください。"); // 初期メッセージ
  const [isReadyForMeasurement, setIsReadyForMeasurement] = useState(false); // 計測ボタンの表示
  const imageRef = useRef(null);
  const [imageFile, setImageFile] = useState(null); // アップロードされた画像ファイル
  const [messageHistory, setMessageHistory] = useState([]); // メッセージ履歴用

  // 画像がアップロードされたときに呼ばれる関数
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImageFile(file); // アップロードされた画像ファイルを保存
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result); // 画像の表示
      setScalePoints([]); // スケールポイントをリセット
      setMeasurePoints([]); // 測定ポイントをリセット
      updateMessage(
        "画像がアップロードされました。千円札の左上をクリックしてください。"
      );
      setIsReadyForMeasurement(false); // 計測ボタンを非表示に
      setResult(null); // 結果もリセット
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // 画像上でクリックして4点の位置を取得
  const handleImageClick = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (scalePoints.length < 4) {
      setScalePoints([...scalePoints, { x, y }]);

      if (scalePoints.length === 0) {
        updateMessage("2点目: 千円札の右上をクリックしてください。");
      } else if (scalePoints.length === 1) {
        updateMessage("3点目: 千円札の右下をクリックしてください。");
      } else if (scalePoints.length === 2) {
        updateMessage("4点目: 千円札の左下をクリックしてください。");
      } else if (scalePoints.length === 3) {
        updateMessage(
          "スケールが設定されました。次に測りたい2点をクリックしてください。"
        );
      }
    } else if (measurePoints.length < 2) {
      setMeasurePoints([...measurePoints, { x, y }]);

      if (measurePoints.length === 0) {
        updateMessage("次に測定したい2点目をクリックしてください。");
      } else if (measurePoints.length === 1) {
        updateMessage(
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

  const updateMessage = (newMessage) => {
    setMessageHistory([...messageHistory, newMessage]); // 新しいメッセージを履歴に追加
    setMessage(newMessage); // メッセージを更新
  };
  // ボタン機能
  const undoLastAction = () => {
    if (measurePoints.length > 0) {
      // スケール設定中の場合、スケールポイントを戻す
      setMeasurePoints(measurePoints.slice(0, -1));
      updateMessageBasedOnMeasurePoints(measurePoints.length - 1);
    } else if (scalePoints.length > 0) {
      // 測定中の場合、測定ポイントを戻す
      setScalePoints(scalePoints.slice(0, -1));
      updateMessageBasedOnScalePoints(scalePoints.length - 1);
    }

    // メッセージ履歴も一つ戻す
    if (messageHistory.length > 1) {
      const newHistory = messageHistory.slice(0, -1); // 最新のメッセージを削除
      setMessage(newHistory[newHistory.length - 1]); // 一つ前のメッセージに戻す
      setMessageHistory(newHistory); // 更新した履歴を保存
    }
  };

  const resetScalePoints = () => {
    // スケールポイントのみリセットし、測定ポイントは維持
    setScalePoints([]);
    updateMessage(
      "スケールをリセットしました。千円札の左上をクリックしてください。"
    );
  };

  const resetMeasurePoints = () => {
    // 測定ポイントのみリセットし、スケールポイントは維持
    setMeasurePoints([]);
    updateMessage(
      "測定ポイントをリセットしました。目的物の2点をクリックしてください。"
    );
  };

  const updateMessageBasedOnScalePoints = (remainingPoints) => {
    if (remainingPoints === 3) {
      updateMessage("4点目: 千円札の左下をクリックしてください。");
    } else if (remainingPoints === 2) {
      updateMessage("3点目: 千円札の右下をクリックしてください。");
    } else if (remainingPoints === 1) {
      updateMessage("2点目: 千円札の右上をクリックしてください。");
    } else if (remainingPoints === 0) {
      updateMessage("1点目: 千円札の左上をクリックしてください。");
    }
  };

  const updateMessageBasedOnMeasurePoints = (remainingPoints) => {
    if (remainingPoints === 1) {
      updateMessage("次に測定したい2点目をクリックしてください。");
    } else {
      updateMessage(
        "測定するポイントが選択されました。「計測を開始する」を押してください。"
      );
    }
  };

  const resetEverything = () => {
    setScalePoints([]);
    setMeasurePoints([]);
    setMessage("画像をアップロードしてください。");
    setResult(null);
    setIsReadyForMeasurement(false);
  };

  return (
    <div style={styles.container}>
      <h2>3Dサイズ測定</h2>

      {/* Dropzone部分 */}
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        <p>ここに画像をドラッグ＆ドロップ、またはクリックしてファイルを選択</p>
      </div>

      {/* メッセージを表示 */}
      <div style={styles.messageContainer}>
        <p>{message}</p>
        {/* 画像の右側にボタンを縦に配置 */}
        <div style={styles.controlButtonsContainer}>
          <button style={styles.controlButton} onClick={undoLastAction}>
            一つ戻る
          </button>
          <button
            style={styles.controlButton}
            onClick={resetScalePoints}
            disabled={scalePoints.length === 0} // スケールが設定され始めたら有効化
          >
            スケールを測りなおす
          </button>
          <button
            style={styles.controlButton}
            onClick={resetMeasurePoints}
            disabled={measurePoints.length === 0} // 測定が始まったら有効化
          >
            目的物を測りなおす
          </button>
        </div>
      </div>

      {/* アップロードされた画像を表示 */}
      {imageSrc && (
        <div style={styles.imageContainer}>
          <img
            id="uploaded-image"
            src={imageSrc}
            alt="Uploaded"
            ref={imageRef}
            onClick={handleImageClick}
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
              {/* スケールポイントの線描画 */}
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
              {/* スケールの4点が完成したら、四角形を描画 */}
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
              {/* 測定用のポイントの線描画（目的物の線） */}
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
          <button style={styles.controlButton} onClick={resetEverything}>
            違う写真でサイズを測る
          </button>
          <button style={styles.controlButton} onClick={resetMeasurePoints}>
            同じ写真で別の部分を計測する
          </button>
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
    width: "60%",
    maxWidth: "1000px",
    margin: "0 auto",
    marginTop: "20px",
  },
  imageContainer: {
    position: "relative",
    display: "flex", // フレックスボックスで画像とボタンを横並びに
    justifyContent: "center",
  },
  image: {
    cursor: "crosshair",
    maxWidth: "100%",
    maxHeight: "500px",
  },
  messageContainer: {
    marginTop: "20px",
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: "#f8f8f8",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "80%",
    maxWidth: "1000px",
    fontWeight: "bold",
    fontSize: "22px",
    color: "red",
  },
  pointMarker: {
    position: "absolute",
    width: "12px",
    height: "12px",
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
    strokeWidth: "4",
    fill: "none",
  },
  blueLine: {
    stroke: "blue",
    strokeWidth: "4",
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

  controlButtonHover: {
    backgroundColor: "#0056b3", // Hover時の色
  },
  measureButton: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
  measureButtonHover: {
    backgroundColor: "#218838", // Hover時の色
  },
  controlButtonsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButton: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
    width: "170px", // ボタン幅を一定に
    height: "40px",
    marginLeft: "10px",
    marginRight: "10px",
  },
  controlButtonDisabled: {
    backgroundColor: "#cccccc",
    color: "#666666",
    cursor: "not-allowed", // 無効時はクリック不可
  },
};

export default SizeMeasurement;
