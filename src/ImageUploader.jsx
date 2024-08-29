import React, { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";

const ImageUploader = () => {
  const [preview, setPreview] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [points, setPoints] = useState([]);
  const [scale, setScale] = useState(null);
  const [message, setMessage] = useState(
    "参考定規の1点目をクリックしてください。"
  );
  const [measurements, setMeasurements] = useState([]); // 複数の計測結果を保持
  const [result, setResult] = useState(null); // 計測結果を保持
  const imageRef = useRef(null); // 画像要素への参照

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = () => {
      setPreview(reader.result); // 画像プレビュー用のURLを設定
    };

    reader.readAsDataURL(file); // ファイルをData URLに変換
  }, []);

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      setDimensions({ width: img.width, height: img.height });
    }
  }, [preview]); // 画像プレビューが設定された後に位置を取得

  const handleImageClick = (e) => {
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (scale === null) {
      // 基準スケールが設定されていない場合の処理
      if (points.length < 2) {
        setPoints([...points, { x, y }]);

        if (points.length === 0) {
          setMessage("次に参考定規の2点目をクリックしてください。");
        } else if (points.length === 1) {
          const dx = x - points[0].x;
          const dy = y - points[0].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // 一時的に線を描画
          setMeasurements([
            { x1: points[0].x, y1: points[0].y, x2: x, y2: y, distance: "" },
          ]);

          setTimeout(() => {
            const scaleLength = prompt(
              "定規の長さ（実際の寸法）を入力してください（例：10 cm）:"
            );
            if (scaleLength) {
              setScale(distance / parseFloat(scaleLength));
              setMessage(
                "基準スケールが設定されました。次に計測したい2点をクリックしてください。"
              );
              setPoints([]); // ポイントをリセットして次の計測に備える
              setMeasurements([]); // 線をリセット
            }
          }, 100); // 少し待ってからポップアップを表示
        }
      }
    } else {
      // 基準スケールが設定されている場合の計測処理
      if (points.length === 0) {
        setPoints([{ x, y }]);
        setMessage("次の点をクリックして計測を完了してください。");
      } else {
        const dx = x - points[0].x;
        const dy = y - points[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const realDistance = (distance / scale).toFixed(2);

        // 計測結果を表示
        setResult(`計測結果: ${realDistance} 単位`);

        setMeasurements([
          ...measurements,
          {
            x1: points[0].x,
            y1: points[0].y,
            x2: x,
            y2: y,
            distance: realDistance,
          },
        ]);
        setMessage("計測が完了しました。次の2点をクリックして再計測できます。");
        setPoints([]); // ポイントをリセットして次の計測に備える
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>ここにドロップして画像をアップロード</p>
        ) : (
          <p>画像をドラッグ＆ドロップするか、クリックして選択</p>
        )}
      </div>
      {preview && (
        <div style={styles.previewContainer}>
          <p>プレビュー:</p>
          <div style={styles.imageContainer}>
            <img
              ref={imageRef}
              src={preview}
              alt="preview"
              style={styles.previewImage}
              onClick={handleImageClick}
            />
            {points.map((point, index) => (
              <div
                key={index}
                style={{
                  ...styles.pointMarker,
                  left: point.x - 5,
                  top: point.y - 5,
                }}
              />
            ))}
            {measurements.map((measurement, index) => (
              <svg key={index} style={styles.line}>
                <line
                  x1={measurement.x1}
                  y1={measurement.y1}
                  x2={measurement.x2}
                  y2={measurement.y2}
                  style={{ stroke: "green", strokeWidth: 2 }}
                />
                {measurement.distance && (
                  <text
                    x={(measurement.x1 + measurement.x2) / 2}
                    y={(measurement.y1 + measurement.y2) / 2 - 5}
                    fill="green"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {measurement.distance} 単位
                  </text>
                )}
              </svg>
            ))}
          </div>
          <p>
            画像サイズ: {dimensions.width} x {dimensions.height} ピクセル
          </p>
          <p style={styles.message}>{message}</p>
          {scale && (
            <p>基準スケール設定完了: 1ピクセル = {scale.toFixed(2)} 単位</p>
          )}
          {result && <p style={styles.result}>{result}</p>}
        </div>
      )}
    </div>
  );
};

const styles = {
  dropzone: {
    border: "2px dashed #cccccc",
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "20px",
  },
  previewContainer: {
    textAlign: "center",
  },
  imageContainer: {
    position: "relative",
    display: "inline-block",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "500px",
    cursor: "crosshair",
  },
  pointMarker: {
    position: "absolute",
    width: "10px",
    height: "10px",
    backgroundColor: "red",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
  },
  line: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
  },
  message: {
    fontWeight: "bold",
    color: "blue",
  },
  result: {
    fontWeight: "bold",
    color: "green",
    marginTop: "20px",
  },
};

export default ImageUploader;
