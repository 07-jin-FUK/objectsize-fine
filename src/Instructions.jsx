import React from "react";

const Instructions = () => {
  return (
    <div style={styles.instructions}>
      <h2>使い方</h2>
      <h3 style={{ color: "blue" }}>
        サイズ比較候補：定規・紙幣・硬貨・カード類・名刺・タバコの箱
      </h3>
      <p>
        1.
        上のサイズ比較候補の中からお持ちのアイテムを確認し測定したいオブジェクトと同距離で写真を撮影してください。
      </p>
      <p>
        2.
        下の「画像をドラッグ＆ドロップするか、クリックして選択」のエリアに画像をアップロードします。
      </p>
      <p>
        3.
        次に、基準となる物（定規や1000円札）の両端をクリックして、基準スケールを設定します。
      </p>
      <p>
        4.
        スケールが設定されたら、測りたいオブジェクトの両端をクリックして長さを計測します。
      </p>
    </div>
  );
};

const styles = {
  instructions: {
    textAlign: "center",
    marginBottom: "20px",
    maxWidth: "800px",
    margin: "auto",
    padding: "10px",
    border: "1px solid #cccccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
};

export default Instructions;
