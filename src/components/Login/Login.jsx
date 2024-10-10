import React, { useState } from "react";
import axios from "axios";

const Login = ({ setLoggedInUser, closeLoginModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://python-api-5yn6.onrender.com/login", {
        email,
        password,
      });

      if (response.status === 200) {
        const { token, name, id } = response.data; // id を取得
        setLoggedInUser({ name, id }); // id と name をセット
        localStorage.setItem("token", token);
        setSuccessMessage("ログイン完了！いつもありがとうございます！");
        setError("");
        setTimeout(() => {
          setSuccessMessage("");
          closeLoginModal();
        }, 2000);
      } else {
        throw new Error("ログインに失敗しました。");
      }
    } catch (error) {
      setError("ログインに失敗しました。");
      setSuccessMessage("");
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
