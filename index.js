import * as THREE from "three";
import getLayer from "./getLayer.js";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { LineGeometry } from "jsm/lines/LineGeometry.js";
import { LineMaterial } from "jsm/lines/LineMaterial.js";
import { Line2 } from "jsm/lines/Line2.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const ctrls = new OrbitControls(camera, renderer.domElement);
ctrls.enableDamping = true;

function getLine() {
  /*3X,3Y,3Z*/
  const verts = [0.25, 0, 0, 1.5, 0, 0, 2.5, 0, 0];
  const colors = [];
  for (let i = 0, len = verts.length; i < len; i += 3) {
    const hue = 0.8 + Math.random() * 0.3;
    const lightness = 1.0 - i / (len - 3);
    let col = new THREE.Color().setHSL(hue, 1, lightness);
    let { r, g, b } = col;
    colors.push(r, g, b);
  }
  const lineGeo = new LineGeometry();
  lineGeo.setPositions(verts);
  lineGeo.setColors(colors);
  const lineMat = new LineMaterial({
    dashed: true,
    dashOffset: 0,
    dashSize: 1,
    gapSize: 1,
    linewidth: 4,
    vertexColors: true,
  });
  lineMat.resolution.set(w, h);
  const line = new Line2(lineGeo, lineMat);
  line.computeLineDistances();
  line.rotation.y = Math.random() * Math.PI * 2;
  line.rotation.z = Math.random() * Math.PI * 2;

  const rate = Math.random() * 0.001 + 0.0005;
  function update(t) {
    lineMat.dashSize = Math.sin(t * rate);
    lineMat.gapSize = Math.cos(t * rate);
    //line.material.dashOffset = t * -rate;
  }
  line.userData.update = update;
  return line;
}

function getLinesGroup() {
  const group = new THREE.Group();
  const numlines = 250;
  for (let i = 0; i < numlines; i += 1) {
    const line = getLine();
    group.add(line);
  }
  function update(t) {
    group.rotation.x -= 0.001;
    group.rotation.y -= 0.002;
    group.children.forEach((l) => {
      l.userData.update(t);
    });
  }
  group.userData = { update };
  return group;
}

const lines = getLinesGroup();
scene.add(lines);

function animate(t = 0) {
  requestAnimationFrame(animate);
  lines.userData.update(t);
  renderer.render(scene, camera);
  ctrls.update();
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
