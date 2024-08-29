import React, { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";

const ImageUploader = () => {
  const [preview, setPreview] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [points, setPoints] = useState([]);
  const [scale, setScale] = useState(null);
  const [message, setMessage] = useState(
    "基準を設定します。基準となる物の片方の端をクリックしてください。"
  );
  const [measurements, setMeasurements] = useState([]); // 複数の計測結果を保持
  const [result, setResult] = useState(null); // 計測結果を保持
  const [selectedScale, setSelectedScale] = useState(null); // 選択された基準スケール
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

    if (scale === null && selectedScale !== null) {
      // 基準スケールが選択されている場合にのみ進行
      if (points.length < 2) {
        setPoints([...points, { x, y }]);

        if (points.length === 0) {
          setMessage("次にもう片方の端をクリックしてください。");
        } else if (points.length === 1) {
          const dx = x - points[0].x;
          const dy = y - points[0].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // 一時的に線を描画
          setMeasurements([
            { x1: points[0].x, y1: points[0].y, x2: x, y2: y, distance: "" },
          ]);

          setTimeout(() => {
            const scaleLength = selectedScale; // 選択された基準スケールを使用
            setScale(distance / parseFloat(scaleLength));
            setMessage(
              "基準値を認識しました。次に計測したい片方の端をクリックしてください。"
            );
            setPoints([]); // ポイントをリセットして次の計測に備える
            setMeasurements([]); // 線をリセット
          }, 100); // 少し待ってから処理を進める
        }
      }
    } else if (scale !== null) {
      // 基準スケールが設定されている場合の計測処理
      if (points.length === 0) {
        setPoints([{ x, y }]);
        setMessage("もう片方の端をクリックして計測を完了してください。");
      } else {
        const dx = x - points[0].x;
        const dy = y - points[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const realDistance = (distance / scale).toFixed(2);

        // 計測結果を表示
        setResult(`計測結果: ${realDistance} cm`);

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
    } else {
      setMessage("最初に基準スケールを選択してください。");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleScaleChange = (e) => {
    setSelectedScale(e.target.value);
    setMessage(
      `基準スケール: ${e.target.value} cmが選択されました。<br>画像内の基準の片方の端をクリックしてください。`
    );
  };

  return (
    <div style={styles.container}>
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>ここにドロップして画像をアップロード</p>
        ) : (
          <p>画像をドラッグ＆ドロップするか、クリックして選択</p>
        )}
      </div>
      <div style={styles.scaleSelector}>
        <label>
          <input
            type="radio"
            name="scale"
            value="10"
            onChange={handleScaleChange}
          />
          定規（10cm）
        </label>
        <label>
          <input
            type="radio"
            name="scale"
            value="15.5"
            onChange={handleScaleChange}
          />
          1000円札（15.5cm）
        </label>
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
                    {measurement.distance} cm
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
            <p>基準スケール設定完了: 1ピクセル = {scale.toFixed(2)} cm</p>
          )}
          {result && <p style={styles.result}>{result}</p>}
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
    justifyContent: "center",
    textAlign: "center",
    minHeight: "100vh",
    width: "100%", // 幅を100%に設定して、中央揃えにする
  },
  dropzone: {
    border: "2px dashed #cccccc",
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "20px",
    width: "80%",
    maxWidth: "1000px", // 最大幅を設定して中央揃えを維持
  },
  scaleSelector: {
    marginBottom: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  previewContainer: {
    textAlign: "center",
    width: "100%", // 全体を中央に揃えるため幅を100%に設定
    maxWidth: "1000px", // 最大幅を設定して中央揃えを維持
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
    maxWidth: "80%",
    margin: "auto",
  },
  result: {
    fontWeight: "bold",
    color: "green",
    marginTop: "20px",
  },
};

export default ImageUploader;
