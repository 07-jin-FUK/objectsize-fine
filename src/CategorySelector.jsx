import React, { useEffect } from "react";

const categories = {
  定規: ["10cm（標準）", "20cm（標準）"],
  紙幣: [
    "1000円札（15.5cm x 7.6cm）",
    "5000円札（15.6cm x 7.6cm）",
    "1万円札（16cm x 7.6cm）",
  ],
  硬貨: [
    "1円硬貨（直径2.0cm）",
    "5円硬貨（直径2.1cm）",
    "10円硬貨（直径2.3cm）",
    "50円硬貨/100円硬貨（直径2.5cm）",
    "500円硬貨（直径2.65cm）",
  ],
  カード類: [
    "クレジットカード/ICカード（8.56cm x 5.4cm）",
    "名刺（9.1cm x 5.5cm）",
  ],
  タバコの箱: [
    "タバコの箱（5.4cm x 8.6cm x 2.2cm）",
    "ライター（7.4cm x 2.5cm x 1.2cm）",
  ],
  その他: [], // カスタムサイズ用
};

const CategorySelector = ({ onCategorySelect, selectedCategory }) => {
  useEffect(() => {
    // サブカテゴリが1つしかない場合は自動的に選択する
    if (selectedCategory && categories[selectedCategory].length === 1) {
      onCategorySelect(categories[selectedCategory][0]);
    }
  }, [selectedCategory, onCategorySelect]);

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
