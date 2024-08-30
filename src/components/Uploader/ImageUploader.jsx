import React, { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import CategorySelector from "./CategorySelector";
import SubCategorySelector from "./SubCategorySelector";
import CustomSizeInput from "./CustomSizeInput";

const categories = {
  定規: ["10cm（標準）", "20cm（標準）"],
  紙幣: [
    "1000円札（15.5cm x 7.6cm）",
    "5000円札（15.6cm x 7.6cm）",
    "1万円札（16cm x 7.6cm）",
  ],
  硬貨: [
    "1円硬貨（直径2.0cm）",
    "5円硬貨（直径2.1cm）",
    "10円硬貨（直径2.3cm）",
    "50円硬貨/100円硬貨（直径2.5cm）",
    "500円硬貨（直径2.65cm）",
  ],
  カード類: [
    "クレジットカード/ICカード（8.56cm x 5.4cm）",
    "名刺（9.1cm x 5.5cm）",
  ],
  タバコの箱: [
    "タバコの箱（5.4cm x 8.6cm x 2.2cm）",
    "ライター（7.4cm x 2.5cm x 1.2cm）",
  ],
  その他: [], // カスタムサイズ用
};

const ImageUploader = () => {
  const [preview, setPreview] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [points, setPoints] = useState([]);
  const [scale, setScale] = useState(null);
  const [message, setMessage] = useState(
    "基準を設定します。基準となる物の片方の端をクリックしてください。"
  );
  const [measurements, setMeasurements] = useState([]);
  const [result, setResult] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [customSize, setCustomSize] = useState("");

  const imageRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      setDimensions({ width: img.width, height: img.height });
    }
  }, [preview]);

  const handleImageClick = (e) => {
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (scale === null && (selectedSubCategory || customSize)) {
      if (points.length < 2) {
        setPoints([...points, { x, y }]);

        if (points.length === 0) {
          setMessage("次にもう片方の端をクリックしてください。");
        } else if (points.length === 1) {
          const dx = x - points[0].x;
          const dy = y - points[0].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          setMeasurements([
            { x1: points[0].x, y1: points[0].y, x2: x, y2: y, distance: "" },
          ]);

          setTimeout(() => {
            const scaleLength = selectedSubCategory
              ? selectedSubCategory.match(/\d+(\.\d+)?/g)[0]
              : customSize;
            setScale(distance / parseFloat(scaleLength));
            setMessage(
              "基準値を認識しました。次に計測したい片方の端をクリックしてください。"
            );
            setPoints([]);
            setMeasurements([]);
          }, 100);
        }
      }
    } else if (scale !== null) {
      if (points.length === 0) {
        setPoints([{ x, y }]);
        setMessage("もう片方の端をクリックして計測を完了してください。");
      } else {
        const dx = x - points[0].x;
        const dy = y - points[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const realDistance = (distance / scale).toFixed(2);

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
        setPoints([]);
      }
    } else {
      setMessage("最初に基準スケールを選択してください。");
    }
  };

  const handleCustomSizeChange = (size) => {
    const validSize = size > 0 ? size : "";
    setCustomSize(validSize);
    setSelectedSubCategory(`入力サイズ ${validSize} cm`);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div style={styles.container}>
      {selectedSubCategory && (
        <p style={styles.selectedItem}>比較対象: {selectedSubCategory}</p>
      )}

      <CategorySelector
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
      />

      {selectedCategory &&
        selectedCategory !== "その他" &&
        categories[selectedCategory] && (
          <SubCategorySelector
            category={selectedCategory}
            onSubCategorySelect={setSelectedSubCategory}
            selectedSubCategory={selectedSubCategory}
            categories={categories}
          />
        )}

      {selectedCategory === "その他" && (
        <CustomSizeInput
          customSize={customSize}
          onCustomSizeChange={handleCustomSizeChange}
        />
      )}

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
          <p style={styles.message}>{message}</p>
          {scale && (
            <p>基準スケール設定完了: 1ピクセル = {scale.toFixed(2)} cm</p>
          )}
          {result && <p style={styles.result}>{result}</p>}
          <p>選択中の画像:</p>
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
    width: "100%",
  },
  selectedItem: {
    fontWeight: "bold",
    fontSize: "1.2em",
    color: "#333",
    marginBottom: "20px",
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
  previewContainer: {
    textAlign: "center",
    width: "100%",
    maxWidth: "1000px",
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
