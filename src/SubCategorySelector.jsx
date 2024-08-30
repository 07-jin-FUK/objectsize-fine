import React from "react";

const SubCategorySelector = ({
  category,
  onSubCategorySelect,
  selectedSubCategory,
  categories,
}) => {
  return (
    <div style={styles.dropdown}>
      {categories[category].map((subCategory) => (
        <div
          key={subCategory}
          style={{
            ...styles.dropdownItem,
            backgroundColor:
              selectedSubCategory === subCategory ? "#dcdcdc" : "#ffffff",
          }}
          onClick={() => onSubCategorySelect(subCategory)}
        >
          {subCategory}
        </div>
      ))}
    </div>
  );
};

const styles = {
  dropdown: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
  },
  dropdownItem: {
    padding: "10px 20px",
    cursor: "pointer",
    borderBottom: "1px solid #cccccc",
    width: "80%",
    textAlign: "center",
  },
};

export default SubCategorySelector;
