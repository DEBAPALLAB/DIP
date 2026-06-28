"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface NodeData {
  mesh: THREE.Mesh;
  group: number;
  distFromCenter: number;
  adopted: boolean;
  baseOpacity: number;
  baseColor: THREE.Color;
  scale: number;
  targetScale: number;
  id: string;
  name: string;
  conformity: number;
  influenceRadius: number;
  basePosition: THREE.Vector3;
}

const GROUP_NAMES = ["Early Adopter", "Support", "Opposition", "Undecided"];
const GROUP_WEIGHTS = [0.28, 0.32, 0.18, 0.22];

function pickGroup(): number {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < GROUP_WEIGHTS.length; i++) {
    acc += GROUP_WEIGHTS[i];
    if (r < acc) return i;
  }
  return 0;
}

function HeroNetworkCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const relativeMouseRef = useRef({ x: 0, y: 0 }); // for raycasting

  // UI state for floating tooltip overlay
  const [hoveredAgent, setHoveredAgent] = useState<{
    id: string;
    groupName: string;
    color: string;
    conformity: number;
    influenceRadius: number;
    adopted: boolean;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = mountRef.current;
    if (!el || typeof window === "undefined") return;

    // Visibility Observer to pause rendering when off-screen
    let isVisible = true;
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      isVisible = entry.isIntersecting;
    };
    const visibilityObserver = new IntersectionObserver(observerCallback, {
      threshold: 0.01,
    });
    visibilityObserver.observe(el);

    const W = el.clientWidth || 560;
    const H = el.clientHeight || 560;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const isLightTheme = document.body.classList.contains("marketing-theme") || 
                          !!document.querySelector(".marketing-theme");

    // Unified adaptive colors based on theme context
    const THEME_COLORS = [
      isLightTheme ? new THREE.Color("#0052ff") : new THREE.Color("#C8F135"), // Early Adopters (Cobalt / Lime)
      isLightTheme ? new THREE.Color("#6366f1") : new THREE.Color("#9333ea"), // Support (Indigo / Purple)
      isLightTheme ? new THREE.Color("#f43f5e") : new THREE.Color("#ef4444"), // Opposition (Rose / Red)
      isLightTheme ? new THREE.Color("#94a3b8") : new THREE.Color("#4b5563"), // Undecided (Slate Gray)
    ];

    const activeColor = isLightTheme ? new THREE.Color("#0052ff") : new THREE.Color("#C8F135");

    /* ── Renderer ──────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    /* ── Scene / Camera ────────────────────────────────────────── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.z = 8.5;

    // Removed fog to keep colors vibrant, crisp, and high-contrast

    /* ── Lights ────────────────────────────────────────────────── */
    const ambientLight = new THREE.AmbientLight(isLightTheme ? 0xffffff : 0x222222, isLightTheme ? 0.8 : 0.35);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, isLightTheme ? 1.0 : 1.5);
    dirLight1.position.set(6, 12, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(activeColor, isLightTheme ? 0.7 : 0.95);
    dirLight2.position.set(-6, -4, 4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(activeColor, isLightTheme ? 2.5 : 3.0, 15);
    pointLight.position.set(0, 0, 1);
    scene.add(pointLight);

    /* ── Graph Group ───────────────────────────────────────────── */
    const graph = new THREE.Group();
    scene.add(graph);

    /* ── Undulating Topographical Grid Floor ──────────────────── */
    const gridColor = isLightTheme ? 0x0052ff : 0xC8F135;
    const planeGeo = new THREE.PlaneGeometry(18, 18, 16, 16);
    const planeMat = new THREE.MeshStandardMaterial({
      color: gridColor,
      wireframe: true,
      transparent: true,
      opacity: isLightTheme ? 0.22 : 0.32,
      roughness: 0.5,
      metalness: 0.1,
      emissive: new THREE.Color(gridColor),
      emissiveIntensity: 0.15,
    });
    const waveGrid = new THREE.Mesh(planeGeo, planeMat);
    waveGrid.position.set(0, -2.1, -1.5);
    waveGrid.rotation.x = -Math.PI / 2.3;
    scene.add(waveGrid);

    /* ── Stars / Dust Particles Background ─────────────────────── */
    const starCount = isMobile ? 96 : 180;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 5 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.04,
      color: isLightTheme ? 0x8888aa : 0xcccccc,
      transparent: true,
      opacity: isLightTheme ? 0.35 : 0.45,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    /* ── Shared Geometry (Smoother node spheres) ───────────────── */
    const sharedGeo = new THREE.SphereGeometry(1, 8, 8);

    /* ── Nodes ─────────────────────────────────────────────────── */
    const NODE_COUNT = isMobile ? 42 : 65;
    const nodeData: NodeData[] = [];
    const positions: THREE.Vector3[] = [];
    const nodeMeshes: THREE.Mesh[] = [];

    // Adjacency structure for propagation & network visualization
    const adjacency: number[][] = Array.from({ length: NODE_COUNT }, () => []);

    for (let i = 0; i < NODE_COUNT; i++) {
      const r = 1.8 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const pos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.65,
        r * Math.cos(phi)
      );
      positions.push(pos);

      const g = pickGroup();
      const size = 0.055 + Math.random() * 0.085;
      const opacity = 0.75 + Math.random() * 0.25;

      // Ultra-vibrant glowing node material (optimized to Standard)
      const mat = new THREE.MeshStandardMaterial({
        color: THEME_COLORS[g].clone(),
        roughness: 0.4,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9,
        emissive: THEME_COLORS[g].clone(),
        emissiveIntensity: g === 1 ? 0.5 : 0.25, // beautiful interior glow!
      });

      const mesh = new THREE.Mesh(sharedGeo, mat);
      mesh.scale.setScalar(size);
      mesh.position.copy(pos);
      mesh.userData = { index: i };
      graph.add(mesh);
      nodeMeshes.push(mesh);

      nodeData.push({
        mesh,
        group: g,
        distFromCenter: pos.length(),
        adopted: false,
        baseOpacity: opacity,
        baseColor: THEME_COLORS[g].clone(),
        scale: size,
        targetScale: size,
        id: `AG-${String(i).padStart(3, "0")}`,
        name: `Agent ${i}`,
        conformity: Math.floor(65 + Math.random() * 30),
        influenceRadius: parseFloat((1.2 + Math.random() * 2.2).toFixed(1)),
        basePosition: pos.clone(),
      });
    }

    /* ── Edges with Vertex Colors ────────────────────────────── */
    const DIST_THRESHOLD = 2.0;
    const edgeVerts: number[] = [];
    const edgeColors: number[] = [];
    const edgeConnections: { i: number; j: number; vertIndex: number }[] = [];
    const activeEdges: { fromIdx: number; toIdx: number }[] = [];

    let vertexCounter = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (
          positions[i].distanceTo(positions[j]) < DIST_THRESHOLD &&
          Math.random() < 0.25
        ) {
          adjacency[i].push(j);
          adjacency[j].push(i);

          edgeVerts.push(
            positions[i].x, positions[i].y, positions[i].z,
            positions[j].x, positions[j].y, positions[j].z
          );

          // If either node is in Support group (index 1)
          const isGreenI = nodeData[i].group === 1;
          const isGreenJ = nodeData[j].group === 1;
          const isGreenEdge = isGreenI || isGreenJ;

          if (isGreenEdge) {
            edgeColors.push(
              activeColor.r, activeColor.g, activeColor.b,
              activeColor.r, activeColor.g, activeColor.b
            );
            activeEdges.push({
              fromIdx: i,
              toIdx: j,
            });
          } else {
            const c1 = THEME_COLORS[nodeData[i].group];
            const c2 = THEME_COLORS[nodeData[j].group];
            edgeColors.push(
              c1.r, c1.g, c1.b,
              c2.r, c2.g, c2.b
            );
          }

          edgeConnections.push({
            i,
            j,
            vertIndex: vertexCounter,
          });
          vertexCounter += 2;
        }
      }
    }

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgeVerts, 3));
    edgeGeo.setAttribute("color", new THREE.Float32BufferAttribute(edgeColors, 3));

    const edgeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: isLightTheme ? 0.28 : 0.22, // pop connections
    });
    const edgeSegments = new THREE.LineSegments(edgeGeo, edgeMat);
    graph.add(edgeSegments);

    /* ── Flowing Dotted Streams for Active Edges ──────────────── */
    const numDotsPerEdge = 4;
    const totalFlowDots = activeEdges.length * numDotsPerEdge;
    const flowPositions = new Float32Array(totalFlowDots * 3);
    const flowGeo = new THREE.BufferGeometry();
    flowGeo.setAttribute("position", new THREE.BufferAttribute(flowPositions, 3));

    const flowMat = new THREE.PointsMaterial({
      color: activeColor,
      size: 0.075, // larger flow dots
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const flowPoints = new THREE.Points(flowGeo, flowMat);
    graph.add(flowPoints);

    /* ── Centre Hub ────────────────────────────────────────────── */
    const hubGeo = new THREE.SphereGeometry(0.24, 20, 20);
    const hubMat = new THREE.MeshStandardMaterial({
      color: activeColor,
      emissive: activeColor,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.35,
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    graph.add(hub);

    // Outer glow ring
    const ringGeo = new THREE.RingGeometry(0.34, 0.40, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: activeColor,
      emissive: activeColor,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    graph.add(ring);

    /* ── Second orbit ring ─────────────────────────────────────── */
    const ring2Geo = new THREE.RingGeometry(0.58, 0.62, 48);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: THEME_COLORS[1],
      emissive: THEME_COLORS[1],
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    graph.add(ring2);

    /* ── Cascade State Machine (Contagion Cascade Simulation) ───── */
    let cascadeQueue: number[] = [];
    let isCascading = false;
    let cascadeTimer = 0;
    const CASCADE_CYCLE = 5.0; // trigger cascade every 5s
    const CONTAGION_SPEED = 0.35;
    let contagionTimer = 0;

    function triggerContagionCascade() {
      isCascading = true;
      cascadeQueue = [];
      nodeData.forEach((n) => {
        n.adopted = false;
        const mat = n.mesh.material as THREE.MeshStandardMaterial;
        mat.color.copy(n.baseColor);
        mat.opacity = n.baseOpacity;
        mat.emissive.copy(n.baseColor);
        mat.emissiveIntensity = n.group === 1 ? 0.15 : 0.04;
      });

      // Find nodes closest to the center to initiate cascade
      const seeds = [...nodeData]
        .sort((a, b) => a.distFromCenter - b.distFromCenter)
        .slice(0, 3);

      seeds.forEach((seed) => {
        const idx = nodeData.findIndex((n) => n.id === seed.id);
        if (idx !== -1) {
          nodeData[idx].adopted = true;
          cascadeQueue.push(idx);
        }
      });
    }

    /* ── Raycasting & Mouse Interaction ────────────────────────── */
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.12 };
    const relativeMouse = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      };

      // Normalized coordinates for Raycasting (-1 to +1)
      relativeMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      relativeMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Tooltip positioning
      relativeMouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    window.addEventListener("mousemove", onMouseMove);

    /* ── Resize ─────────────────────────────────────────────────── */
    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObs = new ResizeObserver(onResize);
    resizeObs.observe(el);

    /* ── Active Signal Packets (Traveling pulses on edges) ──────── */
    interface Packet {
      fromIdx: number;
      toIdx: number;
      progress: number;
      speed: number;
      mesh: THREE.Mesh;
    }
    const activePackets: Packet[] = [];
    const packetGeo = new THREE.SphereGeometry(0.024, 8, 8);
    const packetMat = new THREE.MeshStandardMaterial({ 
      color: activeColor,
      emissive: activeColor,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.9,
    });

    function createPacket(fromIdx: number, toIdx: number) {
      const pMesh = new THREE.Mesh(packetGeo, packetMat);
      graph.add(pMesh);
      activePackets.push({
        fromIdx,
        toIdx,
        progress: 0,
        speed: 2.2 + Math.random() * 1.5,
        mesh: pMesh,
      });
    }

    /* ── Animation Loop ────────────────────────────────────────── */
    let raf: number;
    let time = 0;
    let lastTime = performance.now();
    let lastHoveredIndex = -1;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!isVisible) return;

      time += dt;
      cascadeTimer += dt;

      // Drift background stars
      starPoints.rotation.y = time * 0.015;
      starPoints.rotation.x = Math.sin(time * 0.01) * 0.05;

      // Auto rotation of graph
      graph.rotation.y += 0.0006;

      // Camera parallax for massive stereoscopic depth
      const targetCamX = mouseRef.current.x * 2.0;
      const targetCamY = -mouseRef.current.y * 2.0;
      camera.position.x += (targetCamX - camera.position.x) * 0.045;
      camera.position.y += (targetCamY - camera.position.y) * 0.045;
      camera.lookAt(0, 0, 0);

      // Central Hub pulse
      const hubScale = 1 + Math.sin(time * 2.5) * 0.12;
      hub.scale.setScalar(hubScale);
      (hub.material as THREE.MeshStandardMaterial).opacity = 0.25 + Math.sin(time * 2.5) * 0.08;

      ring.rotation.z = time * 0.45;
      ring.rotation.x = Math.sin(time * 0.3) * 0.25;
      (ring.material as THREE.MeshStandardMaterial).opacity = 0.16 + Math.sin(time * 2.0) * 0.06;

      ring2.rotation.z = -time * 0.28;
      (ring2.material as THREE.MeshStandardMaterial).opacity = 0.1 + Math.sin(time * 1.2) * 0.04;

      // Animate grid topography waves
      const posAttr = planeGeo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i);
        const dist = Math.sqrt(v.x * v.x + v.y * v.y);
        const z = Math.sin(dist * 0.8 - time * 1.6) * 0.25;
        posAttr.setZ(i, z);
      }
      posAttr.needsUpdate = true;

      // Organic float & undulation for nodes
      nodeData.forEach((node, idx) => {
        const tOffset1 = time * 0.8 + node.distFromCenter * 1.5;
        const tOffset2 = time * 1.1 + node.distFromCenter * 2.0;

        node.mesh.position.x = node.basePosition.x + Math.sin(tOffset1) * 0.08;
        node.mesh.position.y = node.basePosition.y + Math.cos(tOffset2) * 0.08;
        node.mesh.position.z = node.basePosition.z + Math.sin(tOffset1 + tOffset2) * 0.06;
      });

      /* ── Raycasting & Node Hover Handling ──────────────────────── */
      raycaster.setFromCamera(relativeMouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      let hoveredIdx = -1;
      if (intersects.length > 0) {
        const firstIntersect = intersects[0];
        if (firstIntersect.object.userData) {
          hoveredIdx = firstIntersect.object.userData.index;
        }
      }

      if (hoveredIdx !== lastHoveredIndex) {
        lastHoveredIndex = hoveredIdx;
        if (hoveredIdx !== -1) {
          const node = nodeData[hoveredIdx];
          setHoveredAgent({
            id: node.id,
            groupName: GROUP_NAMES[node.group],
            color: `#${THEME_COLORS[node.group].getHexString()}`,
            conformity: node.conformity,
            influenceRadius: node.influenceRadius,
            adopted: node.adopted,
          });
        } else {
          setHoveredAgent(null);
        }
      }

      if (hoveredIdx !== -1) {
        setTooltipPos({
          x: relativeMouseRef.current.x,
          y: relativeMouseRef.current.y,
        });
      }

      /* ── Node Visual Scaling and Connection Highlights ─────────── */
      const isNodeHovered = hoveredIdx !== -1;
      const hoveredNeighbors = isNodeHovered ? adjacency[hoveredIdx] : [];

      nodeData.forEach((node, idx) => {
        if (idx === hoveredIdx) {
          node.targetScale = node.scale * 1.8;
        } else if (isNodeHovered && hoveredNeighbors.includes(idx)) {
          node.targetScale = node.scale * 1.35;
        } else if (isNodeHovered) {
          node.targetScale = node.scale * 0.6;
        } else {
          node.targetScale = node.scale;
        }

        const currentScale = node.mesh.scale.x;
        const nextScale = currentScale + (node.targetScale - currentScale) * 0.18;
        node.mesh.scale.setScalar(nextScale);

        let targetOpacity = node.baseOpacity;
        if (node.adopted) {
          targetOpacity = 0.95;
        }
        if (isNodeHovered) {
          if (idx === hoveredIdx) {
            targetOpacity = 1.0;
          } else if (hoveredNeighbors.includes(idx)) {
            targetOpacity = 0.85;
          } else {
            targetOpacity = 0.15;
          }
        }
        const mat = node.mesh.material as THREE.MeshStandardMaterial;
        mat.opacity += (targetOpacity - mat.opacity) * 0.15;
      });

      /* ── Edge Coordinates & Colors Redrawing ──────────────────── */
      const edgePosAttr = edgeGeo.getAttribute("position") as THREE.BufferAttribute;
      const edgePosArr = edgePosAttr.array as Float32Array;
      const colorsAttr = edgeGeo.getAttribute("color") as THREE.BufferAttribute;
      const colorsArr = colorsAttr.array as Float32Array;

      edgeConnections.forEach((edge) => {
        const offset = edge.vertIndex * 3;

        const posI = nodeData[edge.i].mesh.position;
        const posJ = nodeData[edge.j].mesh.position;
        const nodeI = nodeData[edge.i];
        const nodeJ = nodeData[edge.j];

        // Draw dynamic coordinates stretching with floating nodes
        edgePosArr[offset] = posI.x;
        edgePosArr[offset + 1] = posI.y;
        edgePosArr[offset + 2] = posI.z;
        edgePosArr[offset + 3] = posJ.x;
        edgePosArr[offset + 4] = posJ.y;
        edgePosArr[offset + 5] = posJ.z;

        const isHoverConnected = isNodeHovered && (edge.i === hoveredIdx || edge.j === hoveredIdx);
        const isGreen = nodeI.group === 1 || nodeJ.group === 1;

        let cI = isGreen ? activeColor : (nodeI.mesh.material as THREE.MeshStandardMaterial).color;
        let cJ = isGreen ? activeColor : (nodeJ.mesh.material as THREE.MeshStandardMaterial).color;

        let intensity = isGreen ? 0.35 : 0.18;

        if (isNodeHovered) {
          if (isHoverConnected) {
            intensity = 0.95;
          } else {
            intensity = 0.02;
          }
        } else if (nodeI.adopted && nodeJ.adopted) {
          intensity = 0.65;
        }

        colorsArr[offset] = cI.r * intensity;
        colorsArr[offset + 1] = cI.g * intensity;
        colorsArr[offset + 2] = cI.b * intensity;
        colorsArr[offset + 3] = cJ.r * intensity;
        colorsArr[offset + 4] = cJ.g * intensity;
        colorsArr[offset + 5] = cJ.b * intensity;
      });
      edgePosAttr.needsUpdate = true;
      colorsAttr.needsUpdate = true;

      /* ── Flow Dotted streams along dynamic edges ───────────────── */
      let flowIdx = 0;
      const flowPosAttr = flowGeo.getAttribute("position") as THREE.BufferAttribute;
      const flowPosArr = flowPosAttr.array as Float32Array;

      activeEdges.forEach((edge) => {
        const posFrom = nodeData[edge.fromIdx].mesh.position;
        const posTo = nodeData[edge.toIdx].mesh.position;
        for (let d = 0; d < numDotsPerEdge; d++) {
          const offset = d / numDotsPerEdge;
          const progress = (time * 0.35 + offset) % 1.0;

          const x = posFrom.x + (posTo.x - posFrom.x) * progress;
          const y = posFrom.y + (posTo.y - posFrom.y) * progress;
          const z = posFrom.z + (posTo.z - posFrom.z) * progress;

          flowPosArr[flowIdx] = x;
          flowPosArr[flowIdx + 1] = y;
          flowPosArr[flowIdx + 2] = z;
          flowIdx += 3;
        }
      });
      flowPosAttr.needsUpdate = true;

      /* ── Active Propagation Cascades ──────────────────────────── */
      if (cascadeTimer >= CASCADE_CYCLE) {
        triggerContagionCascade();
        cascadeTimer = 0;
      }

      if (isCascading) {
        contagionTimer += dt;
        if (contagionTimer >= CONTAGION_SPEED) {
          contagionTimer = 0;

          const nextQueue: number[] = [];
          cascadeQueue.forEach((parentIdx) => {
            const neighbors = adjacency[parentIdx];
            neighbors.forEach((neighIdx) => {
              const neighbor = nodeData[neighIdx];
              if (!neighbor.adopted) {
                const adoptionChance = neighbor.conformity / 250 + 0.15;
                if (Math.random() < adoptionChance) {
                  neighbor.adopted = true;
                  const mat = neighbor.mesh.material as THREE.MeshStandardMaterial;
                  mat.color.set(activeColor);
                  mat.emissive.set(activeColor);
                  mat.emissiveIntensity = 0.5;
                  nextQueue.push(neighIdx);
                  createPacket(parentIdx, neighIdx);
                }
              }
            });
          });

          if (nextQueue.length === 0) {
            isCascading = false;
          } else {
            cascadeQueue = nextQueue;
          }
        }
      }

      /* ── Animate dynamic edge packets ─────────────────────────── */
      for (let i = activePackets.length - 1; i >= 0; i--) {
        const p = activePackets[i];
        p.progress += p.speed * dt;

        if (p.progress >= 1.0) {
          graph.remove(p.mesh);
          activePackets.splice(i, 1);
        } else {
          const posFrom = nodeData[p.fromIdx].mesh.position;
          const posTo = nodeData[p.toIdx].mesh.position;
          p.mesh.position.lerpVectors(posFrom, posTo, p.progress);
          (p.mesh.material as THREE.MeshStandardMaterial).opacity = Math.sin(p.progress * Math.PI) * 0.9;
        }
      }

      renderer.render(scene, camera);
    };

    animate();
    triggerContagionCascade();

    /* ── Cleanup ────────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      resizeObs.disconnect();
      visibilityObserver.disconnect();
      renderer.dispose();
      sharedGeo.dispose();
      hubGeo.dispose();
      ringGeo.dispose();
      ring2Geo.dispose();
      starGeo.dispose();
      packetGeo.dispose();
      edgeGeo.dispose();
      flowGeo.dispose();
      flowMat.dispose();
      packetMat.dispose();
      planeGeo.dispose();
      planeMat.dispose();

      activePackets.forEach((p) => graph.remove(p.mesh));

      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <div
        ref={mountRef}
        style={{ width: "100%", height: "100%" }}
      />

      {/* Floating high-fidelity telemetry tooltip HUD */}
      {hoveredAgent && (
        <div
          style={{
            position: "absolute",
            left: `${tooltipPos.x + 16}px`,
            top: `${tooltipPos.y + 16}px`,
            background: "rgba(10, 10, 10, 0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--border-bright)",
            borderRadius: "6px",
            padding: "10px 14px",
            pointerEvents: "none",
            zIndex: 9999,
            fontFamily: "var(--mono)",
            fontSize: "11px",
            minWidth: "200px",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.65), inset 0 0 10px rgba(255, 255, 255, 0.02)",
            transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
          }}
        >
          {/* Header block */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "6px",
            }}
          >
            <span style={{ color: "var(--bright)", fontWeight: 700 }}>
              {hoveredAgent.id}
            </span>
            <span
              style={{
                fontSize: "9px",
                padding: "2px 6px",
                borderRadius: "2px",
                fontWeight: 700,
                color: hoveredAgent.color,
                background: `${hoveredAgent.color}15`,
                border: `1px solid ${hoveredAgent.color}30`,
              }}
            >
              {hoveredAgent.groupName}
            </span>
          </div>

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>CONFORMITY:</span>
              <span style={{ color: "var(--bright)" }}>{hoveredAgent.conformity}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>INFLUENCE_R:</span>
              <span style={{ color: "var(--bright)" }}>{hoveredAgent.influenceRadius}m</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>STATUS:</span>
              <span
                style={{
                  color: hoveredAgent.adopted ? "var(--accent)" : "var(--muted)",
                  fontWeight: 700,
                }}
              >
                {hoveredAgent.adopted ? "ADOPTED" : "RESISTING"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function HeroNetwork3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect(); // Load once and keep loaded
        }
      },
      { rootMargin: "150px" } // Pre-load when within 150px of viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {isLoaded ? <HeroNetworkCanvas /> : <div style={{ width: "100%", height: "100%", background: "transparent" }} />}
    </div>
  );
}
