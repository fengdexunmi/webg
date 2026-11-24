// Three.js Orthographic 3D Character Engine for Lin Xiaoxia's Digital Life
// Loads Hugging Face open-source 77-bone realistic Asian campus girl `assets/alexis.glb`
// Drives real 3D walking cycle between buildings + study/read/shoot/wave/idle poses!

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const PFX = '^(?:[a-z0-9_]+:)?(?:mixamorig[:_]?)?';
const BONE_PATTERNS = {
  hips: new RegExp(PFX + '(hips|pelvis)$', 'i'),
  spine: new RegExp(PFX + '(spine|spine_01)$', 'i'),
  spine1: new RegExp(PFX + '(spine1|spine_02)$', 'i'),
  chest: new RegExp(PFX + '(spine2|spine3|chest)$', 'i'),
  neck: new RegExp(PFX + '(neck|neck_01)$', 'i'),
  head: new RegExp(PFX + '(head)$', 'i'),
  leftUpperArm: new RegExp(PFX + '(leftarm|left_shoulder|left_?upper_?arm)$', 'i'),
  leftForeArm: new RegExp(PFX + '(leftforearm|left_elbow|left_?lower_?arm)$', 'i'),
  leftHand: new RegExp(PFX + '(lefthand|left_wrist|left_?hand)$', 'i'),
  rightUpperArm: new RegExp(PFX + '(rightarm|right_shoulder|right_?upper_?arm)$', 'i'),
  rightForeArm: new RegExp(PFX + '(rightforearm|right_elbow|right_?lower_?arm)$', 'i'),
  rightHand: new RegExp(PFX + '(righthand|right_wrist|right_?hand)$', 'i'),
  leftUpLeg: new RegExp(PFX + '(leftupleg|left_hip|left_?thigh)$', 'i'),
  leftLeg: new RegExp(PFX + '(leftleg|left_knee|left_?calf|left_?shin)$', 'i'),
  leftFoot: new RegExp(PFX + '(leftfoot|left_ankle|left_?foot)$', 'i'),
  rightUpLeg: new RegExp(PFX + '(rightupleg|right_hip|right_?thigh)$', 'i'),
  rightLeg: new RegExp(PFX + '(rightleg|right_knee|right_?calf|right_?shin)$', 'i'),
  rightFoot: new RegExp(PFX + '(rightfoot|right_ankle|right_?foot)$', 'i'),
};

function solveIK3D(root, target, l1, l2, poleTarget) {
  const diff = new THREE.Vector3().subVectors(target, root);
  let d = diff.length();
  const maxL = (l1 + l2) * 0.992;
  const minL = Math.abs(l1 - l2) + 0.2;
  d = Math.max(minL, Math.min(maxL, d));
  const dir = diff.lengthSq() > 1e-6 ? diff.normalize() : new THREE.Vector3(0, -1, 0);
  const bend = new THREE.Vector3().subVectors(poleTarget, root);
  bend.addScaledVector(dir, -bend.dot(dir));
  if (bend.lengthSq() < 1e-5) bend.set(0, 0, 1);
  bend.normalize();
  const cosA = Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  return root.clone().addScaledVector(dir, l1 * cosA).addScaledVector(bend, l1 * sinA);
}

export class Avatar3DWalker {
  constructor(canvas) {
    this.canvas = canvas;
    this.ready = false;
    this.glbState = null;
    this.yawSmooth = 0.28; // slightly angled 3/4 facing camera at start

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.52;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } catch {
      return;
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-400, 400, 300, -300, 1, 1600);
    this.camera.position.set(0, 0, 520);
    this.camera.lookAt(0, 0, 0);

