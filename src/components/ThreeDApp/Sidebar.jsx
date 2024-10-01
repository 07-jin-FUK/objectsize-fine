const Sidebar = ({ openPopup }) => {
  return (
    <div className="sidebar">
      <h3 style={{ color: "white" }}>設定メニュー</h3>
      <button onClick={() => openPopup("size")}>空間のサイズ</button>
      <button onClick={() => openPopup("objectSize")}>
        オブジェクトのサイズと色
      </button>
      <button onClick={() => openPopup("objectControl")}>
        オブジェクトの操作
      </button>
      <button onClick={() => openPopup("objectLog")}>オブジェクトログ</button>
    </div>
  );
};

export default Sidebar;
