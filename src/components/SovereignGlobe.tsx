import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

interface GeoNode {
  id: string;
  name: string;
  role: string;
  region: string;
  lat: number;
  lon: number;
  status: 'ONLINE' | 'WARNING' | 'DEGRADED';
  latency: number;
  cpu: number;
  ram: number;
  disk: number;
  workers: number;
  txnsProcessed: number;
  settlementValue: string;
  lastSeal: string;
  lastConsensus: string;
  softwareVersion: string;
  trustScore: string;
}

interface Route {
  id: string;
  fromId: string;
  toId: string;
  avgTps: number;
  volume: string;
  latency: number;
  successRate: number;
  drift: number;
  loss: number;
  consensus: string;
}

interface SOVRGlobeProps {
  geoNodes: GeoNode[];
  routes: Route[];
  selectedNodeId: string | null;
  selectedRouteId: string | null;
  onSelectNode: (id: string | null) => void;
  onSelectRoute: (id: string | null) => void;
  heatmapOn: boolean;
  activeMode?: string;
}

// Highly precise continental projection coordinates for high-trust offline outlines
const CONTINENTS = [
  // North America
  [
    { lat: 70, lon: -168 }, { lat: 72, lon: -140 }, { lat: 83, lon: -80 }, 
    { lat: 81, lon: -60 }, { lat: 61, lon: -64 }, { lat: 47, lon: -52 }, 
    { lat: 44, lon: -68 }, { lat: 25, lon: -80 }, { lat: 18, lon: -96 }, 
    { lat: 7, lon: -78 }, { lat: 10, lon: -84 }, { lat: 15, lon: -92 }, 
    { lat: 25, lon: -108 }, { lat: 33, lon: -118 }, { lat: 48, lon: -125 }, 
    { lat: 59, lon: -140 }, { lat: 60, lon: -146 }, { lat: 65, lon: -168 }, 
    { lat: 70, lon: -168 }
  ],
  // Greenland
  [
    { lat: 83, lon: -30 }, { lat: 70, lon: -20 }, { lat: 60, lon: -43 }, 
    { lat: 70, lon: -56 }, { lat: 80, lon: -65 }, { lat: 83, lon: -30 }
  ],
  // South America
  [
    { lat: 12, lon: -72 }, { lat: 8, lon: -55 }, { lat: -5, lon: -35 }, 
    { lat: -23, lon: -43 }, { lat: -34, lon: -53 }, { lat: -54, lon: -67 }, 
    { lat: -54, lon: -71 }, { lat: -40, lon: -73 }, { lat: -18, lon: -70 }, 
    { lat: -5, lon: -81 }, { lat: 8, lon: -77 }, { lat: 12, lon: -72 }
  ],
  // Africa
  [
    { lat: 37, lon: 10 }, { lat: 36, lon: 15 }, { lat: 32, lon: 32 }, 
    { lat: 30, lon: 32 }, { lat: 23, lon: 37 }, { lat: 12, lon: 43 }, 
    { lat: 11, lon: 51 }, { lat: 4, lon: 39 }, { lat: -15, lon: 40 }, 
    { lat: -34, lon: 20 }, { lat: -30, lon: 15 }, { lat: -6, lon: 12 }, 
    { lat: 4, lon: 9 }, { lat: 5, lon: 0 }, { lat: 5, lon: -8 }, 
    { lat: 14, lon: -17 }, { lat: 21, lon: -17 }, { lat: 33, lon: -7 }, 
    { lat: 35, lon: -2 }, { lat: 37, lon: 10 }
  ],
  // Eurasia (Europe + Asia combined)
  [
    { lat: 36, lon: -6 }, { lat: 43, lon: -9 }, { lat: 50, lon: -1 }, 
    { lat: 60, lon: 5 }, { lat: 71, lon: 25 }, { lat: 68, lon: 40 }, 
    { lat: 73, lon: 80 }, { lat: 76, lon: 104 }, { lat: 72, lon: 130 }, 
    { lat: 77, lon: 143 }, { lat: 66, lon: 170 }, { lat: 60, lon: 160 }, 
    { lat: 52, lon: 156 }, { lat: 43, lon: 132 }, { lat: 35, lon: 120 }, 
    { lat: 22, lon: 114 }, { lat: 10, lon: 108 }, { lat: 1, lon: 103 }, 
    { lat: 12, lon: 98 }, { lat: 15, lon: 96 }, { lat: 8, lon: 78 }, 
    { lat: 25, lon: 68 }, { lat: 25, lon: 58 }, { lat: 13, lon: 48 }, 
    { lat: 31, lon: 34 }, { lat: 35, lon: 43 }, { lat: 41, lon: 28 }, 
    { lat: 38, lon: 22 }, { lat: 40, lon: 14 }, { lat: 43, lon: 10 }, 
    { lat: 43, lon: 3 }, { lat: 36, lon: -6 }
  ],
  // Australia
  [
    { lat: -22, lon: 113 }, { lat: -14, lon: 126 }, { lat: -11, lon: 136 }, 
    { lat: -11, lon: 142 }, { lat: -25, lon: 153 }, { lat: -38, lon: 148 }, 
    { lat: -35, lon: 138 }, { lat: -35, lon: 115 }, { lat: -22, lon: 113 }
  ],
  // Antarctica
  [
    { lat: -70, lon: -180 }, { lat: -70, lon: -120 }, { lat: -72, lon: -60 }, 
    { lat: -75, lon: 0 }, { lat: -71, lon: 60 }, { lat: -69, lon: 120 }, 
    { lat: -70, lon: 180 }, { lat: -85, lon: 180 }, { lat: -85, lon: -180 }, 
    { lat: -70, lon: -180 }
  ],
  // United Kingdom / Ireland
  [
    { lat: 59, lon: -6 }, { lat: 55, lon: -2 }, { lat: 51, lon: 1 }, 
    { lat: 50, lon: -5 }, { lat: 52, lon: -10 }, { lat: 56, lon: -7 }, 
    { lat: 59, lon: -6 }
  ],
  // Japan
  [
    { lat: 45, lon: 142 }, { lat: 40, lon: 140 }, { lat: 35, lon: 140 }, 
    { lat: 31, lon: 130 }, { lat: 33, lon: 132 }, { lat: 36, lon: 136 }, 
    { lat: 43, lon: 144 }, { lat: 45, lon: 142 }
  ],
  // Madagascar
  [
    { lat: -12, lon: 49 }, { lat: -16, lon: 50 }, { lat: -25, lon: 47 }, 
    { lat: -25, lon: 44 }, { lat: -17, lon: 44 }, { lat: -12, lon: 49 }
  ]
];

