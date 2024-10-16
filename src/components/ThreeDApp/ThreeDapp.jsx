import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./ThreeDApp.css";
import Sidebar from "./Sidebar.jsx";
import axios from "axios";

const ThreeDapp = ({
  handleBackToTop,
  loggedInUser,
  handleLogout,
  openLoginModal,
}) => {
  const [measurementLogs, setMeasurementLogs] = useState(
    JSON.parse(localStorage.getItem("measurementLogs")) || []
  );
  const [cylinderLogs, setCylinderLogs] = useState(
    JSON.parse(localStorage.getItem("cylinderLogs")) || []
  );
  const [threeDMeasurementLogs, setThreeDMeasurementLogs] = useState(
    JSON.parse(localStorage.getItem("threeDMeasurementLogs")) || []
  );

  // 両方のログを統合する
  const binedLogs = [
    ...measurementLogs,
    ...cylinderLogs,
    ...threeDMeasurementLogs,
  ];

  useEffect(() => {
    console.log("Measurement Logs: ", measurementLogs);
    console.log("Cylinder Logs: ", cylinderLogs);
    console.log("ThreeDMeasurement Logs: ", threeDMeasurementLogs);
  }, [measurementLogs, cylinderLogs, threeDMeasurementLogs]);
  const [activePanel, setActivePanel] = useState(null); // 現在表示しているパネルの状態
  const [dimensions, setDimensions] = useState({
    width: 400,
    height: 300,
    depth: 400,
  });
  const [objectSize, setObjectSize] = useState({
    width: 50,
    height: 50,
    depth: 50,
    diameter: 50, // 円柱用の直径を追加
  });
  const [objectType, setObjectType] = useState("cube"); // 新しくオブジェクトの種類を管理する状態

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
  const [initialSpacePosition, setInitialSpacePosition] = useState({
    x: 0,
    y: 0,
    z: 0,
  }); // 初期の空間位置を保存
  const [currentSpaceOffset, setCurrentSpaceOffset] = useState({
    x: 0,
    y: 0,
    z: 0,
  }); // 空間の移動量を保存

  const handleSaveAll = async () => {
    try {
      await handleSaveFile(); // 空間を保存
      await handleSaveObjects(); // オブジェクトを保存
      alert("保存が完了しました");
    } catch (error) {
      console.error("保存中にエラーが発生しました", error);
      alert("保存に失敗しました");
    }
  };

  const handleLoadAll = async () => {
    try {
      await handleLoadFile();
      await handleLoadObjects();
    } catch (error) {
      console.error("読み込み中にエラーが発生しました", error);
      alert("読み込みに失敗しました");
    }
  };

  // 空間を作成
  const createRoom = (width, height, depth) => {
    const floorGeometry = new THREE.PlaneGeometry(width, depth);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: floorColor });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(spacePosition.x, 100 + spacePosition.y, spacePosition.z);
    sceneRef.current.add(floor);

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
    sceneRef.current.add(backWall);

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
    sceneRef.current.add(leftWall);

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
      sceneRef.current.add(rightWall);
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

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const handleSaveObjects = async () => {
    if (!loggedInUser || !loggedInUser.id) {
      alert("ユーザー情報が不足しています。");
      return;
    }

    const objectsData = objectsRef.current.map((obj) => {
      const isWireframe = obj.object instanceof THREE.LineSegments;

      let size;
      if (isWireframe && obj.objectType === "cube") {
        size = {
          width: obj.geometry.parameters.width,
          height: obj.geometry.parameters.height,
          depth: obj.geometry.parameters.depth,
        };
      } else if (isWireframe && obj.objectType === "cylinder") {
        size = {
          diameter: obj.geometry.parameters.radiusTop * 2,
          height: obj.geometry.parameters.height,
        };
      } else {
        size =
          obj.objectType === "cube"
            ? {
                width: obj.object.geometry.parameters.width,
                height: obj.object.geometry.parameters.height,
                depth: obj.object.geometry.parameters.depth,
              }
            : {
                diameter: obj.object.geometry.parameters.radiusTop * 2,
                height: obj.object.geometry.parameters.height,
              };
      }

      return {
        object_type: obj.objectType,
        // JSON オブジェクトとして保存するため、文字列化しない
        position: {
          x: obj.object.position.x,
          y: obj.object.position.y,
          z: obj.object.position.z,
        },
        size, // 同様に、size も JSON オブジェクトとして保持
        color: `#${obj.object.material.color.getHexString()}`,
        isWireframe: isWireframe,
      };
    });

    console.log("Saving objects:", objectsData);

    try {
      // user_idを使用してPOSTリクエストを送信
      await axios.post(
        `https://python-api-5yn6.onrender.com/spaces/${loggedInUser.id}/save-objects`,
        {
          objects: objectsData,
        }
      );
      alert("オブジェクトが保存されました");
    } catch (error) {
      console.error("オブジェクト保存中にエラーが発生しました", error);
      alert("オブジェクトの保存に失敗しました");
    }
  };

  const handleSaveFile = async () => {
    console.log("Logged in user:", loggedInUser);

    if (!loggedInUser || !loggedInUser.id) {
      alert("ユーザー情報が不足しています。");
      return;
    }

    const data = {
      user_id: loggedInUser.id,
      dimensions: {
        width: dimensions.width,
        height: dimensions.height,
        depth: dimensions.depth,
      },
      floorColor,
      backColor,
      leftSideColor,
      rightSideColor,
      backgroundColor,
      isSingleSided,
    };

    try {
      // user_idを使用してPOSTリクエストを送信
      await axios.post(
        `https://python-api-5yn6.onrender.com/spaces/${loggedInUser.id}/save`,
        data
      );
      alert("空間が保存されました");
    } catch (error) {
      console.error("保存中にエラーが発生しました", error);
      alert("保存に失敗しました");
    }
  };

  // シーンのクリア
  const clearScene = () => {
    if (sceneRef.current) {
      while (sceneRef.current.children.length > 0) {
        const object = sceneRef.current.children[0];
        sceneRef.current.remove(object);
      }
    }
  };

  // 空間データの読み込み
  const handleLoadFile = async () => {
    console.log("Loading spaces for user:", loggedInUser);

    if (!loggedInUser || !loggedInUser.id) {
      alert("ユーザー情報が見つかりません。ログインしてください。");
      return;
    }

    try {
      const response = await axios.get(
        `https://python-api-5yn6.onrender.com/spaces?user_id=${loggedInUser.id}`
      );
      const data = response.data;

      if (!data.spaces || data.spaces.length === 0) {
        throw new Error("空間データまたは寸法が欠落しています");
      }

      const space = data.spaces[0];
      const { width, height, depth } = JSON.parse(space.dimensions);

      setBackgroundColor(space.background_color);
      setFloorColor(space.floor_color);
      setBackColor(space.back_color);
      setLeftSideColor(space.left_side_color || "#f0f0f0");
      setRightSideColor(space.right_side_color || "#f0f0f0");
      setDimensions({ width, height, depth });
      setIsSingleSided(space.is_single_sided);

      clearScene();
      createRoom(width, height, depth);

      rendererRef.current.render(sceneRef.current, cameraRef.current);

      alert(
        `空間サイズと色が読み込まれました: 幅=${width}, 高さ=${height}, 奥行=${depth}`
      );
    } catch (error) {
      console.error("読み込み中にエラーが発生しました", error);
      alert("読み込みに失敗しました");
    }
  };

  const handleLoadObjects = async () => {
    if (!loggedInUser || !loggedInUser.id) {
      alert("空間またはユーザー情報が不足しています。");
      return;
    }

    try {
      // サーバーから保存されたオブジェクトデータを取得
      const objectsResponse = await axios.get(
        `https://python-api-5yn6.onrender.com/spaces/${loggedInUser.id}/objects`
      );
      const objectsData = objectsResponse.data.objects;

      // 読み込んだオブジェクトをシーンに追加し、オブジェクトログに反映
      const loadedLogs = objectsData.map((obj) => {
        // オブジェクトをシーンに追加
        createObjectFromLog({
          ...obj,
          size: typeof obj.size === "string" ? JSON.parse(obj.size) : obj.size,
          position:
            typeof obj.position === "string"
              ? JSON.parse(obj.position)
              : obj.position,
        });

        const parsedSize =
          typeof obj.size === "string" ? JSON.parse(obj.size) : obj.size;

        // オブジェクトログに情報を追加し、sizeも追加
        return {
          color: obj.color,
          objectType: obj.object_type,
          width: parsedSize?.width || undefined,
          height: parsedSize?.height || undefined,
          depth: parsedSize?.depth || undefined,
          diameter: parsedSize?.diameter || undefined,
          isWireframe: obj.isWireframe,
          size: parsedSize, // sizeを追加
        };
      });

      // オブジェクトログを更新
      setObjectLogs(loadedLogs);

      alert("オブジェクトが読み込まれました");
    } catch (error) {
      console.error("オブジェクト読み込み中にエラーが発生しました", error);
      alert("オブジェクトの読み込みに失敗しました");
    }
  };

  const createObjectFromLog = (log) => {
    let geometry, material;
    const color = new THREE.Color(log.color);

    // 位置情報を数値として抽出
    let parsedPosition =
      typeof log.position === "string"
        ? JSON.parse(log.position)
        : log.position;
    const xPos = parseFloat(parsedPosition.x);
    const yPos = parseFloat(parsedPosition.y);
    const zPos = parseFloat(parsedPosition.z);

    // サイズ情報を数値として抽出
    let parsedSize =
      typeof log.size === "string" ? JSON.parse(log.size) : log.size;

    if (log.object_type === "cube") {
      const width = parseFloat(parsedSize.width);
      const height = parseFloat(parsedSize.height);
      const depth = parseFloat(parsedSize.depth);

      // キューブ型ジオメトリの作成
      geometry = new THREE.BoxGeometry(width, height, depth);
    } else if (log.object_type === "cylinder") {
      const diameter = parseFloat(parsedSize.diameter);
      const radius = diameter / 2;
      const height = parseFloat(parsedSize.height);

      // 円柱型ジオメトリの作成
      geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    }

    const isWireframe = Boolean(log.is_wireframe);

    if (isWireframe) {
      // ワイヤーフレームを作成
      material = new THREE.LineBasicMaterial({ color });
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const wireframe = new THREE.LineSegments(edgesGeometry, material);
      wireframe.position.set(xPos, yPos, zPos);

      // シーンに追加
      sceneRef.current.add(wireframe);

      // `objectsRef.current` にも追加して管理
      objectsRef.current.push({
        color: log.color,
        object: wireframe,
        objectType: log.object_type,
        geometry,
      });

      console.log("Wireframe created at position:", wireframe.position);
    } else {
      // 通常のマテリアルでメッシュを作成
      material = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(xPos, yPos, zPos);

      // シーンに追加
      sceneRef.current.add(mesh);

      // `objectsRef.current` にも追加して管理
      objectsRef.current.push({
        color: log.color,
        object: mesh,
        objectType: log.object_type,
        geometry,
      });

      console.log("Mesh created at position:", mesh.position);
    }

    // シーンを再レンダリング
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const resetToInitialPositions = () => {
    // 空間の位置を初期位置に戻す
    setSpacePosition(initialSpacePosition);

    // オブジェクトの位置も初期位置に戻す
    objectsRef.current.forEach((obj) => {
      obj.object.position.x -= currentSpaceOffset.x;
      obj.object.position.y -= currentSpaceOffset.y;
      obj.object.position.z -= currentSpaceOffset.z;
    });

    // 現在の空間の移動量もリセット
    setCurrentSpaceOffset({ x: 0, y: 0, z: 0 });

    // カメラをリセットして再レンダリング
    cameraRef.current.position.set(0, 400, 800);
    cameraRef.current.lookAt(0, 150, 0);
    controlsRef.current.update();
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

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

      // 空間の移動量を更新
      setCurrentSpaceOffset({
        x: newPosition.x - initialSpacePosition.x,
        y: newPosition.y - initialSpacePosition.y,
        z: newPosition.z - initialSpacePosition.z,
      });

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

    // ワイヤーフレームモードの処理
    if (isWireframe) {
      if (objectType === "cube") {
        // キューブ型オブジェクトのワイヤーフレームを生成
        geometry = new THREE.BoxGeometry(
          objectSize.width,
          objectSize.height,
          objectSize.depth
        );
      } else if (objectType === "cylinder") {
        // 円柱型オブジェクトのワイヤーフレームを生成
        const radius = objectSize.diameter / 2;
        geometry = new THREE.CylinderGeometry(
          radius,
          radius,
          objectSize.height,
          32
        );
      }

      material = new THREE.LineBasicMaterial({ color: color });
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const wireframe = new THREE.LineSegments(edgesGeometry, material);
      wireframe.position.set(
        spacePosition.x,
        objectSize.height / 2 + 100 + spacePosition.y,
        spacePosition.z
      );
      scene.add(wireframe);
      objectsRef.current.push({
        color: color,
        object: wireframe,
        objectType,
        geometry,
      });
    } else {
      // ワイヤーフレームでない場合
      if (objectType === "cube") {
        // キューブ型オブジェクトを生成
        geometry = new THREE.BoxGeometry(
          objectSize.width,
          objectSize.height,
          objectSize.depth
        );
      } else if (objectType === "cylinder") {
        // 円柱型オブジェクトを生成
        const radius = objectSize.diameter / 2;
        geometry = new THREE.CylinderGeometry(
          radius,
          radius,
          objectSize.height,
          32
        );
      }
      console.log(objectsRef.current);

      material = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        spacePosition.x,
        objectSize.height / 2 + 100 + spacePosition.y,
        spacePosition.z
      );
      scene.add(mesh);
      objectsRef.current.push({ color: color, object: mesh, objectType });
    }

    // ログに新しいオブジェクトの情報を追加
    setObjectLogs((prevLogs) => [
      ...prevLogs,
      {
        color: objectColor,
        colorName: selectedColorName,
        width: objectType === "cube" ? objectSize.width : undefined, // キューブの場合のみ幅を保存
        height: objectSize.height,
        depth: objectType === "cube" ? objectSize.depth : undefined, // キューブの場合のみ奥行を保存
        diameter: objectType === "cylinder" ? objectSize.diameter : undefined, // 円柱の場合のみ直径を保存
        isWireframe: isWireframe,
        objectType,
      },
    ]);

    // シーンを再レンダリング
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
    console.log("Updated Object Size: ", objectSize); // ここでログを確認
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

  const setTopViewCamera = () => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // シーンの中心を計算
    const bbox = new THREE.Box3().setFromObject(scene);
    const center = bbox.getCenter(new THREE.Vector3());

    // カメラをシーンの上空に配置
    camera.position.set(center.x, center.y + 1000, center.z);
    camera.lookAt(center);

    // コントロールを更新
    controls.target.set(center.x, center.y, center.z);
    controls.update();
  };

  const saveTopViewAsImage = () => {
    // 元のウィンドウサイズとアスペクト比を取得
    const originalSize = rendererRef.current.getSize(new THREE.Vector2());
    const aspectRatio = originalSize.x / originalSize.y; // 元のアスペクト比

    // 保存用に正方形のサイズを計算
    const saveWidth = 1080 * aspectRatio;
    const saveHeight = 1080; // 正方形にするための高さ

    // レンダラーのサイズを変更してからレンダリング
    rendererRef.current.setSize(saveWidth, saveHeight);
    rendererRef.current.render(sceneRef.current, cameraRef.current);

    // PNG形式で画像を保存
    const dataURL = rendererRef.current.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "top_view.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 元のサイズに戻す
    rendererRef.current.setSize(originalSize.x, originalSize.y);
  };

  const saveCurrentViewAsImage = () => {
    // 現在のウィンドウサイズを取得
    const originalSize = rendererRef.current.getSize(new THREE.Vector2());

    // アスペクト比を計算（幅 / 高さ）
    const aspectRatio = originalSize.x / originalSize.y;

    // 保存時の解像度を設定（幅1920pxを基準に高さを計算）
    const newWidth = 1920;
    const newHeight = newWidth / aspectRatio;

    // 新しい解像度にリサイズ
    rendererRef.current.setSize(newWidth, newHeight);

    // カメラのアスペクト比を更新
    cameraRef.current.aspect = newWidth / newHeight;
    cameraRef.current.updateProjectionMatrix(); // カメラのプロジェクション行列を更新

    // 現在のカメラの角度でシーンをレンダリング
    rendererRef.current.render(sceneRef.current, cameraRef.current);

    // 画像を保存する処理
    const dataURL = rendererRef.current.domElement.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "current_view.png"; // ファイル名を設定
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 元のサイズとカメラのアスペクト比に戻す
    rendererRef.current.setSize(originalSize.width, originalSize.height);
    cameraRef.current.aspect = originalSize.x / originalSize.y;
    cameraRef.current.updateProjectionMatrix();
  };
  const drawTopViewCanvasBW = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // キャンバスサイズ設定（正方形）
    const roomWidth = dimensions.width;
    const roomDepth = dimensions.depth;
    canvas.width = roomWidth + 150; // マージン分追加
    canvas.height = roomDepth + 100; // マージン分追加

    // キャンバスの背景色を白に設定
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const margin = 50; // マージンのサイズ
    const scale = Math.min(
      (canvas.width - margin * 2) / roomWidth,
      (canvas.height - margin * 2) / roomDepth
    );

    const scaledRoomWidth = roomWidth * scale;
    const scaledRoomDepth = roomDepth * scale;

    // 黒線で部屋の外枠を描画
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, scaledRoomWidth, scaledRoomDepth);

    // 部屋の寸法を表示（横幅と奥行き）
    ctx.fillStyle = "#000000";
    ctx.font = "16px Arial";
    ctx.fillText(
      `W=${roomWidth} cm`,
      margin + scaledRoomWidth / 2 - 40,
      margin - 15
    ); // 横幅
    ctx.fillText(
      `D=${roomDepth} cm`,
      margin + scaledRoomWidth + 15,
      margin + scaledRoomDepth / 2
    ); // 奥行き

    // オブジェクトを描画（すべてのオブジェクトのサイズや位置を反映）
    objectsRef.current.forEach((obj, index) => {
      const geometry = obj.object.geometry;
      if (!geometry) return; // geometryが存在しない場合はスキップ

      let objWidth, objDepth;

      // キューブの場合
      if (geometry instanceof THREE.BoxGeometry) {
        const { width, depth } = geometry.parameters;
        objWidth = width * scale;
        objDepth = depth * scale;

        // オブジェクトをグレーで描画（白黒バージョン）
        ctx.fillStyle = "#888888";
        ctx.fillRect(
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale -
            objWidth / 2,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale -
            objDepth / 2,
          objWidth,
          objDepth
        );
      }
      // 円柱の場合
      else if (geometry instanceof THREE.CylinderGeometry) {
        const radius = geometry.parameters.radiusTop * scale;

        // 円柱をグレーで描画
        ctx.fillStyle = "#888888";
        ctx.beginPath();
        ctx.arc(
          margin + (roomWidth / 2 + obj.object.position.x) * scale,
          margin + (roomDepth / 2 + obj.object.position.z) * scale,
          radius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // キューブの横幅表示
      if (geometry instanceof THREE.BoxGeometry) {
        ctx.beginPath();
        ctx.moveTo(
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale -
            objWidth / 2,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale -
            objDepth / 2 -
            10
        );
        ctx.lineTo(
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale +
            objWidth / 2,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale -
            objDepth / 2 -
            10
        );
        ctx.stroke();
        ctx.fillText(
          `Obj ${index + 1} W=${geometry.parameters.width} cm`,
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale -
            objWidth / 4,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale -
            objDepth / 2 -
            15
        );

        // キューブの奥行き
        ctx.beginPath();
        ctx.moveTo(
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale +
            objWidth / 2 +
            10,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale -
            objDepth / 2
        );
        ctx.lineTo(
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale +
            objWidth / 2 +
            10,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale +
            objDepth / 2
        );
        ctx.stroke();
        ctx.fillText(
          `D=${geometry.parameters.depth} cm`,
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale +
            objWidth / 2 +
            15,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale +
            objDepth / 4
        );
      }
      // 円柱の直径表示
      else if (geometry instanceof THREE.CylinderGeometry) {
        const radius = geometry.parameters.radiusTop * scale;
        ctx.beginPath();
        ctx.moveTo(
          margin + (roomWidth / 2 + obj.object.position.x) * scale - radius,
          margin + (roomDepth / 2 + obj.object.position.z) * scale
        );
        ctx.lineTo(
          margin + (roomWidth / 2 + obj.object.position.x) * scale + radius,
          margin + (roomDepth / 2 + obj.object.position.z) * scale
        );
        ctx.stroke();
        // 円柱の直径ラベルを少し下にずらして表示
        ctx.fillText(
          `Obj ${index + 1} Diameter=${geometry.parameters.radiusTop * 2} cm`,
          margin + (roomWidth / 2 + obj.object.position.x) * scale - radius / 2,
          margin + (roomDepth / 2 + obj.object.position.z) * scale + 20 // ラベルを少し下に
        );
      }
    });
    return canvas;
  };

  const drawTopViewCanvasColor = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // キャンバスサイズ設定（正方形）
    const roomWidth = dimensions.width;
    const roomDepth = dimensions.depth;
    canvas.width = roomWidth + 150; // マージン分追加
    canvas.height = roomDepth + 100; // マージン分追加

    // キャンバスの背景色を床の色に設定
    ctx.fillStyle = floorColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const margin = 50; // マージンのサイズ
    const scale = Math.min(
      (canvas.width - margin * 2) / roomWidth,
      (canvas.height - margin * 2) / roomDepth
    );

    const scaledRoomWidth = roomWidth * scale;
    const scaledRoomDepth = roomDepth * scale;

    // 黒線で部屋の外枠を描画
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, scaledRoomWidth, scaledRoomDepth);

    // 部屋の寸法を表示（横幅と奥行き）
    ctx.fillStyle = "#000000";
    ctx.font = "16px Arial";
    ctx.fillText(
      `W=${roomWidth} cm`,
      margin + scaledRoomWidth / 2 - 40,
      margin - 15
    ); // 横幅
    ctx.fillText(
      `D=${roomDepth} cm`,
      margin + scaledRoomWidth + 15,
      margin + scaledRoomDepth / 2
    ); // 奥行き

    objectsRef.current.forEach((obj, index) => {
      const geometry = obj.object.geometry;
      if (!geometry) return; // geometryが存在しない場合はスキップ

      let objWidth, objDepth;

      // キューブの場合
      if (geometry instanceof THREE.BoxGeometry) {
        const { width, depth } = geometry.parameters;
        objWidth = width * scale;
        objDepth = depth * scale;

        // キューブを描画
        ctx.fillStyle = obj.object.material.color.getStyle();
        ctx.fillRect(
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale -
            objWidth / 2,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale -
            objDepth / 2,
          objWidth,
          objDepth
        );
      }
      // 円柱の場合
      else if (geometry instanceof THREE.CylinderGeometry) {
        const radius = geometry.parameters.radiusTop * scale;

        // 円柱を描画
        ctx.fillStyle = obj.object.material.color.getStyle();
        ctx.beginPath();
        ctx.arc(
          margin + (roomWidth / 2 + obj.object.position.x) * scale,
          margin + (roomDepth / 2 + obj.object.position.z) * scale,
          radius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // キューブの横幅表示
      if (geometry instanceof THREE.BoxGeometry) {
        ctx.beginPath();
        ctx.moveTo(
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale -
            objWidth / 2,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale -
            objDepth / 2 -
            10
        );
        ctx.lineTo(
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale +
            objWidth / 2,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale -
            objDepth / 2 -
            10
        );
        ctx.stroke();
        ctx.fillText(
          `Obj ${index + 1} W=${geometry.parameters.width} cm`,
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale -
            objWidth / 4,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale -
            objDepth / 2 -
            15
        );

        // キューブの奥行き
        ctx.beginPath();
        ctx.moveTo(
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale +
            objWidth / 2 +
            10,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale -
            objDepth / 2
        );
        ctx.lineTo(
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale +
            objWidth / 2 +
            10,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale +
            objDepth / 2
        );
        ctx.stroke();
        ctx.fillText(
          `D=${geometry.parameters.depth} cm`,
          margin +
            (roomWidth / 2 + obj.object.position.x) * scale +
            objWidth / 2 +
            15,
          margin +
            (roomDepth / 2 + obj.object.position.z) * scale +
            objDepth / 4
        );
      }
      // 円柱の直径表示
      else if (geometry instanceof THREE.CylinderGeometry) {
        const radius = geometry.parameters.radiusTop * scale;

        ctx.beginPath();
        ctx.moveTo(
          margin + (roomWidth / 2 + obj.object.position.x) * scale - radius,
          margin + (roomDepth / 2 + obj.object.position.z) * scale
        );
        ctx.lineTo(
          margin + (roomWidth / 2 + obj.object.position.x) * scale + radius,
          margin + (roomDepth / 2 + obj.object.position.z) * scale
        );
        ctx.stroke();
        // 円柱の直径ラベルを少し下にずらして表示
        ctx.fillText(
          `Obj ${index + 1} Diameter=${geometry.parameters.radiusTop * 2} cm`,
          margin + (roomWidth / 2 + obj.object.position.x) * scale - radius / 2,
          margin + (roomDepth / 2 + obj.object.position.z) * scale + 20 // ラベルを少し下に
        );
      }
    });
    return canvas;
  };

  const renderValue = (key, value, label, unit) => {
    if (typeof value === "object" && value !== null) {
      return (
        <div key={key}>
          <p>{label}:</p>
          <ul>
            {Object.entries(value).map(([subKey, subValue]) => {
              const subLabel = subKey;
              return renderValue(subKey, subValue, subLabel, unit);
            })}
          </ul>
        </div>
      );
    } else {
      return (
        <p key={key}>
          {label}: {value}
          {unit && ` ${unit}`}
        </p>
      );
    }
  };

  const handleDeleteLog = (index) => {
    const updatedLogs = [...binedLogs];
    updatedLogs.splice(index, 1); // 指定されたログを削除

    // ローカルストレージの更新
    localStorage.setItem("measurementLogs", JSON.stringify(updatedLogs));
    setMeasurementLogs(updatedLogs); // UIも更新
  };

  const handleObjectCreation = (log) => {
    // "cm"を取り除いて数値に変換する関数
    const parseMeasurement = (value) => {
      if (typeof value === "string") {
        return Math.floor(parseFloat(value.replace("cm", "")));
      }
      return Math.floor(value); // 数値ならそのまま処理
    };

    // 平面データの場合
    if (log.mode === "plane") {
      setObjectType("cube"); // 平面データでもキューブ型で扱う
      setObjectSize({
        width: parseMeasurement(log.result.max_width),
        height: 3, // 高さはデフォルトの3
        depth: parseMeasurement(log.result.max_height),
      });
    }
    // 円柱データの場合
    else if (log.diameter && log.height) {
      console.log("Cylinder data detected:", log); // 円柱データのデバッグ
      setObjectType("cylinder");
      setObjectSize({
        diameter: parseMeasurement(log.diameter), // 直径を取得
        height: parseMeasurement(log.height), // 高さを取得
      });
      console.log("Set object size for cylinder:", {
        diameter: parseMeasurement(log.diameter),
        height: parseMeasurement(log.height),
      });
    }
    // キューブデータの場合
    else if (log.top_horizontal && log.top_vertical && log.side_height) {
      console.log("Cube data detected:", log); // キューブデータのデバッグ
      setObjectType("cube");
      setObjectSize({
        width: parseMeasurement(log.top_horizontal), // 横幅
        height: parseMeasurement(log.side_height), // 高さ
        depth: parseMeasurement(log.top_vertical), // 奥行き
      });
      console.log("Set object size for cube:", {
        width: parseMeasurement(log.top_horizontal),
        height: parseMeasurement(log.side_height),
        depth: parseMeasurement(log.top_vertical),
      });
    }

    // ここでオブジェクト生成画面を開く
    setActivePanel("objectSize");
  };

  return (
    <div
      className={`container1`}
      onMouseMove={resizePanel}
      onMouseUp={stopResizing}
    >
      <div>
        <Sidebar
          openPopup={showPanel}
          resetAll={resetAll}
          resetCameraPosition={resetCameraPosition}
          toggleSpaceLock={toggleSpaceLock}
          isSpaceLocked={isSpaceLocked}
          isSingleSided={isSingleSided}
          setIsSingleSided={setIsSingleSided}
          resetToInitialPositions={resetToInitialPositions}
          setTopViewCamera={setTopViewCamera}
          saveTopViewAsImage={saveTopViewAsImage}
          saveCurrentViewAsImage={saveCurrentViewAsImage}
          drawTopViewCanvasBW={drawTopViewCanvasBW}
          drawTopViewCanvasColor={drawTopViewCanvasColor}
          handleBackToTop={handleBackToTop}
          loggedInUser={loggedInUser}
          handleLogout={handleLogout}
          openLoginModal={openLoginModal}
          handleSaveFile={handleSaveFile}
          handleLoadFile={handleLoadFile}
          handleSaveObjects={handleSaveObjects}
          handleLoadObjects={handleLoadObjects}
          handleSaveAll={handleSaveAll}
          handleLoadAll={handleLoadAll}
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
        {activePanel === "topView" && (
          <button onClick={handleSaveTopView}>天面図を保存</button>
        )}
        {activePanel === "size" && (
          <div className="section">
            <h3>空間のサイズ</h3>
            <div className="dimension-group">
              <label>
                横幅 (m):
                <input
                  type="number"
                  name="width"
                  step="0.1"
                  value={dimensions.width / 100}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                奥行 (m):
                <input
                  type="number"
                  name="depth"
                  step="0.1"
                  value={dimensions.depth / 100}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                高さ (m):
                <input
                  type="number"
                  name="height"
                  step="0.1"
                  value={dimensions.height / 100}
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
              <button onClick={resetToInitialPositions}>元の位置に戻す</button>
              <button onClick={resetCameraPosition}>
                オブジェクトを再描画
              </button>
              <button onClick={setTopViewCamera}>天面図を表示</button>
              <button onClick={saveTopViewAsImage}>天面図を保存</button>
            </div>
          </div>
        )}

        {activePanel === "objectSize" && (
          <div className="section">
            <h3>オブジェクト生成（サイズ・色）</h3>
            <div>
              {/* オブジェクトの種類を選択するドロップダウンメニュー */}
              <label>
                形状:
                <select
                  value={objectType}
                  onChange={(e) => setObjectType(e.target.value)}
                >
                  <option value="cube">キューブ型</option>
                  <option value="cylinder">円柱型</option>
                </select>
              </label>
            </div>
            {objectType === "cube" && (
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
            )}

            {objectType === "cylinder" && (
              <div className="dimension-group">
                <label>
                  直径 (cm):
                  <input
                    type="number"
                    name="diameter"
                    value={objectSize.diameter}
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
              </div>
            )}

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
                <span className="button-text">オブジェクトを追加</span>
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

      {activePanel === "importLog" && (
  <div className="section">
    <h3>サイズ測定の結果をインポートします。</h3>
    <ul>
      {binedLogs.map((log, index) => {
        // データタイプの判定
        const isCylinder = log.diameter && log.height;
        const isCube =
          log.top_horizontal && log.top_vertical && log.side_height && log.top_edges;
        const isPlane = log.result?.max_width && log.result?.max_height;

        // 表示する必要がないデータはスキップ
        if (!isCube && !isCylinder && !isPlane) return null;

        // サイズの単位（cm）を取り除く関数
        const parseMeasurement = (value) => typeof value === "string" ? value.replace("cm", "") : value;

        return (
          <li key={index}>
            {/* 'location' の名前のみを表示 */}
            {log.location && <p>名前: {log.location}</p>}

            {/* 平面データの場合 */}
            {isPlane && (
              <>
                <p>横幅: {parseMeasurement(log.result.max_width)} cm</p>
                <p>奥行き: {parseMeasurement(log.result.max_height)} cm</p>
                <p>高さ: 3 cm（デフォルト値）</p>
                <button onClick={() => handleObjectCreation(log)} className="create-object-button">
                  平面オブジェクトを生成
                </button>
              </>
            )}

            {/* キューブ型の場合 */}
            {isCube && (
              <>
                <p>横幅: {parseMeasurement(log.top_horizontal)} cm</p>
                <p>奥行き: {parseMeasurement(log.top_vertical)} cm</p>
                <p>高さ: {parseMeasurement(log.side_height)} cm</p>
                {Object.entries(log.top_edges).map(([edgeName, edgeValue]) => (
                  <p key={edgeName}>{edgeName}: {parseMeasurement(edgeValue)} cm</p>
                ))}
                <button onClick={() => handleObjectCreation(log)} className="create-object-button">
                  キューブオブジェクトを生成
                </button>
              </>
            )}

            {/* 円柱型の場合 */}
            {isCylinder && (
              <>
                <p>直径: {parseMeasurement(log.diameter)} cm</p>
                <p>高さ: {parseMeasurement(log.height)} cm</p>
                <button onClick={() => handleObjectCreation(log)} className="create-object-button">
                  円柱オブジェクトを生成
                </button>
              </>
            )}

            {/* 削除ボタン */}
            <button onClick={() => handleDeleteLog(index)} className="delete-log-button">
              削除
            </button>
          </li>
        );
      })}
    </ul>
  </div>
)}

        {activePanel === "objectLog" && (
          <div className="section">
            <h3>オブジェクトログ</h3>
            <ul>
              {objectLogs.map((log, index) => {
                // ここで console.log を使って objectType とログの内容を出力する
                console.log("Object Type:", log.objectType); // オブジェクトの種類を確認
                console.log("Object Logs:", log); // 各ログの詳細を確認

                return (
                  <li key={index} className="color-picker-wrapper">
                    {index + 1}.
                    <input
                      type="color"
                      value={log.color}
                      className="custom-color-picker"
                      onChange={(e) => handleColorChange(e, index)} // 色が変わったときに実行
                    />
                    <span
                      className="custom-color-picker-label"
                      style={{ backgroundColor: log.color }}
                    ></span>
                    {/* objectType に基づいて表示する情報を分ける */}
                    {log.objectType === "cube" ? (
                      <p>
                        (幅: {log.width}cm, 高さ: {log.height}cm, 奥行:{" "}
                        {log.depth}cm)
                      </p>
                    ) : (
                      <p>
                        (直径: {log.diameter}cm, 高さ: {log.height}cm)
                      </p>
                    )}
                    {log.isWireframe ? " [枠線のみ]" : ""}
                    <button onClick={() => removeObject(index)}>消去</button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeDapp;
