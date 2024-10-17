import React, { useState } from "react";
import ImagePopup from "./ImagePopup";
import axios from "axios";

const Sidebar = ({
  openPopup,
  resetAll,
  resetCameraPosition,
  toggleSpaceLock,
  isSpaceLocked,
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
  const [isPopupOpen, setIsPopupOpen] = useState(false); // ポップアップ表示状態を管理
  const [imageDataURL, setImageDataURL] = useState(""); // 生成した画像のURLを保存
  const [showSaveButton, setShowSaveButton] = useState(false); // 保存ボタン表示用の状態を定義

  // 天面図を表示した時に保存ボタンを表示
  const handleShowTopView = () => {
    setTopViewCamera(); // 天面図を表示
    setShowSaveButton(true); // 保存ボタンを表示
  };

  // 保存ボタンが押された時の処理
  const handleSaveTopView = () => {
    saveTopViewAsImage(); // 天面図を保存
  };

  const handleShowBWPopup = () => {
    const canvas = drawTopViewCanvasBW(); // 白黒天面図を生成
    const dataURL = canvas.toDataURL("image/png");
    setImageDataURL(dataURL);
    setIsPopupOpen(true); // ポップアップを表示
  };

  const handleShowColorPopup = () => {
    const canvas = drawTopViewCanvasColor(); // カラー天面図を生成
    const dataURL = canvas.toDataURL("image/png");
    setImageDataURL(dataURL);
    setIsPopupOpen(true); // ポップアップを表示
  };

  const handleSaveImage = () => {
    const link = document.createElement("a");
    link.href = imageDataURL;
    link.download = "top_view.png";
    link.click();
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false); // ポップアップを閉じる
  };
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
      <button onClick={handleShowTopView}>天面図を確認</button>
      {showSaveButton && (
        <button style={{ backgroundColor: "red" }} onClick={handleSaveTopView}>
          天面図を保存
        </button>
      )}
      <button onClick={saveCurrentViewAsImage}>現在のビューを保存</button>{" "}
      <button onClick={handleShowBWPopup}>白黒天面図(サイズ込)</button>
      <button onClick={handleShowColorPopup}>カラー天面図(サイズ込)</button>
      <ImagePopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        imageDataURL={imageDataURL}
        onSave={handleSaveImage}
      />
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
