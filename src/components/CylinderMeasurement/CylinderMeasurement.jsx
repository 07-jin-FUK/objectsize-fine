import React, { useState, useRef } from "react";
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

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setRedPoints([]); // 千円札ポイントをリセット
      setBluePoints([]); // 目的物ポイントをリセット
      updateMessage("1点目：千円札の左上をクリックしてください。");
      setIsReadyForMeasurement(false);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // 画像上でクリックして位置を取得
  const handleImageClick = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // 千円札のポイント（6点）
    if (redPoints.length < 6) {
      setRedPoints([...redPoints, { x, y }]);

      const redPointMessages = [
        "2点目: 千円札の中央上をクリックしてください。",
        "3点目: 千円札の右上をクリックしてください。",
        "4点目: 千円札の右下をクリックしてください。",
        "5点目: 千円札の中央下をクリックしてください。",
        "6点目: 千円札の左下をクリックしてください。",
      ];

      updateMessage(redPointMessages[redPoints.length]);

      if (redPoints.length === 5) {
        updateMessage("目的物の円柱の直径の左端をクリックしてください。");
      }
    }
    // 目的物（円柱）のポイント（3点）
    else if (bluePoints.length < 3) {
      setBluePoints([...bluePoints, { x, y }]);

      const bluePointMessages = [
        "円柱の直径の右端をクリックしてください。",
        "円柱直径右端の真下の底をクリックしてください。",
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
        updateMessage(`計測結果:
          直径: ${diameter},
          高さ: ${height},
          天面積: ${top_area},
          側面積: ${side_area},
          体積: ${volume}
        `);
      } else {
        updateMessage("計測が完了しましたが、結果が得られませんでした。");
      }
    } catch (error) {
      console.error("計測中にエラーが発生しました:", error);
      updateMessage("計測中にエラーが発生しました。");
    }
  };

  return (
    <div className="container">
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>ここに画像をドラッグ＆ドロップ、またはクリックしてファイルを選択</p>
      </div>
      <div className="messageContainer">
        <p>{message}</p>
        {isReadyForMeasurement && (
          <button className="measureButton" onClick={startMeasurement}>
            計測開始
          </button>
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

          {/* 円柱の3点（青） */}
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
          </svg>
        </div>
      )}
    </div>
  );
};

export default CylinderMeasurement;
