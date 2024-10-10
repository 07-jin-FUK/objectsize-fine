import React, { useState } from "react";
import axios from "axios";

const Register = ({ closeRegisterModal, openLoginModal }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://python-api-5yn6.onrender.com/register", {
        name,
        email,
        password,
      });

      // 成功メッセージを表示
      setMessage("登録が完了しました！ログイン画面に移行します。");

      // 2秒後にモーダルを閉じ、ログインモーダルを開く
      setTimeout(() => {
        setMessage("");
        closeRegisterModal(); // モーダルを閉じる
        openLoginModal(); // ログインモーダルを開く
      }, 2000);
    } catch (error) {
      setErrorMessage("登録に失敗しました。もう一度お試しください。");
    }
  };

  return (
    <div>
      <h2>新規会員登録</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form onSubmit={handleRegister}>
        <div>
          <label>名前:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>メールアドレス:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>パスワード:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">登録</button>
      </form>
    </div>
  );
};

export default Register;