// Earth parameter constants (matches high-trust Three.js visualization)
const GLOBE_RADIUS = 1.5;

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function SovereignGlobe({
  geoNodes,
  routes,
  selectedNodeId,
  selectedRouteId,
  onSelectNode,
  onSelectRoute,
  heatmapOn,
  activeMode = 'network'
}: SOVRGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsContainerRef = useRef<HTMLDivElement>(null);

  const lastSelectedNodeIdRef = useRef<string | null>(null);
  const triggerShockwaveRef = useRef<((nodeId: string) => void) | null>(null);

  // High-performance state-sync refs to escape ThreeJS stale closures 
  const selectedNodeIdRef = useRef<string | null>(selectedNodeId);
  const selectedRouteIdRef = useRef<string | null>(selectedRouteId);
  const routeLinesMapRef = useRef<{ [routeId: string]: THREE.Line }>({});
  const geoNodesRef = useRef(geoNodes);

  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
  }, [selectedNodeId]);

  useEffect(() => {
    selectedRouteIdRef.current = selectedRouteId;
  }, [selectedRouteId]);

  useEffect(() => {
    geoNodesRef.current = geoNodes;
  }, [geoNodes]);

  useEffect(() => {
    if (selectedNodeId && selectedNodeId !== lastSelectedNodeIdRef.current) {
      if (triggerShockwaveRef.current) {
        triggerShockwaveRef.current(selectedNodeId);
      }
    }
    lastSelectedNodeIdRef.current = selectedNodeId;
  }, [selectedNodeId]);

  // Store coordinates projection data for 2D Labels in rendering loop
  const nodeScreenPositions = useMemo(() => {
    return geoNodes.map(node => ({
      id: node.id,
      name: node.name,
      status: node.status,
      pos: latLngToVector3(node.lat, node.lon, GLOBE_RADIUS)
    }));
  }, [geoNodes]);

  const nodeScreenPositionsRef = useRef(nodeScreenPositions);
  useEffect(() => {
    nodeScreenPositionsRef.current = nodeScreenPositions;
  }, [nodeScreenPositions]);

  // Actionable secondary effect to instantly update line materials when selection shifts
  useEffect(() => {
    Object.keys(routeLinesMapRef.current).forEach((routeId) => {
      const line = routeLinesMapRef.current[routeId];
      if (line) {
        const isRouteSelected = selectedRouteId === routeId;
        const mat = line.material as THREE.LineBasicMaterial;
        if (mat) {
          mat.opacity = isRouteSelected ? 0.95 : 0.40;
          mat.linewidth = isRouteSelected ? 2.5 : 0.85;
          mat.needsUpdate = true;
        }
      }
    });
  }, [selectedRouteId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Get exact container dimensions
    let width = container.clientWidth || 400;
    let height = container.clientHeight || 400;

    // ----------------------------------------------------
    // THREE.JS SETUP
    // ----------------------------------------------------
    const scene = new THREE.Scene();
    
    // Very elegant low FOV (45 degrees) camera mapping
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create main rotating globe group
    const globeGroup = new THREE.Group();
    // Default starting orientation to highlight North Atlantic (US + Europe) with 23.5° tilt
    globeGroup.rotation.x = 23.5 * Math.PI / 180;
    globeGroup.rotation.y = -0.55; 
    scene.add(globeGroup);

    // ----------------------------------------------------
    // GLOBE LAYERS
    // ----------------------------------------------------
    let surfaceColor = 0x070c14;
    let outlineColor = 0xa855f7;
    let secondaryOutlineColor = 0xec4899;
    let innerColor = 0x140424;

    if (activeMode === 'treasury') {
      surfaceColor = 0x150f02;             // Dark amber ocean
      outlineColor = 0xf59e0b;             // Amber continent outline
      secondaryOutlineColor = 0xd97706;    // Gold outer glow
      innerColor = 0x241504;               // Deep golden-brown depth
    } else if (activeMode === 'consensus') {
      surfaceColor = 0x0d0716;             // Dark purple ocean
      outlineColor = 0x8b5cf6;             // Violet continent outline
      secondaryOutlineColor = 0xc084fc;    // Light violet glow
      innerColor = 0x1c0c30;               // Deep violet core
    } else if (activeMode === 'forensics') {
      surfaceColor = 0x180509;             // Dark crimson ocean
      outlineColor = 0xf43f5e;             // Alert rose outline
      secondaryOutlineColor = 0xbe123c;    // Pulsating deep red glow
      innerColor = 0x2e050c;               // Crimson threat core
    } else if (activeMode === 'ingestion') {
      surfaceColor = 0x021015;             // Deep cyan ocean
      outlineColor = 0x06b6d4;             // Cyan continent outline
      secondaryOutlineColor = 0x0891b2;    // Ocean cyan glow
      innerColor = 0x022026;               // Cyber core cyan depth
    }

    const colors = {
      surface: surfaceColor,
      outline: outlineColor,
      secondaryOutline: secondaryOutlineColor,
      glow: 0x00f2ff,
      inner: innerColor
    };

    // Layer 1: Globe Base Sphere
    const sphereGeom = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: colors.surface,
      transparent: true,
      opacity: 0.94,
      shininess: 18,
      specular: 0x22d3ee
    });
    const baseSphere = new THREE.Mesh(sphereGeom, sphereMat);
    globeGroup.add(baseSphere);

    // Layer 2: Texture Map Overlay (Alpha world topology map)
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-topology.png',
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        
        const mapMat = new THREE.MeshBasicMaterial({
          color: 0x12c2e9,
          alphaMap: texture,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide
        });
        const mapMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS + 0.003, 64, 64), mapMat);
        globeGroup.add(mapMesh);
      }
    );

    // Layer 3: Faint Lat/Lon Grid lines (Subtle tactical outline)
    const gridColor = new THREE.Color(0x00f2ff);
    const gridGroup = new THREE.Group();
    
    // Equator & Latitudes
    const latitudes = [-50, -25, 0, 25, 50];
    latitudes.forEach(lat => {
      const points: THREE.Vector3[] = [];
      const rad = (lat * Math.PI) / 180;
      const r = GLOBE_RADIUS * Math.cos(rad);
      const y = GLOBE_RADIUS * Math.sin(rad);
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * 2 * Math.PI;
        points.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: gridColor, transparent: true, opacity: 0.07 });
      const line = new THREE.Line(geom, mat);
      gridGroup.add(line);
    });
    
    // Longitudes
    for (let l = 0; l < 8; l++) {
      const points: THREE.Vector3[] = [];
      const lonRad = (l / 8) * Math.PI * 2;
      for (let i = 0; i <= 64; i++) {
        const latRad = (i / 64) * Math.PI * 2;
        const x = GLOBE_RADIUS * Math.cos(latRad) * Math.cos(lonRad);
        const y = GLOBE_RADIUS * Math.sin(latRad);
        const z = GLOBE_RADIUS * Math.cos(latRad) * Math.sin(lonRad);
        points.push(new THREE.Vector3(x, y, z));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: gridColor, transparent: true, opacity: 0.07 });
      const line = new THREE.Line(geom, mat);
      gridGroup.add(line);
    }
    globeGroup.add(gridGroup);

    // Layer 4: Offline Vector Continent Coordinates Outlines (Double-layered safety)
    CONTINENTS.forEach(poly => {
      // Magenta coastline base trace
      const points: THREE.Vector3[] = [];
      poly.forEach(pt => {
        points.push(latLngToVector3(pt.lat, pt.lon, GLOBE_RADIUS + 0.005));
      });
      if (points.length > 0) {
        points.push(points[0].clone()); // Close loop
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      
      const lineMat = new THREE.LineBasicMaterial({
        color: colors.outline,
        transparent: true,
        opacity: 0.65,
        linewidth: 1.5
      });
      const traceLoop = new THREE.Line(geom, lineMat);
      globeGroup.add(traceLoop);

      // Thicker soft glow layer
      const outerGlowMat = new THREE.LineBasicMaterial({
        color: colors.secondaryOutline,
        transparent: true,
        opacity: 0.22,
        linewidth: 3.0
      });
      const glowLoop = new THREE.Line(geom, outerGlowMat);
      globeGroup.add(glowLoop);
    });

    // Layer 5: Atmosphere shader glow (Outer Corona)
    const atmosphereGeom = new THREE.SphereGeometry(GLOBE_RADIUS * 1.14, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          // Stronger falloff for a pristine neon operational glow
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.3);
          gl_FragColor = vec4(0.0, 0.76, 1.0, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    const atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMat);
    scene.add(atmosphere);

    // Layer 6: Inner Core depth glow
    const coreGeom = new THREE.SphereGeometry(GLOBE_RADIUS * 0.97, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: colors.inner,
      transparent: true,
      opacity: 0.4
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    globeGroup.add(core);

    // ----------------------------------------------------
    // GEOLOCATED SITES & NETWORK LINKS
    // ----------------------------------------------------
    const nodeMeshes: THREE.Group[] = [];

    // Add Physical Anchor Dots to 3D Globe
    geoNodes.forEach(node => {
      const pos = latLngToVector3(node.lat, node.lon, GLOBE_RADIUS);
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(pos);
      
      // Orient away from center of sphere (outward normal vector)
      const outwardTarget = pos.clone().multiplyScalar(2);
      nodeGroup.lookAt(outwardTarget);

      const isWarningNode = node.status === 'WARNING';
      const isDegradedNode = node.status === 'DEGRADED';
      const nodeColorHex = isWarningNode ? 0xeab308 : isDegradedNode ? 0xf43f5e : 0x02c39a;

      // Inner Anchor Dot
      const dotGeom = new THREE.CircleGeometry(0.016, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: nodeColorHex,
        side: THREE.DoubleSide
      });
      const dotMesh = new THREE.Mesh(dotGeom, dotMat);
      // Offset slightly to keep it floating above the land mesh
      dotMesh.position.z = 0.012;
      nodeGroup.add(dotMesh);

      // Outer Ring
      const ringGeom = new THREE.RingGeometry(0.024, 0.03, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: nodeColorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.z = 0.012;
      nodeGroup.add(ringMesh);

      globeGroup.add(nodeGroup);
      nodeMeshes.push(nodeGroup);
    });

    // --- QUANTUM ENTANGLEMENT SYNC ENGINE: SATELLITES & SHOCKWAVES ---
    const activeShockwaves: { mesh: THREE.Mesh; progress: number; origin: THREE.Vector3; triggeredNodes: Set<string> }[] = [];
    const activeLasers: { line: THREE.Line; maxAge: number; age: number }[] = [];
    interface Satellite {
      group: THREE.Group;
      mesh: THREE.Mesh;
      orbitRadiusX: number;
      orbitRadiusY: number;
      speed: number;
      angle: number;
      inclinationX: number;
      inclinationZ: number;
      color: number;
    }
    const satellites: Satellite[] = [];

    // Initialize 3 satellites in elliptical orbits
    const numSatellites = 3;
    const satColors = [0x00f2ff, 0xf59e0b, 0x10b981]; // Cyan, Amber, Emerald
    for (let sSec = 0; sSec < numSatellites; sSec++) {
      const rx = GLOBE_RADIUS + 0.32 + sSec * 0.12;
      const ry = GLOBE_RADIUS + 0.28 + sSec * 0.12;
      const incX = (0.2 + sSec * 0.3) * Math.PI;
      const incZ = (0.15 + sSec * 0.25) * Math.PI;

      // Draw orbit path line
      const orbitPoints: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * 2 * Math.PI;
        const pt = new THREE.Vector3(rx * Math.cos(theta), 0, ry * Math.sin(theta));
        pt.applyAxisAngle(new THREE.Vector3(1, 0, 0), incX);
        pt.applyAxisAngle(new THREE.Vector3(0, 0, 1), incZ);
        orbitPoints.push(pt);
      }
      const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMat = new THREE.LineBasicMaterial({
        color: satColors[sSec],
        transparent: true,
        opacity: 0.12
      });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);
      globeGroup.add(orbitLine);

      // Satellite Group
      const satGroup = new THREE.Group();
      
      const satGeom = new THREE.OctahedronGeometry(0.024, 0);
      const satMat = new THREE.MeshBasicMaterial({
        color: satColors[sSec],
        wireframe: false
      });
      const satMesh = new THREE.Mesh(satGeom, satMat);
      satGroup.add(satMesh);

      // Ring overlay
      const auraGeom = new THREE.RingGeometry(0.035, 0.04, 16);
      const auraMat = new THREE.MeshBasicMaterial({
        color: satColors[sSec],
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide
      });
      const auraMesh = new THREE.Mesh(auraGeom, auraMat);
      satGroup.add(auraMesh);

      globeGroup.add(satGroup);
      satellites.push({
        group: satGroup,
        mesh: satMesh,
        orbitRadiusX: rx,
        orbitRadiusY: ry,
        speed: 0.12 + sSec * 0.04,
        angle: Math.random() * Math.PI * 2,
        inclinationX: incX,
        inclinationZ: incZ,
        color: satColors[sSec]
      });
    }

    // React shockwave trigger handler subscription
    triggerShockwaveRef.current = (nodeId: string) => {
      const node = geoNodes.find(n => n.id === nodeId);
      if (!node) return;
      const originVec = latLngToVector3(node.lat, node.lon, GLOBE_RADIUS);

      const ringRadius = 0.01;
      const shockwaveGeom = new THREE.RingGeometry(ringRadius * 0.85, ringRadius * 1.15, 32);
      const shockwaveMat = new THREE.MeshBasicMaterial({
        color: 0xf97316, // Beautiful warm orange/neon color
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const shockwaveMesh = new THREE.Mesh(shockwaveGeom, shockwaveMat);
      shockwaveMesh.position.copy(originVec).multiplyScalar(1.006);
      shockwaveMesh.lookAt(new THREE.Vector3(0, 0, 0));

      globeGroup.add(shockwaveMesh);

      activeShockwaves.push({
        mesh: shockwaveMesh,
        progress: 0,
        origin: originVec,
        triggeredNodes: new Set<string>()
      });
    };

    // Create 3D GREAT-CIRCLE Spline Routes & Packet Animation systems
    const curves: THREE.QuadraticBezierCurve3[] = [];
    const packetMeshes: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; color: string; speed: number; offset: number }[] = [];

    routes.forEach((r, idx) => {
      const fromNode = geoNodes.find(n => n.id === r.fromId);
      const toNode = geoNodes.find(n => n.id === r.toId);
      if (!fromNode || !toNode) return;

      const fromVec = latLngToVector3(fromNode.lat, fromNode.lon, GLOBE_RADIUS);
      const toVec = latLngToVector3(toNode.lat, toNode.lon, GLOBE_RADIUS);

      // Slerp Midpoint & Elevation peak proportional to arc distance (great-circle geometry)
      const midVec = new THREE.Vector3().addVectors(fromVec, toVec).multiplyScalar(0.5);
      const dist = fromVec.distanceTo(toVec);
      const elevation = GLOBE_RADIUS + dist * 0.16; // Curves naturally 16% height
      midVec.setLength(elevation);

      const quadraticCurve = new THREE.QuadraticBezierCurve3(fromVec, midVec, toVec);
      curves.push(quadraticCurve);

      // Draw the static bezier spline
      const pointsCount = 40;
      const points = quadraticCurve.getPoints(pointsCount);
      const splineGeom = new THREE.BufferGeometry().setFromPoints(points);

      let routeColor = '#02c39a'; 
      if (r.id === 'R3' || r.id === 'R8') routeColor = '#eab308'; // Treasury flow
      if (r.id === 'R4' || r.id === 'R7') routeColor = '#a855f7'; // Consensus Sync
      if (r.id === 'R6') routeColor = '#f43f5e'; // Flagged anomaly link

      const isRouteSelected = selectedRouteIdRef.current === r.id;

      const splineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(routeColor),
        transparent: true,
        opacity: isRouteSelected ? 0.95 : 0.40,
        linewidth: isRouteSelected ? 2.5 : 0.85
      });

      const routeLine = new THREE.Line(splineGeom, splineMat);
      globeGroup.add(routeLine);
      routeLinesMapRef.current[r.id] = routeLine;

      // Mesh Packet for animated flow (Glowing particle)
      const packetGeom = new THREE.SphereGeometry(0.015, 8, 8);
      const packetMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(routeColor),
        transparent: true,
        opacity: 0.9
      });
      const packetMesh = new THREE.Mesh(packetGeom, packetMat);
      
      globeGroup.add(packetMesh);
      packetMeshes.push({
        mesh: packetMesh,
        curve: quadraticCurve,
        color: routeColor,
        speed: 0.35 + Math.random() * 0.15, // Smooth custom progress speeds
        offset: idx * 0.18 % 1.0
      });
    });

    // ----------------------------------------------------
    // LIGHTS
    // ----------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f2ff, 1.25, 20);
    pointLight.position.set(4, 3, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xec4899, 0.7, 20);
    pointLight2.position.set(-4, -2, -5);
    scene.add(pointLight2);

    // ----------------------------------------------------
    // ROTATION & DRAG physics inertia handlers
    // ----------------------------------------------------
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let velocityY = 0;
    let velocityX = 0;
    let lastActiveTime = Date.now();

    const handleMouseDown = (e: MouseEvent) => {
      // Ignore click if clicking directly on interactive labels overlay
      if ((e.target as HTMLElement).closest('.globe-label-overlay')) {
        return;
      }
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      lastActiveTime = Date.now();
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      velocityY = deltaX * 0.0055;
      velocityX = deltaY * 0.0055;

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      lastActiveTime = Date.now();
    };

    const handleMouseUpOrLeave = () => {
      isDragging = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      if ((e.touches[0].target as HTMLElement).closest('.globe-label-overlay')) {
        return;
      }
      isDragging = true;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
      lastActiveTime = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;

      velocityY = deltaX * 0.0055;
      velocityX = deltaY * 0.0055;

      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
      lastActiveTime = Date.now();
    };

    // Attach dragging hooks directly to WebGL canvas
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUpOrLeave);
    canvas.addEventListener('mouseleave', handleMouseUpOrLeave);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleMouseUpOrLeave);

    // ----------------------------------------------------
    // 60FPS RENDERING ANIMATION LOOP
    // ----------------------------------------------------
    let animFrame: number;
    const projectVector = new THREE.Vector3();

    const tick = () => {
      const now = Date.now();
      const timeInSec = now * 0.001;

      // Handle custom rotation, steady idle rotation & inertia momentum easing
      if (isDragging) {
        globeGroup.rotation.y += velocityY;
        globeGroup.rotation.x += velocityX;

        // Prevent pole flipping
        const maxPitch = Math.PI / 2.2;
        if (globeGroup.rotation.x > maxPitch) globeGroup.rotation.x = maxPitch;
        if (globeGroup.rotation.x < -maxPitch) globeGroup.rotation.x = -maxPitch;
      } else {
        const timeSinceActive = now - lastActiveTime;
        if (timeSinceActive > 2600) {
          // Slow constant rotation
          globeGroup.rotation.y += 0.0012;
          
          // Gently drift back towards standard nominal pitch
          const idealTilt = 23.5 * Math.PI / 180;
          globeGroup.rotation.x += (idealTilt - globeGroup.rotation.x) * 0.02;
        } else {
          // Easing momentum friction deceleration
          globeGroup.rotation.y += velocityY;
          globeGroup.rotation.x += velocityX;

          const maxPitch = Math.PI / 2.2;
          if (globeGroup.rotation.x > maxPitch) globeGroup.rotation.x = maxPitch;
          if (globeGroup.rotation.x < -maxPitch) globeGroup.rotation.x = -maxPitch;

          velocityY *= 0.95;
          velocityX *= 0.95;
        }
      }

      // Animate flowing communication packets along great-circle pathways
      packetMeshes.forEach(p => {
        let currentSpeed = p.speed;
        if (activeMode === 'ingestion') {
          currentSpeed *= 2.2; // Double packet velocity for deep ingestion throughput
        } else if (activeMode === 'forensics') {
          currentSpeed *= 0.55; // Slow down for forensic stream tracing
        }
        const progress = (timeInSec * currentSpeed + p.offset) % 1.0;
        const pt = p.curve.getPointAt(progress);
        p.mesh.position.copy(pt);

        // Hide packets wrapping behind standard camera horizon
        const worldPos = pt.clone().applyMatrix4(globeGroup.matrixWorld);
        const distToCam = worldPos.distanceTo(camera.position);
        const centerToCam = camera.position.length();

        p.mesh.visible = distToCam < centerToCam - 0.1;
      });

      // 1. Update Satellites Positions & Random Vector Signing Laser emissions
      satellites.forEach(sat => {
        sat.angle += (sat.speed * 0.012);
        const pt = new THREE.Vector3(
          sat.orbitRadiusX * Math.cos(sat.angle),
          0,
          sat.orbitRadiusY * Math.sin(sat.angle)
        );
        pt.applyAxisAngle(new THREE.Vector3(1, 0, 0), sat.inclinationX);
        pt.applyAxisAngle(new THREE.Vector3(0, 0, 1), sat.inclinationZ);
        sat.group.position.copy(pt);

        sat.mesh.rotation.x += 0.02;
        sat.mesh.rotation.y += 0.03;

        // Dispatch laser validation witness vectors to geosites occasionally (Satellite Witness signing)
        if (Math.random() < 0.005) {
          const targetNode = geoNodesRef.current[Math.floor(Math.random() * geoNodesRef.current.length)];
          if (targetNode) {
            const nodeVec = latLngToVector3(targetNode.lat, targetNode.lon, GLOBE_RADIUS);
            
            const laserPoints = [sat.group.position.clone(), nodeVec];
            const laserGeom = new THREE.BufferGeometry().setFromPoints(laserPoints);
            const laserMat = new THREE.LineBasicMaterial({
              color: sat.color,
              transparent: true,
              opacity: 1.0,
              linewidth: 1.5
            });
            const laserLine = new THREE.Line(laserGeom, laserMat);
            globeGroup.add(laserLine);

            const matchedIndex = geoNodesRef.current.findIndex(n => n.id === targetNode.id);
            if (matchedIndex !== -1 && nodeMeshes[matchedIndex]) {
              nodeMeshes[matchedIndex].scale.set(2.2, 2.2, 2.2);
            }

            activeLasers.push({
              line: laserLine,
              maxAge: 20,
              age: 0
            });
          }
        }
      });

      // 2. Maintain & Fade Laser validation sign vectors
      for (let i = activeLasers.length - 1; i >= 0; i--) {
        const l = activeLasers[i];
        l.age += 1;
        if (l.age >= l.maxAge) {
          globeGroup.remove(l.line);
          l.line.geometry.dispose();
          (l.line.material as THREE.Material).dispose();
          activeLasers.splice(i, 1);
        } else {
          (l.line.material as THREE.LineBasicMaterial).opacity = 1.0 - (l.age / l.maxAge);
        }
      }

      // 3. Update & Expand Quantum Surface Shockwaves
      for (let i = activeShockwaves.length - 1; i >= 0; i--) {
        const sw = activeShockwaves[i];
        sw.progress += 0.015;
        if (sw.progress > 1.0) {
          globeGroup.remove(sw.mesh);
          sw.mesh.geometry.dispose();
          (sw.mesh.material as THREE.Material).dispose();
          activeShockwaves.splice(i, 1);
        } else {
          const scl = 1 + sw.progress * 45;
          sw.mesh.scale.set(scl, scl, 1);
          (sw.mesh.material as THREE.Material).opacity = 1.0 - sw.progress;

          // Check inter-node intersection triggers
          const ringRad = 0.01;
          const currentRadius = scl * ringRad;

          geoNodesRef.current.forEach((node, nodeIdx) => {
            if (node.id === selectedNodeIdRef.current) return; // ignore origin
            if (sw.triggeredNodes.has(node.id)) return;

            const otherVec = latLngToVector3(node.lat, node.lon, GLOBE_RADIUS);
            const dist = sw.origin.distanceTo(otherVec);

            if (currentRadius >= dist) {
              sw.triggeredNodes.add(node.id);
              const nodeMesh = nodeMeshes[nodeIdx];
              if (nodeMesh) {
                nodeMesh.scale.set(3.0, 3.0, 3.0);
                
                // Add a visual flash class temporarily to node label
                const flashDiv = document.getElementById(`globe-label-${node.id}`);
                if (flashDiv) {
                  flashDiv.classList.add('node-quantum-flash');
                  setTimeout(() => {
                    flashDiv.classList.remove('node-quantum-flash');
                  }, 650);
                }
              }
            }
          });
        }
      }

      // 4. Decay scaled-up geonode meshes smoothly
      nodeMeshes.forEach(mesh => {
        if (mesh.scale.x > 1.0) {
          mesh.scale.x -= 0.08;
          mesh.scale.y -= 0.08;
          mesh.scale.z -= 0.08;
          if (mesh.scale.x < 1.0) {
            mesh.scale.set(1, 1, 1);
          }
        }
      });

      // Position DOM Label overlays dynamically matching projected 3D nodes
      nodeScreenPositionsRef.current.forEach(node => {
        const el = document.getElementById(`globe-label-${node.id}`);
        if (el) {
          projectVector.copy(node.pos);
          projectVector.applyMatrix4(globeGroup.matrixWorld);

          const distanceCamToNode = projectVector.distanceTo(camera.position);
          const cameraToCenter = camera.position.length();
          const isBehind = distanceCamToNode > cameraToCenter - 0.1;

          if (isBehind) {
            el.style.display = 'none';
          } else {
            projectVector.project(camera);
            const x = (projectVector.x * 0.5 + 0.5) * width;
            const y = (-(projectVector.y * 0.5) + 0.5) * height;
            
            el.style.display = 'flex';
            el.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
          }
        }
      });

      renderer.render(scene, camera);
      animFrame = requestAnimationFrame(tick);
    };

    tick();

    // ----------------------------------------------------
    // RESIZE & CLEANUP BINDINGS
    // ----------------------------------------------------
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          width = w;
          height = h;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animFrame);
      resizeObserver.disconnect();

      // Remove drag listeners safely
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUpOrLeave);
      canvas.removeEventListener('mouseleave', handleMouseUpOrLeave);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleMouseUpOrLeave);

      // Safely dispose active shockwaves, lasers and satellites
      activeShockwaves.forEach(sw => {
        globeGroup.remove(sw.mesh);
        sw.mesh.geometry.dispose();
        (sw.mesh.material as THREE.Material).dispose();
      });
      activeLasers.forEach(laser => {
        globeGroup.remove(laser.line);
        laser.line.geometry.dispose();
        (laser.line.material as THREE.Material).dispose();
      });
      satellites.forEach(sat => {
        globeGroup.remove(sat.group);
        sat.mesh.geometry.dispose();
        (sat.mesh.material as THREE.Material).dispose();
      });

      // Safely dispose ThreeJS memory geometries and textures
      sphereGeom.dispose();
      sphereMat.dispose();
      atmosphereGeom.dispose();
      atmosphereMat.dispose();
      coreGeom.dispose();
      coreMat.dispose();
      renderer.dispose();
    };
  }, [geoNodes.length, routes.length, activeMode]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
      id="SOVRGlobe_ThreeJS_Container"
    >
      {/* 3D WebGL Canvas Layer */}
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-auto" />

      {/* Layer 7: Interactive 2D Tailwind-styled DOM Overlay Labels */}
      <div 
        ref={labelsContainerRef} 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        id="SOVRGlobe_Labels_Container"
      >
        {nodeScreenPositions.map(node => {
          const isSelected = selectedNodeId === node.id;
          let nodeColorClass = 'text-[#02c39a]';
          let borderStyleClass = 'border-[#02c39a]/30';
          let ringPulseClass = 'bg-[#02c39a]';

          if (node.status === 'WARNING') {
            nodeColorClass = 'text-yellow-400';
            borderStyleClass = 'border-yellow-500/40';
            ringPulseClass = 'bg-yellow-500';
          } else if (node.status === 'DEGRADED') {
            nodeColorClass = 'text-rose-500';
            borderStyleClass = 'border-rose-500/40';
            ringPulseClass = 'bg-rose-500';
          }

          return (
            <div
              key={node.id}
              id={`globe-label-${node.id}`}
              className="absolute left-0 top-0 pointer-events-auto flex flex-col items-center select-none cursor-pointer group globe-label-overlay translate-x-[-50%] translate-y-[-100%]"
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node.id === selectedNodeId ? null : node.id);
              }}
            >
              {/* Floating micro card */}
              <div 
                className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono transition-all duration-300 flex items-center gap-1.5 backdrop-blur-[3px] border ${
                  isSelected 
                    ? 'bg-zinc-900/90 text-white border-white/50 shadow-[0_0_8px_rgba(255,255,255,0.15)] ring-1 ring-white/20' 
                    : 'bg-black/75 text-zinc-400 border-zinc-800/40 group-hover:bg-zinc-950/80 group-hover:text-white group-hover:border-zinc-700/60'
                }`}
              >
                {/* Real-time status pulse indicators inside labels */}
                {node.status === 'WARNING' && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
                  </span>
                )}
                {node.status === 'DEGRADED' && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                  </span>
                )}
                {node.status === 'ONLINE' && (
                  <span className={`inline-block w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-400'}`} />
                )}

                {node.name}
              </div>

              {/* Laser Connector Line */}
              <div className={`w-[1px] h-3 ${isSelected ? 'bg-white/40' : 'bg-zinc-700/30 group-hover:bg-zinc-500/40'} transition-colors`} />

              {/* Glowing anchor point overlay */}
              <div className="relative w-1.5 h-1.5 rounded-full flex items-center justify-center">
                <div className={`absolute w-full h-full rounded-full opacity-60 ${ringPulseClass} ${isSelected || node.status === 'WARNING' ? 'animate-ping' : ''}`} />
                <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : ringPulseClass}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
