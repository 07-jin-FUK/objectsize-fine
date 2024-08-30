import React from "react";

const CustomSizeInput = ({ customSize, onCustomSizeChange }) => {
  return (
    <div style={styles.container}>
      <input
        type="number"
        placeholder="カスタムサイズ (cm)"
        value={customSize}
        onChange={(e) => onCustomSizeChange(e.target.value)}
        style={styles.input}
      />
    </div>
  );
};

const styles = {
  container: {
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #cccccc",
    width: "80%",
    maxWidth: "300px",
  },
};

export default CustomSizeInput;