    // Bright studio lighting + movable shadow light that follows Xiaoxia along the campus street
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xe0f2fe, 2.05));

    this.keyLight = new THREE.DirectionalLight(0xfffaf2, 2.1);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    this.keyLight.shadow.camera.near = 60;
    this.keyLight.shadow.camera.far = 650;
    this.keyLight.shadow.camera.left = -120;
    this.keyLight.shadow.camera.right = 120;
    this.keyLight.shadow.camera.top = 150;
    this.keyLight.shadow.camera.bottom = -40;
    this.keyLight.shadow.radius = 3.5;
    this.scene.add(this.keyLight);
    this.scene.add(this.keyLight.target);

    const fill = new THREE.DirectionalLight(0xfffbeb, 1.55);
    fill.position.set(0, 140, 420);
    this.scene.add(fill);

    // Shadow catcher ground plane following Xiaoxia at Y = 0
    this.shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(360, 200),
      new THREE.ShadowMaterial({ opacity: 0.22 }),
    );
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.set(240, 0.2, 0);
    this.shadowPlane.receiveShadow = true;
    this.scene.add(this.shadowPlane);

    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.loader = new GLTFLoader();
    this.ready = true;
  }

  async loadModel(url = 'assets/xiaoxia.glb') {
    if (!this.ready) return false;
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          this._mountModel(gltf);
          resolve(true);
        },
        undefined,
        reject,
      );
    });
  }

  _mountModel(gltf) {
    while (this.root.children.length) this.root.remove(this.root.children[0]);
    const model = gltf.scene;
    const allBones = [];

    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.frustumCulled = false;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          if (!m) continue;
          if (m.emissive && !m.emissiveMap && m.emissive.r > 0.15) {
            m.emissive.setRGB(0, 0, 0);
          }
          if (m.roughness !== undefined && m.roughness < 0.35 && !m.metalnessMap) {
            m.roughness = 0.65;
          }
          m.needsUpdate = true;
        }
      }
      if (obj.isBone) allBones.push(obj);
    });

    // Auto-strip character prefix (e.g. "AlexisHips" -> "Hips")
    let bonePrefix = '';
    for (const b of allBones) {
      const m = b.name.match(/^(.+?)(hips|pelvis)$/i);
      if (m && m[1]) {
        bonePrefix = m[1];
        break;
      }
    }
    const strip = (n) => (bonePrefix && n.startsWith(bonePrefix) ? n.slice(bonePrefix.length) : n);

    const bones = {};
    for (const obj of allBones) {
      const clean = strip(obj.name);
      for (const [k, re] of Object.entries(BONE_PATTERNS)) {
        if (!bones[k] && (re.test(clean) || re.test(obj.name))) bones[k] = obj;
      }
    }

    // Normalize height to 116 campus units & plant sneakers flush at Y = 0
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const scale = 116 / Math.max(0.01, box.getSize(new THREE.Vector3()).y);
    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);
    const box2 = new THREE.Box3().setFromObject(model);
    const center = box2.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -box2.min.y, -center.z);

    const holder = new THREE.Group();
    holder.add(model);
    this.root.add(holder);
    holder.updateMatrixWorld(true);

    const restMeta = {};
    const pairs = [
      ['leftUpperArm', 'leftForeArm'],
      ['leftForeArm', 'leftHand'],
      ['rightUpperArm', 'rightForeArm'],
      ['rightForeArm', 'rightHand'],
      ['leftUpLeg', 'leftLeg'],
      ['leftLeg', 'leftFoot'],
      ['rightUpLeg', 'rightLeg'],
      ['rightLeg', 'rightFoot'],
    ];
    for (const [pKey, cKey] of pairs) {
      const pb = bones[pKey];
      const cb = bones[cKey];
      if (!pb || !cb) continue;
      const wp = pb.getWorldPosition(new THREE.Vector3());
      const wc = cb.getWorldPosition(new THREE.Vector3());
      restMeta[pKey] = {
        length: Math.max(1, wp.distanceTo(wc)),
        restDirHolder: wc.clone().sub(wp).normalize(),
        restQuatHolder: pb.getWorldQuaternion(new THREE.Quaternion()),
        restLocalQuat: pb.quaternion.clone(),
      };
    }

    const baseRestQuats = {};
    for (const k of ['hips', 'spine', 'spine1', 'chest', 'neck', 'head']) {
      if (bones[k]) baseRestQuats[k] = bones[k].quaternion.clone();
    }

    const footRestY = Math.min(
      bones.leftFoot ? bones.leftFoot.getWorldPosition(new THREE.Vector3()).y : 5.5,
      bones.rightFoot ? bones.rightFoot.getWorldPosition(new THREE.Vector3()).y : 5.5,
    );

    this.glbState = {
      holder,
      bones,
      restMeta,
      baseRestQuats,
      footRestY,
      hasRig: Boolean(bones.leftUpperArm && bones.rightUpperArm && bones.leftUpLeg && bones.rightUpLeg),
    };
  }

  resize(cw, ch, dpr) {
    if (!this.ready) return;
    this.renderer.setPixelRatio(Math.min(dpr, 2));
    this.renderer.setSize(cw, ch, false);
  }

  syncCamera(cam, cw, ch) {
    if (!this.ready || !cam || !cam.s) return;
    this.camera.left = (0 - cam.x) / cam.s;
    this.camera.right = (cw - cam.x) / cam.s;
    this.camera.top = -((0 - cam.y) / cam.s);
    this.camera.bottom = -((ch - cam.y) / cam.s);
    this.camera.updateProjectionMatrix();
  }

  updateAndRender(state, cam, cw, ch, dt) {
    if (!this.ready) return;
    this.syncCamera(cam, cw, ch);

    const x = state.sceneMode === 'indoor' ? 0 : state.avatarX;
    this.shadowPlane.position.set(x, 0.2, 0);
    this.keyLight.position.set(x - 90, 290, 240);
    this.keyLight.target.position.set(x, 58, 0);
    this.keyLight.target.updateMatrixWorld();

    if (this.glbState && this.glbState.hasRig) {
      this._poseAvatar(state, dt, x);
    }

    this.renderer.render(this.scene, this.camera);
  }

  _poseAvatar(state, dt, renderX) {
    const st = this.glbState;
    const { holder, bones, restMeta, baseRestQuats } = st;
    const t = state.clock;
    const walking = state.isWalking && state.sceneMode !== 'indoor';

    // Reset bones to rest pose
    for (const [k, q] of Object.entries(baseRestQuats)) bones[k].quaternion.copy(q);
    for (const [k, m] of Object.entries(restMeta)) if (bones[k]) bones[k].quaternion.copy(m.restLocalQuat);

    // Smooth yaw orientation: walk right (+79 deg), walk left (-79 deg), stadium shoot (+72 deg), else friendly 3/4 (+20 deg)
    let targetYaw = state.sceneMode === 'indoor' ? 0.22 : 0.28;
    if (walking) {
      targetYaw = state.walkDir >= 0 ? Math.PI * 0.44 : -Math.PI * 0.44;
    } else if (state.pose === 'shoot') {
      targetYaw = Math.PI * 0.42;
    }
    this.yawSmooth += (targetYaw - this.yawSmooth) * Math.min(1, dt * 11);
    const yaw = this.yawSmooth;
    const fwdX = Math.sin(yaw);
    const fwdZ = Math.cos(yaw);
    const rightX = -Math.cos(yaw);
    const rightZ = Math.sin(yaw);

    // Pelvis bounce during walk or gentle breathing during idle/study
    const wp = state.walkPhase;
    const walkBob = walking ? Math.abs(Math.sin(wp)) * 3.0 : Math.sin(t * 2.1) * 0.65;
    holder.position.set(renderX, walkBob, 0);
    holder.rotation.set(0, yaw, 0);

    // Spine lean & natural torso counter-twist while walking
    const pitchQ = (rad) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), rad);
    const twistQ = (rad) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rad);
    const lean = walking ? 0.08 : (state.pose === 'study' || state.pose === 'read' ? 0.12 : 0.02);
    const twist = walking ? -Math.cos(wp) * 0.1 : 0;

    if (bones.spine) bones.spine.quaternion.copy(baseRestQuats.spine).multiply(pitchQ(lean * 0.5)).multiply(twistQ(twist));
    if (bones.spine1) bones.spine1.quaternion.copy(baseRestQuats.spine1).multiply(pitchQ(lean * 0.3));
    if (bones.chest) bones.chest.quaternion.copy(baseRestQuats.chest).multiply(pitchQ(lean * 0.2));
    if (bones.head) {
      const headPitch = state.pose === 'read' || state.pose === 'study' ? 0.22 : (state.pose === 'shoot' ? -0.18 : 0.02);
      bones.head.quaternion.copy(baseRestQuats.head).multiply(pitchQ(headPitch));
    }

    holder.updateMatrixWorld(true);
    const holderQuat = holder.quaternion.clone();

    const aimBone = (boneKey, fromPt, toPt) => {
      const bone = bones[boneKey];
      const meta = restMeta[boneKey];
      if (!bone || !meta || !bone.parent) return;
      const targetDir = new THREE.Vector3().subVectors(toPt, fromPt);
      if (targetDir.lengthSq() < 1e-6) return;
      targetDir.normalize();
      const restDirWorld = meta.restDirHolder.clone().applyQuaternion(holderQuat);
      const restQuatWorld = holderQuat.clone().multiply(meta.restQuatHolder);
      const deltaWorld = new THREE.Quaternion().setFromUnitVectors(restDirWorld, targetDir);
      const desiredWorldQ = deltaWorld.multiply(restQuatWorld);
      const parentWorldQ = bone.parent.getWorldQuaternion(new THREE.Quaternion());
      bone.quaternion.copy(parentWorldQ.invert().multiply(desiredWorldQ));
      bone.updateMatrixWorld(true);
    };

    // ==================== Legs: TRUE Forward 3D Walk Cycle (swing forward in air, push back on ground!) ====================
    const hipR = bones.rightUpLeg.getWorldPosition(new THREE.Vector3());
    const hipL = bones.leftUpLeg.getWorldPosition(new THREE.Vector3());

    let footR;
    let footL;
    if (walking) {
      const stride = 20;
      // When sin(wp) > 0 (foot lifted in air), -cos(wp) advances from -1 -> +1 (swings FORWARD!)
      // When sin(wp) <= 0 (foot planted on ground), -cos(wp) moves +1 -> -1 (pushes BACKWARD!)
      const liftR = Math.max(0, Math.sin(wp)) * 11;
      const liftL = Math.max(0, Math.sin(wp + Math.PI)) * 11;
      const stepR = -Math.cos(wp) * stride;
      const stepL = -Math.cos(wp + Math.PI) * stride;
      footR = new THREE.Vector3(
        renderX + rightX * 5.0 + fwdX * stepR,
        st.footRestY + liftR,
        rightZ * 5.0 + fwdZ * stepR,
      );
      footL = new THREE.Vector3(
        renderX - rightX * 5.0 + fwdX * stepL,
        st.footRestY + liftL,
        -rightZ * 5.0 + fwdZ * stepL,
      );
    } else {
      const stanceSpread = state.pose === 'shoot' ? 8 : 5.0;
      footR = new THREE.Vector3(renderX + rightX * stanceSpread + fwdX * 2.5, st.footRestY, rightZ * stanceSpread + fwdZ * 2.5);
      footL = new THREE.Vector3(renderX - rightX * stanceSpread - fwdX * 2.5, st.footRestY, -rightZ * stanceSpread - fwdZ * 2.5);
    }

    const kHintR = hipR.clone().add(new THREE.Vector3(fwdX * 28, -24, fwdZ * 28));
    const kHintL = hipL.clone().add(new THREE.Vector3(fwdX * 28, -24, fwdZ * 28));
    const kneeR = solveIK3D(hipR, footR, restMeta.rightUpLeg.length, restMeta.rightLeg.length, kHintR);
    const kneeL = solveIK3D(hipL, footL, restMeta.leftUpLeg.length, restMeta.leftLeg.length, kHintL);

    aimBone('rightUpLeg', hipR, kneeR);
    aimBone('rightLeg', kneeR, footR);
    aimBone('leftUpLeg', hipL, kneeL);
    aimBone('leftLeg', kneeL, footL);

    // Ground lock lowest sneaker flush onto Y = 0 floor/sidewalk!
    if (bones.rightFoot && bones.leftFoot) {
      holder.updateMatrixWorld(true);
      const minY = Math.min(
        bones.rightFoot.getWorldPosition(new THREE.Vector3()).y,
        bones.leftFoot.getWorldPosition(new THREE.Vector3()).y,
      );
      holder.position.y += st.footRestY - minY;
      holder.updateMatrixWorld(true);
    }

    // ==================== Arms: Natural Opposite-Phase Walk Swing / Study / Read / Shoot / Wave ====================
    const shR = bones.rightUpperArm.getWorldPosition(new THREE.Vector3());
    const shL = bones.leftUpperArm.getWorldPosition(new THREE.Vector3());
    let handR;
    let handL;

    if (walking) {
      // Opposite-phase arm swing: right arm swings forward when left leg swings forward
      const swingR = Math.cos(wp) * 15;
      const swingL = -Math.cos(wp) * 15;
      handR = shR.clone().add(new THREE.Vector3(fwdX * (3 + swingR) + rightX * 3.5, -31 + Math.abs(swingR) * 0.22, fwdZ * (3 + swingR) + rightZ * 3.5));
      handL = shL.clone().add(new THREE.Vector3(fwdX * (3 + swingL) - rightX * 3.5, -31 + Math.abs(swingL) * 0.22, fwdZ * (3 + swingL) - rightZ * 3.5));
    } else if (state.pose === 'shoot') {
      const lift = Math.max(0, Math.sin(t * 2.6));
      handR = shR.clone().add(new THREE.Vector3(fwdX * 19, -4 + lift * 28, fwdZ * 19));
      handL = shL.clone().add(new THREE.Vector3(fwdX * 16, -6 + lift * 24, fwdZ * 16));
    } else if (state.pose === 'study' || state.pose === 'read') {
      const micro = Math.sin(t * 4.2) * 2.2;
      handR = shR.clone().add(new THREE.Vector3(fwdX * 18 + micro, -17, fwdZ * 18));
      handL = shL.clone().add(new THREE.Vector3(fwdX * 16, -16, fwdZ * 16));
    } else if (state.pose === 'wave') {
      handR = shR.clone().add(new THREE.Vector3(fwdX * 12 + Math.sin(t * 6) * 5, 16, fwdZ * 14));
      handL = shL.clone().add(new THREE.Vector3(fwdX * 4 - rightX * 4, -30, fwdZ * 4 - rightZ * 4));
    } else {
      handR = shR.clone().add(new THREE.Vector3(fwdX * 5 + rightX * 4, -31, fwdZ * 5 + rightZ * 4));
      handL = shL.clone().add(new THREE.Vector3(fwdX * 5 - rightX * 4, -31, fwdZ * 5 - rightZ * 4));
    }

    const eHintR = shR.clone().add(new THREE.Vector3(-fwdX * 14 + rightX * 10, -16, -fwdZ * 14 + rightZ * 10));
    const eHintL = shL.clone().add(new THREE.Vector3(-fwdX * 14 - rightX * 10, -16, -fwdZ * 14 - rightZ * 10));
    const elbowR = solveIK3D(shR, handR, restMeta.rightUpperArm.length, restMeta.rightForeArm.length, eHintR);
    const elbowL = solveIK3D(shL, handL, restMeta.leftUpperArm.length, restMeta.leftForeArm.length, eHintL);

    aimBone('rightUpperArm', shR, elbowR);
    aimBone('rightForeArm', elbowR, handR);
    aimBone('leftUpperArm', shL, elbowL);
    aimBone('leftForeArm', elbowL, handL);
  }
}
