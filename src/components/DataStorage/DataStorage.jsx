import React, { createContext, useContext, useState, useEffect } from "react";

// コンテキストを作成して、他のコンポーネントがアクセスできるようにする
const DataStorageContext = createContext();

export const useDataStorage = () => {
  return useContext(DataStorageContext);
};

const LOCAL_STORAGE_KEY = "savedData";

// データ保存コンポーネント
export const DataStorageProvider = ({ children }) => {
  const [savedData, setSavedData] = useState([]);

  // コンポーネントの初期読み込み時にローカルストレージからデータを読み込む
  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      setSavedData(JSON.parse(storedData));
    }
  }, []);

  // データが変更されたらローカルストレージに保存
  useEffect(() => {
    if (savedData.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedData));
    }
  }, [savedData]);

  // 新しいデータを保存する関数
  const saveData = (newData) => {
    setSavedData((prevData) => [...prevData, newData]);
  };

  // 既存のデータを削除する関数
  const deleteData = (index) => {
    setSavedData((prevData) => prevData.filter((_, i) => i !== index));
  };

  return (
    <DataStorageContext.Provider value={{ savedData, saveData, deleteData }}>
      {children}
    </DataStorageContext.Provider>
  );
};
