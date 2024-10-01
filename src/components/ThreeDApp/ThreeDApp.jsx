import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./ThreeDApp.css";
import Sidebar from "./Sidebar.jsx";
import Title from "../Common/Title.jsx";

const ThreeDApp = () => {
  const [activePanel, setActivePanel] = useState(null); // 現在表示しているパネルの状態
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // サイドバーの状態
  const [dimensions, setDimensions] = useState({
    width: 400,
    height: 300,
    depth: 400,
  });
  const [objectSize, setObjectSize] = useState({
    width: 50,
    height: 50,
    depth: 50,
  });
  const [floorColor, setFloorColor] = useState("#deb887");
  const [backColor, setBackColor] = useState("#f0f0f0");
  const [objectColor, setObjectColor] = useState("#ff0000");
  const [customColor, setCustomColor] = useState("");
  const [selectedColorName, setSelectedColorName] = useState("赤");
  const [objectLogs, setObjectLogs] = useState([]);
  const [isWireframe, setIsWireframe] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const objectsRef = useRef([]);
  const [selectedObjectIndex, setSelectedObjectIndex] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const [spacePosition, setSpacePosition] = useState({ x: 0, y: 0, z: 0 });
  const [isSpaceLocked, setIsSpaceLocked] = useState(false); // 空間を固定するかの状態
  const [isDragging, setIsDragging] = useState(false); // ドラッグ中かの状態
  const dragStart = useRef({ x: 0, y: 0 }); // ドラッグの開始位置を保存
  const [isSingleSided, setIsSingleSided] = useState(false); // デフォルトは両面
  const [leftSideColor, setLeftSideColor] = useState("#f0f0f0");
  const [rightSideColor, setRightSideColor] = useState("#f0f0f0");
  const [panelHeight, setPanelHeight] = useState(300); // 初期高さ
  const [scrollTop, setScrollTop] = useState(0); // スクロール位置
  const [isResizing, setIsResizing] = useState(false); // リサイズ中の状態
  const operationPanelRef = useRef(null);

  const colorOptions = [
    { name: "赤", color: "#ff0000" },
    { name: "青", color: "#0000ff" },
    { name: "黄", color: "#ffff00" },
    { name: "緑", color: "#008000" },
    { name: "黒", color: "#000000" },
    { name: "白", color: "#ffffff" },
    { name: "ピンク", color: "#ffc0cb" },
    { name: "紫", color: "#800080" },
    { name: "黄緑", color: "#9acd32" },
    { name: "クリーム", color: "#fffdd0" },
    { name: "茶色", color: "#8b4513" },
  ];

  const showPanel = (panelType) => {
    setActivePanel(panelType);
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const handleMouseDown = (e) => {
    if (isSpaceLocked) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY }; // ドラッグの開始位置を記録
    }
  };

  const handleMouseMove = (e) => {
    if (isSpaceLocked && isDragging) {
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;

      // 空間の位置を新しい位置に更新
      setSpacePosition((prev) => {
        const newPosition = {
          x: prev.x + deltaX * 0.5, // ドラッグの移動に対するスケーリング調整
          y: prev.y - deltaY * 0.5,
          z: prev.z, // z座標は変更しない
        };

        // オブジェクトを空間の動きに合わせて移動させる
        objectsRef.current.forEach((obj) => {
          obj.object.position.x += deltaX * 0.25; // オブジェクトのX位置を変更
          obj.object.position.y -= deltaY * 0.25; // オブジェクトのY位置を変更
        });

        return newPosition;
      });

      // ドラッグ開始位置を更新
      dragStart.current = { x: e.clientX, y: e.clientY };

      // 再レンダリング
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const handleMouseUp = () => {
    if (isSpaceLocked) {
      setIsDragging(false);
    }
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  // 既存の関数がある部分に追加します
  const resetCameraPosition = () => {
    // カメラの初期位置を設定する関数
    cameraRef.current.position.set(0, 400, 800);
    cameraRef.current.lookAt(0, 150, 0);
    controlsRef.current.update();

    // オブジェクトを再描画
    redrawObjects();
  };

  const moveSpace = (direction) => {
    const moveAmount = 50; // 50pxずつ動かす
    setSpacePosition((prevPosition) => {
      let newPosition;
      switch (direction) {
        case "left":
          newPosition = { ...prevPosition, x: prevPosition.x - moveAmount };
          break;
        case "right":
          newPosition = { ...prevPosition, x: prevPosition.x + moveAmount };
          break;
        case "up":
          newPosition = { ...prevPosition, y: prevPosition.y + moveAmount };
          break;
        case "down":
          newPosition = { ...prevPosition, y: prevPosition.y - moveAmount };
          break;
        case "forward":
          newPosition = { ...prevPosition, z: prevPosition.z + moveAmount };
          break;
        case "backward":
          newPosition = { ...prevPosition, z: prevPosition.z - moveAmount };
          break;
        default:
          newPosition = prevPosition;
      }

      // すべてのオブジェクトの位置を新しい位置に移動
      objectsRef.current.forEach((obj) => {
        obj.object.position.x += newPosition.x - prevPosition.x;
        obj.object.position.y += newPosition.y - prevPosition.y;
        obj.object.position.z += newPosition.z - prevPosition.z;
      });

      // 再レンダリングを実行
      rendererRef.current.render(sceneRef.current, cameraRef.current);

      return newPosition; // 新しい位置を返す
    });
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.set(0, 400, 800);
    camera.lookAt(0, 150, 0);
    cameraRef.current = camera;
    sceneRef.current = scene;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controlsRef.current.enabled = true; // 初期状態では有効

    const createRoom = (width, height, depth) => {
      const floorGeometry = new THREE.PlaneGeometry(width, depth);
      const floorMaterial = new THREE.MeshBasicMaterial({ color: floorColor });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(
        spacePosition.x,
        100 + spacePosition.y,
        spacePosition.z
      );
      scene.add(floor);

      const backWallGeometry = new THREE.PlaneGeometry(width, height);
      const backWallMaterial = new THREE.MeshBasicMaterial({
        color: backColor,
        side: THREE.DoubleSide,
      });
      const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
      backWall.position.set(
        spacePosition.x,
        height / 2 + 100 + spacePosition.y,
        -depth / 2 + spacePosition.z
      );
      scene.add(backWall);

      const leftWallGeometry = new THREE.PlaneGeometry(depth, height);
      const leftWallMaterial = new THREE.MeshBasicMaterial({
        color: leftSideColor,
        side: THREE.DoubleSide,
      });
      const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.position.set(
        -width / 2 + spacePosition.x,
        height / 2 + 100 + spacePosition.y,
        spacePosition.z
      );
      scene.add(leftWall);

      if (!isSingleSided) {
        const rightWallGeometry = new THREE.PlaneGeometry(depth, height);
        const rightWallMaterial = new THREE.MeshBasicMaterial({
          color: rightSideColor,
          side: THREE.DoubleSide,
        });
        const rightWall = new THREE.Mesh(rightWallGeometry, rightWallMaterial);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(
          width / 2 + spacePosition.x,
          height / 2 + 100 + spacePosition.y,
          spacePosition.z
        );
        scene.add(rightWall);
      }

      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      const floorEdges = new THREE.EdgesGeometry(floorGeometry);
      const floorLine = new THREE.LineSegments(floorEdges, edgesMaterial);
      floor.add(floorLine);

      const backEdges = new THREE.EdgesGeometry(backWallGeometry);
      const backLine = new THREE.LineSegments(backEdges, edgesMaterial);
      backWall.add(backLine);

      const leftEdges = new THREE.EdgesGeometry(leftWallGeometry);
      const leftLine = new THREE.LineSegments(leftEdges, edgesMaterial);
      leftWall.add(leftLine);

      renderer.render(scene, camera);
    };

    createRoom(dimensions.width, dimensions.height, dimensions.depth);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, cameraRef.current);
    };

    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [
    dimensions,
    backgroundColor,
    floorColor,
    backColor,
    leftSideColor,
    rightSideColor,
    spacePosition,
    isSingleSided,
  ]);

  useEffect(() => {
    if (isSpaceLocked) {
      // ドラッグイベントを設定
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      // OrbitControlsを無効化
      controlsRef.current.enabled = false;
    } else {
      // 固定を解除したらOrbitControlsを有効化
      controlsRef.current.enabled = true;
    }

    return () => {
      // イベントリスナーのクリーンアップ
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSpaceLocked, isDragging]);

  const toggleSpaceLock = () => {
    setIsSpaceLocked((prev) => !prev); // 空間のロック状態を切り替え
  };

  const addObjectToScene = () => {
    const scene = sceneRef.current;
    const color = customColor || objectColor;

    let geometry;
    let material;

    if (isWireframe) {
      geometry = new THREE.BoxGeometry(
        objectSize.width,
        objectSize.height,
        objectSize.depth
      );
      material = new THREE.LineBasicMaterial({ color: color });
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const wireframe = new THREE.LineSegments(edgesGeometry, material);
      wireframe.position.set(
        spacePosition.x,
        objectSize.height / 2 + 100 + spacePosition.y,
        spacePosition.z
      );
      scene.add(wireframe);
      objectsRef.current.push({ color: color, object: wireframe });
    } else {
      geometry = new THREE.BoxGeometry(
        objectSize.width,
        objectSize.height,
        objectSize.depth
      );
      material = new THREE.MeshBasicMaterial({ color });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        spacePosition.x,
        objectSize.height / 2 + 100 + spacePosition.y,
        spacePosition.z
      );
      scene.add(cube);
      objectsRef.current.push({ color: color, object: cube });
    }

    setObjectLogs((prevLogs) => [
      ...prevLogs,
      {
        color: color,
        colorName: selectedColorName,
        width: objectSize.width,
        height: objectSize.height,
        depth: objectSize.depth,
        isWireframe: isWireframe,
      },
    ]);

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const redrawObjects = () => {
    objectsRef.current.forEach((obj) => {
      sceneRef.current.add(obj.object);
    });
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const removeObject = (index) => {
    const scene = sceneRef.current;
    const objectToRemove = objectsRef.current[index]?.object;
    if (objectToRemove) {
      scene.remove(objectToRemove);
      rendererRef.current.render(scene, scene.children[0]);
    }

    objectsRef.current.splice(index, 1);
    setObjectLogs((prevLogs) => prevLogs.filter((_, i) => i !== index));
    setSelectedObjectIndex(0);

    rendererRef.current.render(scene, cameraRef.current);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDimensions((prev) => ({
      ...prev,
      [name]: parseFloat(value) * 100,
    }));
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const handleObjectSizeChange = (e) => {
    const { name, value } = e.target;
    setObjectSize((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const handleColorChange = (e, index) => {
    const scene = sceneRef.current;
    const newColor = e.target.value;
    const object = objectsRef.current[index]?.object;

    if (object) {
      object.material.color.set(newColor);
      rendererRef.current.render(scene, cameraRef.current);
    }

    setObjectLogs((prevLogs) =>
      prevLogs.map((log, i) =>
        i === index ? { ...log, color: newColor } : log
      )
    );
  };

  const moveObject = (direction) => {
    const selectedObject = objectsRef.current[selectedObjectIndex]?.object;

    if (!selectedObject) return;

    const moveDistance = 10;

    switch (direction) {
      case "left":
        selectedObject.position.x -= moveDistance;
        break;
      case "right":
        selectedObject.position.x += moveDistance;
        break;
      case "forward":
        selectedObject.position.z -= moveDistance;
        break;
      case "backward":
        selectedObject.position.z += moveDistance;
        break;
      case "up":
        selectedObject.position.y += moveDistance;
        break;
      case "down":
        selectedObject.position.y -= moveDistance;
        break;
      default:
        break;
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const rotateObject = (direction) => {
    const selectedObject = objectsRef.current[selectedObjectIndex]?.object;

    if (!selectedObject) return;

    const angle = Math.PI / 4;

    switch (direction) {
      case "horizontal":
        selectedObject.rotation.y += angle;
        break;
      case "vertical":
        selectedObject.rotation.x += angle;
        break;
      default:
        break;
    }

    rendererRef.current.render(sceneRef.current, sceneRef.current.children[0]);
  };

  const startResizing = (e) => {
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resizePanel = (e) => {
    if (isResizing) {
      const newHeight = window.innerHeight - e.clientY;
      setPanelHeight(newHeight);
    }
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (operationPanelRef.current) {
        setScrollTop(operationPanelRef.current.scrollTop);
      }
    };

    const operationPanel = operationPanelRef.current;
    if (operationPanel) {
      operationPanel.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (operationPanel) {
        operationPanel.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const resetAll = () => {
    // カメラを初期位置に戻す
    cameraRef.current.position.set(0, 400, 800);
    cameraRef.current.lookAt(0, 150, 0);
    controlsRef.current.update();

    // 空間の位置を初期位置にリセット
    setSpacePosition({ x: 0, y: 0, z: 0 });

    // 片面側面モードを両面に戻す
    setIsSingleSided(false);

    // オブジェクトを全て削除
    objectsRef.current.forEach((obj) => {
      sceneRef.current.remove(obj.object);
    });
    objectsRef.current = [];

    // オブジェクトログもリセット
    setObjectLogs([]);

    // 再レンダリング
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  return (
    <div
      className={`container`}
      onMouseMove={resizePanel}
      onMouseUp={stopResizing}
    >
      <button onClick={toggleSidebar} className="toggle-sidebar-btn">
        {isSidebarOpen ? "←閉じる" : "menu→"}
      </button>

      <div className={`sidebar ${isSidebarOpen ? "" : "sidebar-closed"}`}>
        <Sidebar
          openPopup={showPanel}
          resetAll={resetAll}
          resetCameraPosition={resetCameraPosition}
          toggleSpaceLock={toggleSpaceLock}
          isSpaceLocked={isSpaceLocked}
          isSingleSided={isSingleSided}
          setIsSingleSided={setIsSingleSided}
        />
      </div>

      <div className="webgl-container">
        <div id="webgl-output" ref={mountRef}></div>
      </div>

      <div
        className={`operation-panel ${activePanel ? "open" : ""}`}
        style={{ height: `${panelHeight}px` }}
      >
        <div
          className="resize-handle"
          onMouseDown={startResizing}
          style={{
            top: `calc(100vh - ${panelHeight - scrollTop}px)`,
          }}
        ></div>
        {activePanel === "size" && (
          <div className="section">
            <h3>空間のサイズ</h3>
            <div className="dimension-group">
              <label>
                横幅 (m):
                <input
                  type="number"
                  name="width"
                  value={(dimensions.width / 100).toFixed(2)}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                奥行 (m):
                <input
                  type="number"
                  name="depth"
                  value={(dimensions.depth / 100).toFixed(2)}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                高さ (m):
                <input
                  type="number"
                  name="height"
                  value={(dimensions.height / 100).toFixed(2)}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <div className="dimension-group">
              <label className="color-picker-wrapper">
                床の色:
                <span
                  className="custom-color-picker-label"
                  style={{ backgroundColor: floorColor }}
                >
                  <input
                    type="color"
                    value={floorColor}
                    className="custom-color-picker"
                    onChange={(e) => setFloorColor(e.target.value)}
                  />
                </span>
              </label>

              <label className="color-picker-wrapper">
                背面の色:
                <span
                  className="custom-color-picker-label"
                  style={{ backgroundColor: backColor }}
                >
                  <input
                    type="color"
                    value={backColor}
                    className="custom-color-picker"
                    onChange={(e) => setBackColor(e.target.value)}
                  />
                </span>
              </label>

              <label className="color-picker-wrapper">
                左側面の色:
                <span
                  className="custom-color-picker-label"
                  style={{ backgroundColor: leftSideColor }}
                >
                  <input
                    type="color"
                    value={leftSideColor}
                    className="custom-color-picker"
                    onChange={(e) => setLeftSideColor(e.target.value)}
                  />
                </span>
              </label>

              <label className="color-picker-wrapper">
                右側面の色:
                <span
                  className="custom-color-picker-label"
                  style={{ backgroundColor: rightSideColor }}
                >
                  <input
                    type="color"
                    value={rightSideColor}
                    className="custom-color-picker"
                    onChange={(e) => setRightSideColor(e.target.value)}
                  />
                </span>
              </label>

              <label className="color-picker-wrapper">
                全体背景の色:
                <span
                  className="custom-color-picker-label"
                  style={{ backgroundColor: backgroundColor }}
                >
                  <input
                    type="color"
                    value={backgroundColor}
                    className="custom-color-picker"
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  />
                </span>
              </label>
            </div>
            <div>
              <button onClick={() => moveSpace("left")}>左</button>
              <button onClick={() => moveSpace("right")}>右</button>
              <button onClick={() => moveSpace("up")}>上</button>
              <button onClick={() => moveSpace("down")}>下</button>
              <button onClick={() => moveSpace("forward")}>手前</button>
              <button onClick={() => moveSpace("backward")}>後ろ</button>
              <button onClick={() => setIsSingleSided((prev) => !prev)}>
                {isSingleSided ? "両面側面" : "片面側面"}
              </button>
              <button onClick={resetCameraPosition}>
                オブジェクトを再描画
              </button>
            </div>
          </div>
        )}

        {activePanel === "objectSize" && (
          <div className="section">
            <h3>オブジェクトのサイズと色</h3>
            <div className="dimension-group">
              <label>
                横幅 (cm):
                <input
                  type="number"
                  name="width"
                  value={objectSize.width}
                  onChange={handleObjectSizeChange}
                />
              </label>
              <label>
                高さ (cm):
                <input
                  type="number"
                  name="height"
                  value={objectSize.height}
                  onChange={handleObjectSizeChange}
                />
              </label>
              <label>
                奥行 (cm):
                <input
                  type="number"
                  name="depth"
                  value={objectSize.depth}
                  onChange={handleObjectSizeChange}
                />
              </label>
            </div>

            <ul className="color-list">
              {colorOptions.map((option) => (
                <li
                  key={option.name}
                  className={`color-item ${
                    selectedColorName === option.name ? "selected" : ""
                  }`}
                  onClick={() => {
                    setObjectColor(option.color);
                    setSelectedColorName(option.name);
                    setCustomColor(""); // カスタム色をクリア
                  }}
                >
                  <span
                    className="color-icon"
                    style={{ backgroundColor: option.color }}
                  ></span>
                  {option.name}
                </li>
              ))}

              <li className="color-item">
                <div
                  className={`color-picker-wrapper ${
                    selectedColorName === "カスタム" ? "selected" : ""
                  }`}
                  onClick={() => setSelectedColorName("カスタム")}
                >
                  <label
                    className="custom-color-picker-label"
                    style={{ backgroundColor: customColor || "#ffffff" }}
                  >
                    <input
                      type="color"
                      value={customColor || "#ffffff"}
                      className="custom-color-picker"
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setObjectColor(e.target.value);
                        setSelectedColorName("カスタム");
                      }}
                    />
                  </label>
                  <span>自分で選ぶ</span>
                </div>
              </li>
            </ul>
            <div className="dimension-group2">
              <label>
                枠線のみ:
                <input
                  type="checkbox"
                  checked={isWireframe}
                  onChange={(e) => setIsWireframe(e.target.checked)}
                />
              </label>
              <button
                className="add-object-button"
                onClick={addObjectToScene}
                style={{
                  backgroundColor: objectColor,
                }}
              >
                <span class="button-text">オブジェクトを追加</span>
              </button>
            </div>
          </div>
        )}

        {activePanel === "objectControl" && (
          <div className="section controls">
            <h3>オブジェクトの操作</h3>
            <label>
              オブジェクトログ番号:
              <select
                value={selectedObjectIndex}
                onChange={(e) =>
                  setSelectedObjectIndex(parseInt(e.target.value))
                }
              >
                {objectLogs.map((log, index) => (
                  <option key={index} value={index}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <button onClick={() => moveObject("left")}>左</button>
              <button onClick={() => moveObject("right")}>右</button>
              <button onClick={() => moveObject("forward")}>前</button>
              <button onClick={() => moveObject("backward")}>後ろ</button>
              <button onClick={() => moveObject("up")}>上</button>
              <button onClick={() => moveObject("down")}>下</button>

              <button onClick={() => rotateObject("horizontal")}>
                横回転 45°
              </button>
              <button onClick={() => rotateObject("vertical")}>
                縦回転 45°
              </button>
            </div>
            <button onClick={resetCameraPosition}>オブジェクトを再描画</button>
          </div>
        )}

        {activePanel === "objectLog" && (
          <div className="section">
            <h3>オブジェクトログ</h3>
            <ul>
              {objectLogs.map((log, index) => (
                <li key={index} className="color-picker-wrapper">
                  {index + 1}.
                  <span
                    className="custom-color-picker-label"
                    style={{ backgroundColor: log.color }}
                  >
                    <input
                      type="color"
                      value={log.color}
                      className="custom-color-picker"
                      onChange={(e) => handleColorChange(e, index)}
                    />
                  </span>
                  (幅: {log.width}cm, 高さ: {log.height}cm, 奥行: {log.depth}cm)
                  {log.isWireframe ? " [枠線のみ]" : ""}
                  <button onClick={() => removeObject(index)}>消去</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeDApp;
