import React, { useState } from "react";
import axios from "axios";

const Login = ({ setLoggedInUser, closeLoginModal }) => {
  // closeLoginModal を受け取る
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      if (response.status === 200) {
        // ステータスコードが 200 の場合のみ成功
        const { token, name } = response.data;
        setLoggedInUser(name);
        localStorage.setItem("token", token);
        setSuccessMessage("ログイン完了！いつもありがとうございます！");
        setError(""); // エラーメッセージをリセット

        // 2秒後に成功メッセージを非表示にする
        setTimeout(() => {
          setSuccessMessage("");
          closeLoginModal(); // モーダルを閉じる
        }, 2000);
      } else {
        throw new Error("ログインに失敗しました。");
      }
    } catch (error) {
      setError("ログインに失敗しました。");
      setSuccessMessage(""); // 成功メッセージをリセット
    }
  };

  return (
    <div>
      <h2>ログイン</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
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
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
};

export default Login;
