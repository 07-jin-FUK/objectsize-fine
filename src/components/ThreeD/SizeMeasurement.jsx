import React, { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import "./SizeMeasurement.css"; // ここでCSSファイルを読み込む

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
  const [measurementLogs, setMeasurementLogs] = useState([]); // 計測結果のログを管理
  const [currentLocation, setCurrentLocation] = useState(""); // 入力ボックスの値を管理
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を追加

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
        <>
          画像を確認しました。基準を測定します。
          <br />
          1点目：千円札の左上をクリックしてください。
        </>
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

    fetch("https://python-api-5yn6.onrender.com/warmup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "warm up server" }),
    })
      .then(() => {
        console.log("Server warmed up");
      })
      .catch((error) => {
        console.error("Error warming up server:", error);
      });
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
          <>
            基準が設定されました。 <br />
            次に測りたい目的物の片端をクリックしてください。
          </>
        );
      }
    } else if (measurePoints.length < 2) {
      setMeasurePoints([...measurePoints, { x, y }]);

      if (measurePoints.length === 0) {
        updateMessage("次に測定したい2点目をクリックしてください。");
      } else if (measurePoints.length === 1) {
        updateMessage(
          <>
            測定するポイントが選択されました。
            <br />
            「計測を開始する」を押してください。
          </>
        );
        setIsReadyForMeasurement(true); // 計測ボタンを表示
      }
    }
  };

  // 画像をPythonバックエンドに送信して処理を依頼
  const startMeasurement = async () => {
    console.log("スケール計測の準備中...");
    setIsLoading(true); // 計測開始時にローディング状態にする
    setMessage("現在計測中です。少々お待ちください...");

    try {
      const formData = new FormData();
      formData.append("image", imageFile); // アップロードした画像を追加
      const allPoints = [...scalePoints, ...measurePoints];
      formData.append("points", JSON.stringify(allPoints)); // クリックされたスケール4点と測定2点を追加

      const response = await axios.post(
        "https://python-api-5yn6.onrender.com/process-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.measured_length) {
        setResult(response.data.measured_length); // 結果をセット
        setMessage(`計測結果:約 ${response.data.measured_length} cm`); // 計測結果をメッセージに反映
      } else {
        setMessage("計測が完了しましたが、結果が得られませんでした。");
      }
    } catch (error) {
      console.error("計測中にエラーが発生しました:", error);
      setMessage("計測中にエラーが発生しました。");
    } finally {
      setIsLoading(false); // 計測完了後にローディングを解除
    }
  };

  const updateMessage = (newMessage) => {
    setMessageHistory([...messageHistory, newMessage]); // 新しいメッセージを履歴に追加
    setMessage(newMessage); // メッセージを更新
  };

  const resetScalePoints = () => {
    // スケールポイントのみリセットし、測定ポイントは維持
    setScalePoints([]);
    updateMessage(
      <>
        スケールをリセットしました。
        <br />
        千円札の左上をクリックしてください。
      </>
    );
  };

  const resetMeasurePoints = () => {
    // 測定ポイントのみリセットし、スケールポイントは維持
    setMeasurePoints([]);
    updateMessage(
      <>
        測定ポイントをリセットしました。
        <br />
        目的物の片端をクリックしてください。
      </>
    );
  };

  const resetEverything = () => {
    setScalePoints([]);
    setMeasurePoints([]);
    setMessage("画像をアップロードしてください。");
    setResult(null);
    setIsReadyForMeasurement(false);
    setImageSrc(null); // 画像もリセット
    setImageFile(null); // アップロードされたファイルもリセット
  };

  const saveMeasurementLog = () => {
    if (!currentLocation) {
      alert("計測場所を入力してください。");
      return;
    }

    const newLog = {
      location: currentLocation,
      length: result,
    };

    setMeasurementLogs([...measurementLogs, newLog]); // 新しいログを追加
    setCurrentLocation(""); // 入力ボックスをクリア
  };

  return (
    <div className="container">
      {/* Dropzone部分 */}
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>ここに画像をドラッグ＆ドロップ、またはクリックしてファイルを選択</p>
      </div>
      {/* メッセージを表示 */}
      <div className="messageContainer">
        <p>{message}</p>
        {isLoading && (
          <div className="loadingContainer">
            <div className="loader"></div>
          </div>
        )}
        {result && (
          <div className="resultContainer">
            <button className="allResetButton" onClick={resetEverything}>
              違う写真でサイズを測る
            </button>
            <button className="sameResetButton" onClick={resetMeasurePoints}>
              同じ写真で別の部分を計測する
            </button>
          </div>
        )}

        {imageSrc && (
          <div className="controlButtonsContainer">
            <button
              className={
                scalePoints.length === 0
                  ? "controlButton disabled"
                  : "controlButton"
              }
              onClick={resetScalePoints}
              disabled={scalePoints.length === 0}
            >
              基準再測定
            </button>
            <button
              className={
                measurePoints.length === 0
                  ? "controlButton disabled"
                  : "controlButton"
              }
              onClick={resetMeasurePoints}
              disabled={measurePoints.length === 0}
            >
              目的物再測定
            </button>
            {isReadyForMeasurement && (
              <button className="measureButton" onClick={startMeasurement}>
                計測開始
              </button>
            )}
          </div>
        )}
      </div>
      {/* アップロードされた画像を表示 */}
      {imageSrc && (
        <div className="imageContainer">
          <img
            id="uploaded-image"
            src={imageSrc}
            alt="Uploaded"
            ref={imageRef}
            className="image"
            onClick={handleImageClick}
          />

          {/* スケール設定用のクリックされた場所にマーカーを表示（赤） */}
          {scalePoints.map((point, index) => (
            <div
              key={index}
              className="pointMarker"
              style={{
                backgroundColor: "red",
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
              className="pointMarker"
              style={{
                backgroundColor: "blue",
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
            <svg className="svgOverlay">
              {scalePoints.map((point, index) => {
                if (index === 0) return null;
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
                    className="redLine"
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
                  className="redLine"
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
                  className="blueLine"
                />
              )}
            </svg>
          )}
        </div>
      )}

      {/* 保存された計測結果を表示 */}
      <div className="measurementLogs">
        <h3>計測履歴</h3>
        {/* 計測結果の表示と入力ボックス、保存ボタン */}
        {result && (
          <div className="measurementResult">
            <p>計測結果: 約 {result} cm</p>
            <input
              type="text"
              placeholder="計測場所を入力"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
            />
            <button onClick={saveMeasurementLog}>メモ</button>
          </div>
        )}
        {measurementLogs.length > 0 ? (
          <>
            <h3>計測箇所</h3>
            <ul>
              {measurementLogs.map((log, index) => (
                <li key={index}>
                  {log.location} - {log.length} cm
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>計測履歴がありません</p>
        )}
      </div>
    </div>
  );
};

export default SizeMeasurement;
