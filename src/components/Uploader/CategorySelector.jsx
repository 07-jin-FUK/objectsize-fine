import React, { useEffect } from "react";

const categories = {
  定規: [
    { name: "10cm（標準）", size: 10 },
    { name: "20cm（標準）", size: 20 },
  ],
  紙幣: [
    { name: "1000円札", size: 15.5 },
    { name: "5000円札", size: 15.6 },
    { name: "1万円札", size: 16.0 },
  ],
  硬貨: [
    { name: "1円硬貨", size: 2.0 },
    { name: "5円硬貨", size: 2.1 },
    { name: "10円硬貨", size: 2.3 },
    { name: "50円硬貨/100円硬貨", size: 2.5 },
    { name: "500円硬貨", size: 2.65 },
  ],
  カード類: [
    { name: "クレジットカード/ICカード", size: 8.56 },
    { name: "名刺", size: 9.1 },
  ],
  タバコの箱: [
    { name: "タバコの箱", size: 8.6 }, // 横の長さ
    { name: "ライター", size: 7.4 }, // 横の長さ
  ],
  その他: [],
};
const CategorySelector = ({ onCategorySelect, selectedCategory }) => {
  return (
    <div style={styles.menu}>
      {Object.keys(categories).map((category) => (
        <div
          key={category}
          style={{
            ...styles.menuItem,
            backgroundColor:
              selectedCategory === category ? "#dcdcdc" : "#ffffff",
          }}
          onClick={() => onCategorySelect(category)}
        >
          {category}
        </div>
      ))}
    </div>
  );
};

const styles = {
  menu: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
    borderBottom: "2px solid #cccccc",
  },
  menuItem: {
    padding: "10px 20px",
    cursor: "pointer",
    borderBottom: "3px solid transparent",
  },
};

export default CategorySelector;
