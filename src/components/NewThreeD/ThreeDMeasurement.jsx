import React, { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import "./ThreeDMeasurement.css";

const ThreeDMeasurement = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [redPoints, setRedPoints] = useState([]); // 千円札のポイント（赤）
  const [bluePoints, setBluePoints] = useState([]); // 目的物のポイント（青）
  const [message, updateMessage] = useState("画像をアップロードしてください。");
  const [isReadyForMeasurement, setIsReadyForMeasurement] = useState(false);
  const imageRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null); // 計測結果
  const [measurementLogs, setMeasurementLogs] = useState([]); // 計測結果のログを管理
  const [currentLocation, setCurrentLocation] = useState(""); // 入力ボックスの値を管理
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を追加

  // 計測結果を保存する機能
  const saveMeasurementLog = () => {
    if (!currentLocation) {
      alert("計測場所を入力してください。");
      return;
    }

    const newLog = {
      location: currentLocation,
      top_vertical: result?.top_vertical || "N/A",
      top_horizontal: result?.top_horizontal || "N/A",
      side_height: result?.side_height || "N/A",
      top_area: result?.top_area || "N/A",
      side_area: result?.side_area || "N/A",
      volume: result?.volume || "N/A",
    };

    setMeasurementLogs([...measurementLogs, newLog]); // 新しいログを追加
    setCurrentLocation(""); // 入力ボックスをクリア
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setRedPoints([]); // 千円札ポイントをリセット
      setBluePoints([]); // 目的物ポイントをリセット
      updateMessage("1点目：千円札を縦に見て右上をクリックしてください。");
      setIsReadyForMeasurement(false);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // 画像上でクリックして位置を取得
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

    // 千円札のポイント（6点）
    if (redPoints.length < 6) {
      setRedPoints([...redPoints, { x, y }]);

      const redPointMessages = [
        "2点目: 千円札の中央右をクリックしてください。",
        "3点目: 千円札の右下をクリックしてください。",
        "4点目: 千円札の左下をクリックしてください。",
        "5点目: 千円札の中央左をクリックしてください。",
        "6点目: 千円札の左上をクリックしてください。",
      ];

      updateMessage(redPointMessages[redPoints.length]);

      // 千円札の6点が完了したら次のステップへ
      if (redPoints.length === 5) {
        updateMessage("目的物の天面左上をクリックしてください。");
      }
    }
    // 目的物のポイント（6点）
    else if (bluePoints.length < 6) {
      setBluePoints([...bluePoints, { x, y }]);

      const bluePointMessages = [
        "天面右上をクリックしてください。",
        "天面右下をクリックしてください。",
        "天面左下をクリックしてください。",
        "側面左下をクリックしてください。",
        "側面右下をクリックしてください。",
      ];

      updateMessage(bluePointMessages[bluePoints.length]);

      if (bluePoints.length === 5) {
        updateMessage(
          <>
            すべての点が選択されました。
            <br />
            「計測を開始する」を押してください。
          </>
        );
        setIsReadyForMeasurement(true);
      }
    }
  };

  const startMeasurement = async () => {
    console.log("計測を開始します...");
    setIsLoading(true); // 計測開始時にローディング状態にする
    updateMessage("現在計測中です。少々お待ちください...");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const allPoints = [...redPoints, ...bluePoints];
      formData.append("points", JSON.stringify(allPoints)); // 12点を送信

      const response = await axios.post(
        "https://python-api-5yn6.onrender.com/process-3d-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        const {
          top_vertical,
          top_horizontal,
          side_height,
          top_area,
          side_area,
          volume,
        } = response.data;

        // レスポンスデータをメッセージとして更新
        updateMessage(
          <>
            計測結果:
            <br />
            天面の縦サイズ: ${top_vertical},<br />
            天面の横サイズ: ${top_horizontal},<br />
            側面の高さ: ${side_height},<br />
            天面面積: ${top_area},<br />
            側面面積: ${side_area},<br />
            体積: ${volume}
          </>
        );

        // resultに計測結果をセット
        setResult({
          top_vertical,
          top_horizontal,
          side_height,
          top_area,
          side_area,
          volume,
        });
      } else {
        updateMessage("計測が完了しましたが、結果が得られませんでした。");
      }
    } catch (error) {
      console.error("計測中にエラーが発生しました:", error);
      updateMessage("計測中にエラーが発生しました。");
    } finally {
      setIsLoading(false); // 計測完了後にローディングを解除
    }
  };
  const resetRedPoints = () => {
    // スケールポイントのみリセットし、測定ポイントは維持
    setRedPoints([]);
    updateMessage(
      <>
        スケールをリセットしました。
        <br />
        千円札の左上をクリックしてください。
      </>
    );
  };

  const resetBluePoints = () => {
    // 測定ポイントのみリセットし、スケールポイントは維持
    setBluePoints([]);
    updateMessage(
      <>
        測定ポイントをリセットしました。
        <br />
        目的物の片端をクリックしてください。
      </>
    );
  };

  const resetEverything = () => {
    setRedPoints([]);
    setBluePoints([]);
    updateMessage("画像をアップロードしてください。");
    setResult(null);
    setIsReadyForMeasurement(false);
    setImageSrc(null); // 画像もリセット
    setImageFile(null); // アップロードされたファイルもリセット
  };

  return (
    <div className="container">
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>ここに画像をドラッグ＆ドロップ、またはクリックしてファイルを選択</p>
      </div>
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
            <button className="sameResetButton" onClick={resetBluePoints}>
              同じ写真で別の部分を計測する
            </button>
          </div>
        )}

        {imageSrc && (
          <div className="controlButtonsContainer">
            <button
              className={
                redPoints.length === 0
                  ? "controlButton disabled"
                  : "controlButton"
              }
              onClick={resetRedPoints}
              disabled={redPoints.length === 0}
            >
              基準再測定
            </button>
            <button
              className={
                bluePoints.length === 0
                  ? "controlButton disabled"
                  : "controlButton"
              }
              onClick={resetBluePoints}
              disabled={bluePoints.length === 0}
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

          {/* 千円札の6点（赤） */}
          {redPoints.map((point, index) => (
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

          {/* 目的物の6点（青） */}
          {bluePoints.map((point, index) => (
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
          <svg className="svgOverlay">
            {/* 千円札の6点（赤の線） */}
            {redPoints.length > 1 &&
              redPoints.map((point, index) => {
                if (index === 0) return null;
                return (
                  <line
                    key={index}
                    x1={
                      redPoints[index - 1].x /
                      (imageRef.current.naturalWidth / imageRef.current.width)
                    }
                    y1={
                      redPoints[index - 1].y /
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

            {/* 目的物の6点（青の線） */}
            {bluePoints.length > 1 &&
              bluePoints.map((point, index) => {
                if (index === 0) return null;
                return (
                  <line
                    key={index}
                    x1={
                      bluePoints[index - 1].x /
                      (imageRef.current.naturalWidth / imageRef.current.width)
                    }
                    y1={
                      bluePoints[index - 1].y /
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
                    className="blueLine"
                  />
                );
              })}
            {/* 赤の最初と最後をつなぐ線 */}
            {redPoints.length === 6 && (
              <>
                <line
                  x1={
                    redPoints[5].x /
                    (imageRef.current.naturalWidth / imageRef.current.width)
                  }
                  y1={
                    redPoints[5].y /
                    (imageRef.current.naturalHeight / imageRef.current.height)
                  }
                  x2={
                    redPoints[0].x /
                    (imageRef.current.naturalWidth / imageRef.current.width)
                  }
                  y2={
                    redPoints[0].y /
                    (imageRef.current.naturalHeight / imageRef.current.height)
                  }
                  className="redLine"
                />
              </>
            )}
            {/* 天面の右下と側面の右下をつなぐ線 */}
            {bluePoints.length === 6 && (
              <>
                <line
                  x1={
                    bluePoints[5].x /
                    (imageRef.current.naturalWidth / imageRef.current.width)
                  }
                  y1={
                    bluePoints[5].y /
                    (imageRef.current.naturalHeight / imageRef.current.height)
                  }
                  x2={
                    bluePoints[2].x /
                    (imageRef.current.naturalWidth / imageRef.current.width)
                  }
                  y2={
                    bluePoints[2].y /
                    (imageRef.current.naturalHeight / imageRef.current.height)
                  }
                  className="blueLine"
                />

                {/* 側面の左下と天面の左下をつなぐ線 */}
                <line
                  x1={
                    bluePoints[0].x /
                    (imageRef.current.naturalWidth / imageRef.current.width)
                  }
                  y1={
                    bluePoints[0].y /
                    (imageRef.current.naturalHeight / imageRef.current.height)
                  }
                  x2={
                    bluePoints[3].x /
                    (imageRef.current.naturalWidth / imageRef.current.width)
                  }
                  y2={
                    bluePoints[3].y /
                    (imageRef.current.naturalHeight / imageRef.current.height)
                  }
                  className="blueLine"
                />
              </>
            )}
          </svg>
        </div>
      )}
      <div className="measurementLogs">
        {result && (
          <div className="measurementResult">
            <p>計測結果:</p>
            <ul>
              <li>天面の縦サイズ: {result.top_vertical} </li>
              <li>天面の横サイズ: {result.top_horizontal} </li>
              <li>側面の高さ: {result.side_height} </li>
              <li>天面面積: {result.top_area} </li>
              <li>側面面積: {result.side_area} </li>
              <li>体積: {result.volume} </li>
            </ul>
            <input
              type="text"
              placeholder="計測場所を入力"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
            />
            <button onClick={saveMeasurementLog}>メモ</button>
          </div>
        )}

        {/* 保存された計測結果を表示 */}
        <>
          <h3>計測履歴</h3>
          {measurementLogs.length > 0 ? (
            <ul>
              {measurementLogs.map((log, index) => (
                <li key={index}>
                  {log.location}: <br />縦 {log.top_vertical} , <br /> 横{" "}
                  {log.top_horizontal} , <br /> 高さ {log.side_height} , <br />
                  天面面積 {log.top_area} , <br /> 側面面積 {log.side_area} ,{" "}
                  <br />
                  体積 {log.volume}
                </li>
              ))}
            </ul>
          ) : (
            <p>計測履歴がありません</p>
          )}
        </>
      </div>
    </div>
  );
};

export default ThreeDMeasurement;
