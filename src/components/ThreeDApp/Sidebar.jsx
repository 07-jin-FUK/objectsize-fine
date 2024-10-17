import React, { useState } from "react";
import "./ThreeDApp.css";

const Sidebar = ({
  openPopup,
  resetAll,
  resetCameraPosition,
  isSingleSided,
  setIsSingleSided,
  resetToInitialPositions,
  setTopViewCamera,
  saveTopViewAsImage,
  saveCurrentViewAsImage,
  drawTopViewCanvasBW,
  drawTopViewCanvasColor,
  handleBackToTop,
  loggedInUser,
  handleLogout,
  openLoginModal,
  handleSaveAll,
  handleLoadAll,
}) => {
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 天面図ポップアップの状態
  const [imageDataURL, setImageDataURL] = useState(""); // 天面図のURL保存用
  const [popupType, setPopupType] = useState(""); // ポップアップの種類を保持

  // 天面図を生成してポップアップを表示する関数
  const handleShowPopup = (type) => {
    const canvas =
      type === "bw" ? drawTopViewCanvasBW() : drawTopViewCanvasColor();
    const dataURL = canvas.toDataURL("image/png");
    setImageDataURL(dataURL); // 生成した画像URLをセット
    setPopupType(type); // ポップアップの種類を保存（白黒 or カラー）
    setIsPopupOpen(true); // ポップアップを表示
  };

  const handleSaveImage = () => {
    const link = document.createElement("a");
    link.href = imageDataURL;
    link.download =
      popupType === "bw" ? "top_view_bw.png" : "top_view_color.png";
    link.click();
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false); // ポップアップを閉じる
  };

  const handleResetClick = () => {
    setShowResetConfirmation(true); // リセット確認モーダルを表示
  };

  const handleConfirmReset = () => {
    resetAll(); // オールリセットを実行
    setShowResetConfirmation(false); // モーダルを閉じる
  };

  const handleCancelReset = () => {
    setShowResetConfirmation(false); // モーダルを閉じる
  };

  return (
    <div className="sidebar">
      <h3 style={{ color: "white" }}>設定メニュー</h3>
      <button onClick={handleBackToTop}>トップに戻る</button>
      {loggedInUser ? (
        <button onClick={handleLogout}>ログアウト</button>
      ) : (
        <button onClick={openLoginModal}>ログイン</button>
      )}
      <button onClick={handleSaveAll}>ファイルを新規保存・上書き</button>
      <button onClick={handleLoadAll}>ファイルを読み込む</button>
      <button onClick={() => openPopup("size")}>空間のサイズ・操作・色</button>
      <button onClick={() => openPopup("objectSize")}>オブジェクト生成</button>
      <button onClick={() => openPopup("objectControl")}>
        オブジェクト操作
      </button>
      <button onClick={() => openPopup("importLog")}>
        サイズ測定からインポート
      </button>
      <button onClick={() => openPopup("objectLog")}>オブジェクトログ</button>
      <button onClick={resetToInitialPositions}>空間を元の位置に戻す</button>
      <button onClick={() => handleShowPopup("bw")}>白黒天面図を表示</button>
      <button onClick={() => handleShowPopup("color")}>
        カラー天面図を表示
      </button>

      <button onClick={resetCameraPosition} style={{ backgroundColor: "blue" }}>
        オブジェクトを再描画
      </button>
      <div className="fixbutton">
        <button
          className="changeside"
          onClick={() => setIsSingleSided((prev) => !prev)}
          style={{
            background: isSingleSided
              ? "#27ae60"
              : "linear-gradient(to right, #27ae60 50%, #444 50%)",
            color: "white",
          }}
        >
          {isSingleSided ? "側面を両面にする" : "側面を片面にする"}
        </button>
        <button
          className="reartobject"
          onClick={resetCameraPosition}
          style={{ backgroundColor: "blue" }}
        >
          オブジェクトを再描画
        </button>
      </div>
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
      {isPopupOpen && (
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
          <img src={imageDataURL} alt="天面図" />
          <div className="yesno">
            <button className="yes-button" onClick={handleSaveImage}>
              画像を保存
            </button>
            <button className="no-button" onClick={handleClosePopup}>
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 背景のオーバーレイ */}
      {isPopupOpen && (
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
          onClick={handleClosePopup}
        />
      )}

      {/* リセット確認モーダル */}
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
