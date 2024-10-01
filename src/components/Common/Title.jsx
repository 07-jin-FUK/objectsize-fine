import React from "react";

const Title = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>SizeSnap</h1>
      <p style={styles.subtitle}>千円札で簡単サイズ測定</p>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#333",
  },
  title: {
    fontSize: "3em",
    fontWeight: "bold",
    margin: "0",
  },
  subtitle: {
    fontSize: "1.5em",
    color: "#666",
    margin: "0",
  },
};

export default Title;
