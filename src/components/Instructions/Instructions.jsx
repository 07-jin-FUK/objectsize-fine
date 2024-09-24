import React, { useState } from "react";

const Instructions = ({ mode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleInstructions = () => {
    setIsOpen(!isOpen);
  };

  // モードごとの説明文と撮影例を設定
  const getInstructionsText = () => {
    if (mode === "flat") {
      return (
        <div>
          <h2>平面サイズ測定モードの使い方</h2>
          <h3 style={{ color: "blue" }}>
            測りたい目的物と同じ平面上に千円札を置いた写真を撮ってください。
          </h3>
          <p>
            1.
            画像を下の点線枠内にドラッグ＆ドロップするか、クリックして選択してください。
          </p>
          <p>2. まず千円札の４つ角を画面の指示に従ってクリックしてください。</p>
          <p>
            3.
            スケールが設定されたら、測りたいオブジェクトの両端をクリックしてください。
          </p>
          <p>4. 計測開始を押すと目的物の長さを自動計算します。</p>
          <p style={{ color: "red" }}>
            注意点：測りたい長さのものと同じ高さに千円札を置いてください。
            <br />
            ※置き方や、写真の角度は問題ありませんが、
            <br />
            千円札を折り曲がている場合は計算結果に誤差が生じます。
          </p>

          {/* 撮影例 */}
          <div style={styles.imageRow}>
            <img
              src="/img/notepc.jpg"
              alt="撮影例"
              style={styles.exampleImage}
            />
            <span style={styles.arrow}>→</span>
            <img
              src="/img/notepcmark.jpg"
              alt="マーク例"
              style={styles.exampleImage}
            />
          </div>
        </div>
      );
    } else if (mode === "3D") {
      return (
        <div>
          <h2>3Dサイズ測定モードの使い方</h2>
          <h3 style={{ color: "blue" }}>
            測りたい目的物(立体物)の天面と側面を千円札の中心が天面と側面の間に来るように写真を撮ってください。
          </h3>
          <p>
            1.
            画像を下の点線枠内にドラッグ＆ドロップするか、クリックして選択してください。
          </p>
          <p>2. まず画面の指示に従って千円札を計6点クリックしてください。</p>
          <p>
            3.
            スケールが設定されたら、測りたいオブジェクトの天面4点その後側面下2点をクリックしてください。
          </p>
          <p>
            4.
            計測開始を押すと目的物の長さ（縦、横、高さ、天面積、側面積、体積）を自動計算します。
          </p>
          <p style={{ color: "red" }}>
            注意点：天面と側面にセットする千円札はきちんと半分に折り曲げて半分を天面に、半分が側面になるようにセットしてください。
            <br />
            ※写真を撮る角度は千円札全体が写っていればどのような撮り方でも問題ありません、
            <br />
            クリックする位置がずれると誤差が生じます。
          </p>

          {/* 撮影例 */}
          <div style={styles.imageRow}>
            <img src="/img/desk.jpg" alt="撮影例" style={styles.exampleImage} />
            <span style={styles.arrow}>→</span>
            <img
              src="/img/deskmark.jpg"
              alt="マーク例"
              style={styles.exampleImage}
            />
          </div>
        </div>
      );
    } else if (mode === "cylinder") {
      return (
        <div>
          <h2>3D円柱測定モードの使い方</h2>
          <h3 style={{ color: "blue" }}>
            測りたい目的物(円柱物)の天面と側面を千円札の中心が天面と側面の間に来るように写真を撮ってください。
          </h3>
          <p>
            1.
            画像を下の点線枠内にドラッグ＆ドロップするか、クリックして選択してください。
          </p>
          <p>2. まず画面の指示に従って千円札を計6点クリックしてください。</p>
          <p>
            3.
            スケールが設定されたら、測りたいオブジェクトの天面直径2点と直角方向下底側面下1点をクリックしてください。
          </p>
          <p>
            4.
            計測開始を押すと目的物の長さ（直径、天面積、高さ、側面積、体積）を自動計算します。
          </p>
          <p style={{ color: "red" }}>
            注意点：天面と側面にセットする千円札はきちんと半分に折り曲げて半分を天面に、半分が側面になるようにセットしてください。
            <br />
            ※写真を撮る角度は千円札全体が写っていればどのような撮り方でも問題ありません。
            <br />
            クリックする位置がずれると誤差が生じます。
          </p>
          <div style={styles.imageRow}>
            <img
              src="/img/sugarbox.jpg"
              alt="撮影例"
              style={styles.exampleImage}
            />
            <span style={styles.arrow}>→</span>
            <img
              src="/img/example3D_4.jpg"
              alt="マーク例"
              style={styles.exampleImage}
            />
          </div>
        </div>
      );
    } else {
      return <p>モードが選択されていません。</p>;
    }
  };

  return (
    <div style={styles.instructionsContainer}>
      <button onClick={toggleInstructions} style={styles.button}>
        {isOpen ? "使い方を閉じる" : "使い方を表示"}
      </button>
      {isOpen && <div style={styles.instructions}>{getInstructionsText()}</div>}
    </div>
  );
};

const styles = {
  instructionsContainer: {
    textAlign: "center",
    marginBottom: "20px",
    maxWidth: "800px",
    margin: "auto",
  },
  instructions: {
    padding: "10px",
    border: "1px solid #cccccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    marginTop: "10px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#007BFF",
    color: "#fff",
    marginBottom: "10px",
  },
  imageRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "10px",
  },
  exampleImage: {
    width: "200px",
    height: "auto",
    margin: "0 10px",
  },
  arrow: {
    fontSize: "24px",
    margin: "0 10px",
  },
};

export default Instructions;
