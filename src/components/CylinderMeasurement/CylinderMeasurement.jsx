import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import "./CylinderMeasurement.css"; // 新しいスタイルを用意

const CylinderMeasurement = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [redPoints, setRedPoints] = useState([]); // 千円札のポイント（赤）
  const [bluePoints, setBluePoints] = useState([]); // 目的物のポイント（青）
  const [message, updateMessage] = useState("画像をアップロードしてください。");
  const [isReadyForMeasurement, setIsReadyForMeasurement] = useState(false);
  const imageRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null); // 計測結果
  const [measurementLogs, setMeasurementLogs] = useState(
    JSON.parse(localStorage.getItem("cylinderLogs")) || []
  );

  const [currentLocation, setCurrentLocation] = useState(""); // 入力ボックスの値を管理
  const [isLoading, setIsLoading] = useState(false); // ローディング状態を追加

  // 計測結果を保存する機能
  const saveMeasurementLog = () => {
    if (!currentLocation) {
      alert("計測場所を入力してください。");
      return;
    }

    const newLog = {
      id: Date.now(), // 一意のIDを追加
      location: currentLocation,
      diameter: result?.diameter || "N/A",
      height: result?.height || "N/A",
      topArea: result?.top_area || "N/A",
      sideArea: result?.side_area || "N/A",
      volume: result?.volume || "N/A",
    };

    const updatedLogs = [...measurementLogs, newLog];
    setMeasurementLogs(updatedLogs);
    localStorage.setItem("cylinderLogs", JSON.stringify(updatedLogs));
    setCurrentLocation("");
  };

  const deleteLog = (id) => {
    const updatedLogs = measurementLogs.filter((log) => log.id !== id);
    setMeasurementLogs(updatedLogs);
    localStorage.setItem("cylinderLogs", JSON.stringify(updatedLogs));
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
        "2点目: 千円札の右中央をクリックしてください。",
        "3点目: 千円札の右下をクリックしてください。",
        "4点目: 千円札の左下をクリックしてください。",
        "5点目: 千円札の左中央をクリックしてください。",
        "6点目: 千円札の左上をクリックしてください。",
      ];

      updateMessage(redPointMessages[redPoints.length]);

      if (redPoints.length === 5) {
        updateMessage(
          "目的物の円柱千円札の中央からの対角をクリックしてください。"
        );
      }
    }
    // 目的物（円柱）のポイント（3点）
    else if (bluePoints.length < 3) {
      setBluePoints([...bluePoints, { x, y }]);

      const bluePointMessages = [
        "千円札の中央をクリックしてください。",
        "千円札の中央からの真下の底をクリックしてください。",
      ];

      updateMessage(bluePointMessages[bluePoints.length]);

      if (bluePoints.length === 2) {
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
    console.log("円柱の計測を開始します...");
    setIsLoading(true); // 計測開始時にローディング状態にする
    updateMessage("現在計測中です。少々お待ちください...");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const allPoints = [...redPoints, ...bluePoints];
      formData.append("points", JSON.stringify(allPoints)); // 9点を送信（千円札6点 + 目的物3点）

      const response = await axios.post(
        "https://python-api-5yn6.onrender.com/process-cylinder-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        const { diameter, height, top_area, side_area, volume } = response.data;

        // レスポンスデータをメッセージとして更新
        updateMessage(
          <>
            計測結果:（問題なければメモボタン推奨）
            <br />
            直径: {diameter}
            <br />
            高さ: {height}
            <br />
            天面積: {top_area}
            <br />
            側面積: {side_area}
            <br />
            体積: {volume}
          </>
        );

        // resultに計測結果をセット
        setResult({
          diameter,
          height,
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

  const calculateMidpoint = (point1, point2) => {
    return {
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2,
    };
  };

  // 中央のポイントを自動計算してbluePointsに追加する
  useEffect(() => {
    if (redPoints.length === 6) {
      // redPoints[1]（右中央）とredPoints[4]（左中央）の中間を計算
      const centerPoint = calculateMidpoint(redPoints[1], redPoints[4]);
      setBluePoints([centerPoint]); // bluePoints[0]として追加

      // メッセージを更新
      updateMessage(
        "千円札の中心点が自動的にマークされました。次に、直径を測るための点をマークしてください。"
      );

      // 点線を描画するためにbluePoints[0]を基準にする
    }
  }, [redPoints]);

  // 実線を描画する関数
  const renderSolidLines = () => {
    return (
      <>
        {/* bluePoints[0]とbluePoints[1]をつなぐ実線 */}
        {bluePoints.length >= 2 && (
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
              bluePoints[1].x /
              (imageRef.current.naturalWidth / imageRef.current.width)
            }
            y2={
              bluePoints[1].y /
              (imageRef.current.naturalHeight / imageRef.current.height)
            }
            className="blueLine" // 実線用のクラス
          />
        )}

        {/* bluePoints[0]とbluePoints[2]をつなぐ実線 */}
        {bluePoints.length >= 3 && (
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
              bluePoints[2].x /
              (imageRef.current.naturalWidth / imageRef.current.width)
            }
            y2={
              bluePoints[2].y /
              (imageRef.current.naturalHeight / imageRef.current.height)
            }
            className="blueLine" // 実線用のクラス
          />
        )}
      </>
    );
  };

  // 点線を描画する関数
  const renderDottedLines = () => {
    if (bluePoints.length >= 1) {
      // 点線を常に表示する
      const imageWidth = imageRef.current.width;
      const imageHeight = imageRef.current.height;

      // 方向ベクトルを計算し、そのベクトルを画像端またはそれを超えて延長する
      const extendLineBeyondImage = (start, midpoint, factor = 2) => {
        const directionX = midpoint.x - start.x;
        const directionY = midpoint.y - start.y;

        // 延長するために倍数を掛ける (factorで画像を超えて延長)
        const xEnd = start.x + directionX * factor; // factor倍の長さまで延長
        const yEnd = start.y + directionY * factor;

        return { x: xEnd, y: yEnd };
      };

      // 千円札の中間点を計算
      const midpoint1 = calculateMidpoint(redPoints[0], redPoints[5]);
      const midpoint2 = calculateMidpoint(redPoints[2], redPoints[3]);

      // 点線1（bluePoints[0]からmidpoint1へ、さらに画像を超えて延長）
      const end1 = extendLineBeyondImage(
        bluePoints[0],
        midpoint1,
        20 // 画像の外まで延長するための倍数を設定
      );

      // 点線2（bluePoints[0]からmidpoint2へ、画像端まで延長）
      const end2 = extendLineBeyondImage(
        bluePoints[0],
        midpoint2,
        20 // 同様に画像の外まで延長
      );

      return (
        <>
          {/* 点線1 (bluePoints[0]からmidpoint1に向かって画像端を超えて延長) */}
          <line
            x1={bluePoints[0].x / (imageRef.current.naturalWidth / imageWidth)}
            y1={
              bluePoints[0].y / (imageRef.current.naturalHeight / imageHeight)
            }
            x2={end1.x / (imageRef.current.naturalWidth / imageWidth)}
            y2={end1.y / (imageRef.current.naturalHeight / imageHeight)}
            className="blueDottedLine" // 点線用のクラス
            strokeDasharray="5,5"
          />

          {/* 点線2 (bluePoints[0]からmidpoint2に向かって画像端を超えて延長) */}
          <line
            x1={bluePoints[0].x / (imageRef.current.naturalWidth / imageWidth)}
            y1={
              bluePoints[0].y / (imageRef.current.naturalHeight / imageHeight)
            }
            x2={end2.x / (imageRef.current.naturalWidth / imageWidth)}
            y2={end2.y / (imageRef.current.naturalHeight / imageHeight)}
            className="blueDottedLine" // 点線用のクラス
            strokeDasharray="5,5"
          />
        </>
      );
    }
    return null;
  };

  const resetRedPoints = () => {
    setRedPoints([]);
    setBluePoints([]); //スケールをもとにｂの0点をつくるから
    updateMessage(
      <>
        スケールをリセットしました。
        <br />
        千円札の左上をクリックしてください。
      </>
    );
  };

  const resetBluePoints = () => {
    if (bluePoints.length > 0) {
      setBluePoints([bluePoints[0]]); // bluePointsの0番目の点だけを残してリセット
    }
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
            <input
              type="text"
              placeholder="計測場所を入力"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
            />
            <button className="memoButton" onClick={saveMeasurementLog}>
              メモ
            </button>
            <button className="allResetButton" onClick={resetEverything}>
              写真を変更する
            </button>
            <button className="sameResetButton" onClick={resetBluePoints}>
              別の部分を計測する
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

          {/* 円柱のポイント（青） */}
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

          <svg className="svgOverlay">
            {/* 赤の実線の描画 */}
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

            {/* 赤の最初と最後をつなぐ線 */}
            {redPoints.length === 6 && (
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
            )}

            {/* 点線の描画 */}
            {renderDottedLines()}

            {/* 実線の描画 */}
            {renderSolidLines()}
          </svg>
        </div>
      )}
      <div className="measurementLogs">
        <>
          <h3>計測履歴</h3>
          {measurementLogs.length > 0 ? (
            <ul>
              {measurementLogs.map((log, index) => (
                <li key={index}>
                  {log.location}: <br />
                  直径 {log.diameter} , <br /> 高さ {log.height} , <br /> 天面積{" "}
                  {log.topArea} , <br /> 側面積 {log.sideArea} , <br /> 体積{" "}
                  {log.volume}
                  <button onClick={() => deleteLog(log.id)}>削除</button>
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

export default CylinderMeasurement;
