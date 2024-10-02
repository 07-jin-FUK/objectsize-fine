import React from "react";

const ImagePopup = ({ isOpen, onClose, imageDataURL, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <img src={imageDataURL} alt="天面図" />
        <button onClick={onSave}>画像を保存</button>
        <button onClick={onClose}>閉じる</button>
      </div>
    </div>
  );
};

export default ImagePopup;
