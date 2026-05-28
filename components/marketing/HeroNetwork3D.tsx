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
}

const BASE_COLORS = [
  new THREE.Color("#ff6b35"), // Early Adopters (orange)
  new THREE.Color("#C8F135"), // Support (lime)
  new THREE.Color("#ff4444"), // Opposition (red)
  new THREE.Color("#888888"), // Undecided (grey)
];

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

export function HeroNetwork3D() {
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

    const W = el.clientWidth || 560;
    const H = el.clientHeight || 560;

    /* ── Renderer ──────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    /* ── Scene / Camera ────────────────────────────────────────── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 100);
    camera.position.z = 8.5;

    /* ── Graph Group ───────────────────────────────────────────── */
    const graph = new THREE.Group();
    scene.add(graph);

    /* ── Grid/HUD Background ───────────────────────────────────── */
    const gridHelper = new THREE.GridHelper(14, 28, 0x222222, 0x111111);
    gridHelper.position.z = -3;
    gridHelper.rotation.x = Math.PI / 2.3;
    scene.add(gridHelper);

    /* ── Stars / Dust Particles Background ─────────────────────── */
    const starCount = 150;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 4 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0x888888,
      transparent: true,
      opacity: 0.25,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    /* ── Shared Geometries (Optimized!) ────────────────────────── */
    const sharedGeo = new THREE.SphereGeometry(1, 12, 12);

    /* ── Nodes ─────────────────────────────────────────────────── */
    const NODE_COUNT = 90;
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
      const size = 0.045 + Math.random() * 0.075;
      const opacity = 0.55 + Math.random() * 0.45;

      const mat = new THREE.MeshBasicMaterial({
        color: BASE_COLORS[g].clone(),
        transparent: true,
        opacity,
      });

      const mesh = new THREE.Mesh(sharedGeo, mat);
      mesh.scale.setScalar(size);
      mesh.position.copy(pos);
      // Store reference index for raycasting
      mesh.userData = { index: i };
      graph.add(mesh);
      nodeMeshes.push(mesh);

      nodeData.push({
        mesh,
        group: g,
        distFromCenter: pos.length(),
        adopted: false,
        baseOpacity: opacity,
        baseColor: BASE_COLORS[g].clone(),
        scale: size,
        targetScale: size,
        id: `AG-${String(i).padStart(3, "0")}`,
        name: `Agent ${i}`,
        conformity: Math.floor(65 + Math.random() * 30),
        influenceRadius: parseFloat((1.2 + Math.random() * 2.2).toFixed(1)),
      });
    }

    /* ── Edges with Vertex Colors (Legibility & Visual Quality) ── */
    const DIST_THRESHOLD = 2.0;
    const edgeVerts: number[] = [];
    const edgeColors: number[] = [];
    const edgeConnections: { i: number; j: number; vertIndex: number }[] = [];
    const greenEdges: { from: THREE.Vector3; to: THREE.Vector3 }[] = [];

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

          // If either node is a green node (Support group, which is group 1)
          const isGreenI = nodeData[i].group === 1;
          const isGreenJ = nodeData[j].group === 1;
          const isGreenEdge = isGreenI || isGreenJ;

          const greenColor = new THREE.Color("#C8F135");

          if (isGreenEdge) {
            edgeColors.push(
              greenColor.r, greenColor.g, greenColor.b,
              greenColor.r, greenColor.g, greenColor.b
            );
            greenEdges.push({
              from: positions[i],
              to: positions[j],
            });
          } else {
            const c1 = BASE_COLORS[nodeData[i].group];
            const c2 = BASE_COLORS[nodeData[j].group];
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
      opacity: 0.12,
    });
    const edgeSegments = new THREE.LineSegments(edgeGeo, edgeMat);
    graph.add(edgeSegments);

    /* ── Flowing Dotted Streams for Green Edges ────────────────── */
    const numDotsPerEdge = 4;
    const totalFlowDots = greenEdges.length * numDotsPerEdge;
    const flowPositions = new Float32Array(totalFlowDots * 3);
    const flowGeo = new THREE.BufferGeometry();
    flowGeo.setAttribute("position", new THREE.BufferAttribute(flowPositions, 3));

    const flowMat = new THREE.PointsMaterial({
      color: 0xC8F135,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const flowPoints = new THREE.Points(flowGeo, flowMat);
    graph.add(flowPoints);

    /* ── Centre Hub ────────────────────────────────────────────── */
    const hubGeo = new THREE.SphereGeometry(0.22, 20, 20);
    const hubMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff6b35"),
      transparent: true,
      opacity: 0.25,
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    graph.add(hub);

    // Outer glow ring
    const ringGeo = new THREE.RingGeometry(0.32, 0.38, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff6b35"),
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    graph.add(ring);

    /* ── Second orbit ring ─────────────────────────────────────── */
    const ring2Geo = new THREE.RingGeometry(0.55, 0.59, 48);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#C8F135"),
      transparent: true,
      opacity: 0.08,
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
    const CONTAGION_SPEED = 0.35; // time between contagion hops in seconds
    let contagionTimer = 0;

    function triggerContagionCascade() {
      isCascading = true;
      cascadeQueue = [];
      // Reset all nodes to base state
      nodeData.forEach((n) => {
        n.adopted = false;
        (n.mesh.material as THREE.MeshBasicMaterial).color.copy(n.baseColor);
        (n.mesh.material as THREE.MeshBasicMaterial).opacity = n.baseOpacity;
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
    // increase search tolerance for cleaner pointer feel
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
      from: THREE.Vector3;
      to: THREE.Vector3;
      progress: number;
      speed: number;
      mesh: THREE.Mesh;
    }
    const activePackets: Packet[] = [];
    const packetGeo = new THREE.SphereGeometry(0.02, 6, 6);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    function createPacket(fromIdx: number, toIdx: number) {
      const pMesh = new THREE.Mesh(packetGeo, packetMat);
      graph.add(pMesh);
      activePackets.push({
        from: positions[fromIdx],
        to: positions[toIdx],
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
      time += dt;
      cascadeTimer += dt;

      // Drift background stars
      starPoints.rotation.y = time * 0.015;
      starPoints.rotation.x = Math.sin(time * 0.01) * 0.05;

      // Auto rotation of graph (extremely slow and elegant)
      graph.rotation.y += 0.0006;

      // Mouse parallax
      const targetRX = mouseRef.current.y * 0.28;
      graph.rotation.x += (targetRX - graph.rotation.x) * 0.05;

      // Central Hub animation
      const hubScale = 1 + Math.sin(time * 2.5) * 0.12;
      hub.scale.setScalar(hubScale);
      hubMat.opacity = 0.2 + Math.sin(time * 2.5) * 0.08;

      ring.rotation.z = time * 0.45;
      ring.rotation.x = Math.sin(time * 0.3) * 0.25;
      ringMat.opacity = 0.12 + Math.sin(time * 2.0) * 0.05;

      ring2.rotation.z = -time * 0.28;
      ring2Mat.opacity = 0.06 + Math.sin(time * 1.2) * 0.03;

      /* ── Raycasting & Node Hover Handling ──────────────────────── */
      raycaster.setFromCamera(relativeMouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      let hoveredIdx = -1;
      if (intersects.length > 0) {
        // Retrieve node index from user data
        const firstIntersect = intersects[0];
        if (firstIntersect.object.userData) {
          hoveredIdx = firstIntersect.object.userData.index;
        }
      }

      // If hover state changed, update UI state and trigger highlights
      if (hoveredIdx !== lastHoveredIndex) {
        lastHoveredIndex = hoveredIdx;
        if (hoveredIdx !== -1) {
          const node = nodeData[hoveredIdx];
          setHoveredAgent({
            id: node.id,
            groupName: GROUP_NAMES[node.group],
            color: `#${BASE_COLORS[node.group].getHexString()}`,
            conformity: node.conformity,
            influenceRadius: node.influenceRadius,
            adopted: node.adopted,
          });
        } else {
          setHoveredAgent(null);
        }
      }

      // Update tooltip position smoothly if hovered
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
        // Adjust scales based on interactive state
        if (idx === hoveredIdx) {
          node.targetScale = node.scale * 1.8;
        } else if (isNodeHovered && hoveredNeighbors.includes(idx)) {
          node.targetScale = node.scale * 1.35;
        } else if (isNodeHovered) {
          node.targetScale = node.scale * 0.65;
        } else {
          node.targetScale = node.scale;
        }

        // Lerp scale for ultra-smooth feedback
        const currentScale = node.mesh.scale.x;
        const nextScale = currentScale + (node.targetScale - currentScale) * 0.18;
        node.mesh.scale.setScalar(nextScale);

        // Lerp opacities for node dimming effect
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
        const mat = node.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity += (targetOpacity - mat.opacity) * 0.15;
      });

      /* ── Edge Colors / Highlight Redrawing ─────────────────────── */
      const colorsAttr = edgeGeo.getAttribute("color") as THREE.BufferAttribute;
      const colorsArr = colorsAttr.array as Float32Array;

      edgeConnections.forEach((edge) => {
        const offset = edge.vertIndex * 3; // each vertex has 3 floats (RGB)

        const nodeI = nodeData[edge.i];
        const nodeJ = nodeData[edge.j];

        // Determine if edge connects to the active hover state
        const isHoverConnected = isNodeHovered && (edge.i === hoveredIdx || edge.j === hoveredIdx);

        // Green edge check
        const isGreen = nodeI.group === 1 || nodeJ.group === 1;
        const greenColor = new THREE.Color("#C8F135");

        let cI = isGreen ? greenColor : (nodeI.mesh.material as THREE.MeshBasicMaterial).color;
        let cJ = isGreen ? greenColor : (nodeJ.mesh.material as THREE.MeshBasicMaterial).color;

        // Dynamic edge coloring based on state
        let intensity = isGreen ? 0.35 : 0.18;

        if (isNodeHovered) {
          if (isHoverConnected) {
            intensity = 0.95; // bright active edge
          } else {
            intensity = 0.02; // dim unrelated edges
          }
        } else if (nodeI.adopted && nodeJ.adopted) {
          intensity = 0.65; // adopted-to-adopted connections active
        }

        // Set colors in buffer
        colorsArr[offset] = cI.r * intensity;
        colorsArr[offset + 1] = cI.g * intensity;
        colorsArr[offset + 2] = cI.b * intensity;

        colorsArr[offset + 3] = cJ.r * intensity;
        colorsArr[offset + 4] = cJ.g * intensity;
        colorsArr[offset + 5] = cJ.b * intensity;
      });
      colorsAttr.needsUpdate = true;

      /* ── Flow Dotted streams along green edges ─────────────────── */
      let flowIdx = 0;
      const flowPosAttr = flowGeo.getAttribute("position") as THREE.BufferAttribute;
      const flowPosArr = flowPosAttr.array as Float32Array;

      greenEdges.forEach((edge) => {
        for (let d = 0; d < numDotsPerEdge; d++) {
          const offset = d / numDotsPerEdge;
          // Progress moves forward along the line segment
          const progress = (time * 0.45 + offset) % 1.0;

          // Interpolate current position
          const x = edge.from.x + (edge.to.x - edge.from.x) * progress;
          const y = edge.from.y + (edge.to.y - edge.from.y) * progress;
          const z = edge.from.z + (edge.to.z - edge.from.z) * progress;

          flowPosArr[flowIdx] = x;
          flowPosArr[flowIdx + 1] = y;
          flowPosArr[flowIdx + 2] = z;
          flowIdx += 3;
        }
      });
      flowPosAttr.needsUpdate = true;

      /* ── Active Propagation Cascades (Contagion Simulation) ────── */
      if (cascadeTimer >= CASCADE_CYCLE) {
        triggerContagionCascade();
        cascadeTimer = 0;
      }

      if (isCascading) {
        contagionTimer += dt;
        if (contagionTimer >= CONTAGION_SPEED) {
          contagionTimer = 0;

          // Next generation of cascade adoptions
          const nextQueue: number[] = [];
          cascadeQueue.forEach((parentIdx) => {
            const neighbors = adjacency[parentIdx];
            neighbors.forEach((neighIdx) => {
              const neighbor = nodeData[neighIdx];
              if (!neighbor.adopted) {
                // High-fidelity probability cascade
                const adoptionChance = neighbor.conformity / 250 + 0.15; // Watts-Strogatz dynamic adaptation
                if (Math.random() < adoptionChance) {
                  neighbor.adopted = true;
                  (neighbor.mesh.material as THREE.MeshBasicMaterial).color.set("#ff6b35");
                  nextQueue.push(neighIdx);

                  // Create visually flowing packet traveling along edge
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

      /* ── Animate active packets traveling along edges ─────────── */
      for (let i = activePackets.length - 1; i >= 0; i--) {
        const p = activePackets[i];
        p.progress += p.speed * dt;

        if (p.progress >= 1.0) {
          // Packet finished journey, dispose and clean up
          graph.remove(p.mesh);
          activePackets.splice(i, 1);
        } else {
          // Interpolate linear position between nodes
          p.mesh.position.lerpVectors(p.from, p.to, p.progress);
          // Pulse opacity for dynamic aesthetic
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.sin(p.progress * Math.PI);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Trigger initial cascade
    triggerContagionCascade();

    /* ── Cleanup ────────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      resizeObs.disconnect();
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
                  color: hoveredAgent.adopted ? "var(--orange)" : "var(--muted)",
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

