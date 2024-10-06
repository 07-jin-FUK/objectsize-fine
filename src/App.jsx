import React, { useState } from "react";
import Title from "./components/Common/Title";
import SizeMeasurement from "./components/ThreeD/SizeMeasurement";
import ThreeDMeasurement from "./components/NewThreeD/ThreeDMeasurement";
import CylinderMeasurement from "./components/CylinderMeasurement/CylinderMeasurement";
import Instructions from "./components/Instructions/Instructions";
import "./App.css";

import { DataStorageProvider } from "./components/DataStorage/DataStorage";
import Login from "./components/Login/Login";
import ThreeDApp from "./components/ThreeDApp/ThreeDapp";
import Register from "./components/Login/Register";
import Modal from "./components/Login/Modal";

function App() {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  const openLoginModal = () => setLoginOpen(true);
  const closeLoginModal = () => setLoginOpen(false);

  const openRegisterModal = () => setRegisterOpen(true);
  const closeRegisterModal = () => setRegisterOpen(false);
  const [mode, setMode] = useState(null); // メインモード選択用
  const [subMode, setSubMode] = useState(null); // サブモード選択用
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // ログアウトモーダルの状態
  const [logoutMessage, setLogoutMessage] = useState(""); // ログアウトメッセージ

  const handleBackToTop = () => {
    setMode(null); // メインモード選択画面に戻る
    setSubMode(null); // サブモード選択をリセット
  };

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
    setSubMode(null); // 新しいモードを選択したときにサブモードをリセット
  };

  const handleSubModeSelection = (selectedSubMode) => {
    setSubMode(selectedSubMode);
  };

  const handleLogout = () => {
    setLoggedInUser(null); // ログインユーザーをリセット
    localStorage.removeItem("token"); // トークンを削除
    // ログアウト完了モーダルを表示
    setLogoutMessage("ログアウト完了しました。お疲れさまでした。");
    setIsLogoutModalOpen(true);

    // 2秒後にモーダルを閉じる
    setTimeout(() => {
      setIsLogoutModalOpen(false);
      setLogoutMessage(""); // メッセージリセット
    }, 2000);
  };

  return (
    <DataStorageProvider>
      <div className="App">
        {/* ログイン状態の表示 */}
        <div className="login-status">
          {loggedInUser ? (
            <p>
              こんにちわ、
              <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                {loggedInUser}
              </span>
              さん
            </p>
          ) : (
            <p>こんにちわ、ゲストさん</p>
          )}
        </div>
        {loggedInUser ? (
          <button onClick={handleLogout} className="logout-button">
            ログアウト
          </button>
        ) : (
          <div className="auth-buttons">
            <button onClick={openLoginModal} className="login-button">
              ログイン
            </button>
            <button onClick={openRegisterModal} className="register-button">
              新規会員登録
            </button>
          </div>
        )}

        <Modal isOpen={isLoginOpen} onClose={closeLoginModal}>
          <Login
            setLoggedInUser={setLoggedInUser}
            closeLoginModal={closeLoginModal}
          />
        </Modal>
        {/* 新規登録モーダル */}
        <Modal isOpen={isRegisterOpen} onClose={closeRegisterModal}>
          <Register
            closeRegisterModal={closeRegisterModal}
            openLoginModal={openLoginModal}
          />
        </Modal>

        {/* ログアウト完了モーダル */}
        <Modal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
        >
          <p>{logoutMessage}</p>
        </Modal>
        {/* modeが "3dapp" ではない場合に Title を表示 */}
        {mode !== "3dapp" && <Title />}

        {/* トップ画面に戻るボタン */}
        {mode && (
          <div className="button-container">
            <button onClick={handleBackToTop} className="top-button">
              トップ画面に戻る
            </button>
          </div>
        )}

        {/* メインモード選択画面（セクション形式） */}
        {!mode && (
          <div className="mode-selection-container">
            <div
              className="mode-selection-section"
              onClick={() => handleModeSelection("measurement")}
            >
              <img
                src="/img/size.jpg"
                alt="サイズ測定アプリ"
                className="mode-image"
              />
              <h2>サイズ測定</h2>
            </div>
            <div
              className="mode-selection-section"
              onClick={() => handleModeSelection("3dapp")}
            >
              <img
                src="/img/room.jpg"
                alt="引っ越し・模様替えモード"
                className="mode-image"
              />
              <h2>引っ越し・模様替えモード</h2>
            </div>
          </div>
        )}

        {/* 新しい3Dアプリを表示 */}
        {mode === "3dapp" && <ThreeDApp handleBackToTop={handleBackToTop} />}

        {/* サイズ測定アプリのモード選択 */}
        {mode === "measurement" && !subMode && (
          <div className="mode-selection-container">
            <div
              className="mode-selection-section"
              onClick={() => handleSubModeSelection("flat")}
            >
              <img
                src="/img/senen.jpg"
                alt="平面サイズ測定"
                className="mode-image"
              />
              <h2>千円札で長さを測る</h2>
            </div>
            <div
              className="mode-selection-section"
              onClick={() => handleSubModeSelection("3D")}
            >
              <img
                src="/img/rittai.jpg"
                alt="立体サイズ測定（キューブ）"
                className="mode-image"
              />
              <h2>千円札で立体サイズを測る</h2>
            </div>
            <div
              className="mode-selection-section"
              onClick={() => handleSubModeSelection("cylinder")}
            >
              <img
                src="/img/tire.jpg"
                alt="円柱サイズ測定"
                className="mode-image"
              />
              <h2>千円札で円柱サイズを測る</h2>
            </div>
          </div>
        )}

        {/* モード切り替えボタン */}
        {subMode && (
          <div className="mode-switch-container">
            {subMode !== "flat" && (
              <button
                onClick={() => handleSubModeSelection("flat")}
                className="mode-switch-button"
              >
                平面長さ測定モード
              </button>
            )}
            {subMode !== "3D" && (
              <button
                onClick={() => handleSubModeSelection("3D")}
                className="mode-switch-button"
              >
                立体長さ測定モード（キューブ）
              </button>
            )}
            {subMode !== "cylinder" && (
              <button
                onClick={() => handleSubModeSelection("cylinder")}
                className="mode-switch-button"
              >
                円柱サイズ測定モード
              </button>
            )}
          </div>
        )}

        {/* 平面モード */}
        {subMode === "flat" && (
          <div>
            <h2>平面サイズ測定モード</h2>
            <Instructions mode="flat" />
            <SizeMeasurement />
          </div>
        )}

        {/* 3Dモード（キューブ） */}
        {subMode === "3D" && (
          <div>
            <h2>3Dサイズ測定モード（キューブ）</h2>
            <Instructions mode="3D" />
            <ThreeDMeasurement />
          </div>
        )}

        {/* 円柱モード */}
        {subMode === "cylinder" && (
          <div>
            <h2>円柱サイズ測定モード</h2>
            <Instructions mode="cylinder" />
            <CylinderMeasurement />
          </div>
        )}
      </div>
    </DataStorageProvider>
  );
}

export default App;
