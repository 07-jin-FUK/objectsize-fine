import React, { useState } from "react";

const Sidebar = ({
  openPopup,
  resetAll,
  resetCameraPosition,
  toggleSpaceLock,
  isSpaceLocked,
  isSingleSided,
  setIsSingleSided,
}) => {
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  const handleResetClick = () => {
    setShowResetConfirmation(true); // ポップアップを表示
  };

  const handleConfirmReset = () => {
    resetAll(); // オールリセット関数を実行
    setShowResetConfirmation(false); // ポップアップを閉じる
  };

  const handleCancelReset = () => {
    setShowResetConfirmation(false); // ポップアップを閉じる
  };

  return (
    <div className="sidebar">
      <h3 style={{ color: "white" }}>設定メニュー</h3>
      <button onClick={() => openPopup("size")}>空間のサイズ・操作・色</button>
      <button onClick={() => openPopup("objectSize")}>
        オブジェクトのサイズと色
      </button>
      <button onClick={() => openPopup("objectControl")}>
        オブジェクトの操作
      </button>
      <button onClick={() => openPopup("objectLog")}>オブジェクトログ</button>
      <button
        onClick={() => setIsSingleSided((prev) => !prev)}
        style={{
          background: isSingleSided
            ? "#27ae60"
            : "linear-gradient(to right, #27ae60 50%, #444 50%)",
          color: "white",
        }}
      >
        {isSingleSided ? "側面両面モードへ" : "側面片面モードへ"}
      </button>
      <button onClick={resetCameraPosition} style={{ backgroundColor: "blue" }}>
        オブジェクトを再描画
      </button>

      {/* 空間を固定/回転モード */}
      <div>
        <button
          onClick={() => isSpaceLocked && toggleSpaceLock()}
          style={{
            backgroundColor: isSpaceLocked ? "gray" : "green",
            color: "white",
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: "18px" }}>
            ドラッグ空間回転モード
          </span>
          <br />
          ベースモード
        </button>
        <button
          onClick={() => !isSpaceLocked && toggleSpaceLock()}
          style={{
            backgroundColor: !isSpaceLocked ? "gray" : "red",
            color: "white",
            marginRight: "5px",
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: "18px" }}>
            ドラッグ位置変更モード
          </span>
          <br />
          使用後は空間回転モードに
          <br />
          戻してください
        </button>
      </div>
      {/* オールリセットボタン（強調したスタイル） */}
      <button
        onClick={handleResetClick}
        style={{
          backgroundColor: "red",
          color: "white",
          fontWeight: "bold",
          marginTop: "20px",
        }}
      >
        オールリセット
      </button>

      {/* ポップアップ表示 */}
      {showResetConfirmation && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
            zIndex: 1000,
          }}
        >
          <p style={{ color: "red", fontSize: "18px", fontWeight: "bold" }}>
            現在のオブジェクト情報をすべてクリアし、初期状態に戻します。
            <br />
            よろしいですか？
          </p>
          <div className="yesno">
            <button className="yes-button" onClick={handleConfirmReset}>
              Yes
            </button>
            <button className="no-button" onClick={handleCancelReset}>
              No
            </button>
          </div>
        </div>
      )}

      {/* 背景のオーバーレイ */}
      {showResetConfirmation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={handleCancelReset}
        />
      )}
    </div>
  );
};

export default Sidebar;
