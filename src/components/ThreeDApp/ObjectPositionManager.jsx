import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const ObjectPositionManager = ({ scene }) => {
  const [objectPositions, setObjectPositions] = useState([]);

  // オブジェクトの座標を取得して保存
  const saveObjectPosition = (object) => {
    const { x, z } = object.position; // 天面からの座標 (X, Z)
    setObjectPositions((prevPositions) => [
      ...prevPositions,
      { id: object.uuid, x, z }, // 各オブジェクトのIDと座標を保存
    ]);
  };

  // 例えば、オブジェクトが追加される際にこの関数を呼ぶ
  useEffect(() => {
    const objects = scene.children.filter(
      (obj) => obj.isMesh // 3Dオブジェクトだけを対象
    );
    objects.forEach(saveObjectPosition);
  }, [scene]);

  return (
    <div>
      <h3>オブジェクトの座標</h3>
      <ul>
        {objectPositions.map((pos) => (
          <li key={pos.id}>
            オブジェクトID: {pos.id}, X: {pos.x}, Z: {pos.z}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ObjectPositionManager;
