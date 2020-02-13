import * as THREE from 'three';
import Tweakpane from 'tweakpane';

import vertexShader from './gl/vertexShader.vert';
import fragmentShader from './gl/fragmentShader.frag';

const length = 21;

class FackImage {
  constructor() {
    this.$$canvas = document.getElementById('js-canvas');
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.$$canvas
    });

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.material = null;

    this.light = null;
    this.camera = null;

    this.imageAspect = 0;
    this.uAspect = 0;
    this.ratio = window.devicePixelRatio ? window.devicePixelRatio : 1;
    this.resolution = null;

    this.mouse = new THREE.Vector2(0.0, 0.0);

    this.thresholdX = 35;
    this.thresholdY = 15;

    this.current = 8; // 現在の背景ぼかし
    this.currentCache = 8; // 現在の背景ぼかし

    this.isFirst = true;

    this.threshold = new THREE.Vector2(this.thresholdX, this.thresholdY);

    this.textureName = 'lady';
    this.textureNameCache = '';

    const box = [];

    for (let i = 2; i < length + 1; i++) {
      box.push(i === 20 ? `./image/R&D1-${i}.png` : `./image/R&D1-${i}.jpg`);
    }

    console.log(box);

    this.texture = {
      lady: {
        image1: './image/lady.jpg',
        image2: ['./image/lady-map.jpg']
      },
      ball: {
        image1: './image/ball.jpg',
        image2: ['./image/ball-map.jpg']
      },
      canyon: {
        image1: './image/canyon.jpg',
        image2: ['./image/canyon-map.jpg']
      },
      mount: {
        image1: './image/mount.jpg',
        image2: ['./image/mount-map.jpg']
      },
      tsugumi: {
        image1: './image/R&D1-1.jpg',
        image2: box
      },
      tsugumi2: {
        image1: './image/R&D2-1.png',
        image2: [
          './image/R&D2-4.png',
          './image/R&D2-2.png',
          './image/R&D2-3.png'
        ]
      },
      tsugumi3: {
        image1: './image/R&D3-1.png',
        image2: ['./image/R&D3-1.png']
      }
    };

    // bind系
    this.onMouse = this.onMouse.bind(this);
    this.onResize = this.onResize.bind(this);
    this.render = this.render.bind(this);
    this.onOrientation = this.onOrientation.bind(this);
    this.onOrientationEvent = this.onOrientationEvent.bind(this);
  }

  init() {
    this.renderer.setPixelRatio(this.ratio);
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.ratio);
    this.light = new THREE.AmbientLight(0xffffff);
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.width / this.height,
      1,
      1000
    );
    this.camera.position.set(0, 0, 10);

    this.loadImage();
    this.onListener();
  }

  onListener() {
    document.addEventListener('mousemove', this.onMouse);
    window.addEventListener('resize', this.onResize);

    if (
      DeviceOrientationEvent &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      document.addEventListener('click', this.onOrientationEvent);
    } else {
      window.addEventListener('devicemotion', this.onOrientation);
    }
  }

  onOrientationEvent() {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', this.onOrientation);
        } else {
          alert('モーションの利用を許可してください');
        }
      })
      .catch(() => {
        alert('モーションの利用を許可してください');
      });
  }

  onOrientation(e) {
    const { x, y } = e.accelerationIncludingGravity;
    const maxTilt = 3;

    this.mouse = new THREE.Vector2(
      this.clamp(x, -maxTilt, maxTilt) / maxTilt,
      this.clamp(y, -maxTilt, maxTilt) / maxTilt
    );
  }

  clamp(number, lower, upper) {
    if (number === number) {
      if (upper !== undefined) {
        number = number <= upper ? number : upper;
      }
      if (lower !== undefined) {
        number = number >= lower ? number : lower;
      }
    }
    return number;
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    let a1;
    let a2;

    if (this.height / this.width < this.imageAspect) {
      // 横幅に合わせた比率
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    } else {
      // 縦幅に合わせた比率
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    }

    this.resolution = new THREE.Vector2(a1, a2);
    this.material.uniforms.uResolution.value = this.resolution;

    this.renderer.setSize(this.width, this.height);
  }

  loadImage() {
    const image = new Image();
    image.src = this.texture[this.textureName].image1;
    image.onload = () => {
      this.imageAspect = image.naturalHeight / image.naturalWidth;
      this.uAspect = image.naturalWidth / image.naturalHeight;

      let a1;
      let a2;

      if (this.height / this.width < this.imageAspect) {
        // 横幅に合わせた比率
        a1 = 1;
        a2 = this.height / this.width / this.imageAspect;
      } else {
        // 縦幅に合わせた比率
        a1 = (this.width / this.height) * this.imageAspect;
        a2 = 1;
      }

      this.resolution = new THREE.Vector2(a1, a2);

      if (this.isFirst) {
        this.setGl();
      } else {
        this.updateTexture();
      }
    };
  }

  setGl() {
    // 画像を読み込む
    const image1 = new THREE.TextureLoader().load(
      this.texture[this.textureName].image1
    );
    const image2 = new THREE.TextureLoader().load(
      this.texture[this.textureName].image2[this.current - 1]
        ? this.texture[this.textureName].image2[this.current - 1]
        : this.texture[this.textureName].image2[0]
    );

    image1.minFilter = THREE.LinearFilter;
    image2.minFilter = THREE.LinearFilter;

    const geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        // 実際に描画するテクスチャー
        uTex1: {
          value: image1,
          type: 't'
        },

        // 変形させるテクスチャー
        uTex2: {
          value: image2, // テクスチャ
          type: 't'
        },

        // canvasサイズの比率
        uResolution: {
          value: this.resolution,
          type: 'v2'
        },

        // 変形パラメータ
        uThreshold: {
          value: this.threshold,
          type: 'v2'
        },

        // マウスの座標
        uMouse: {
          value: this.mouse,
          type: 'v2'
        }
      },
      vertexShader,
      fragmentShader
    });

    this.isFirst = false;
    this.textureNameCache = this.textureName;

    const plane = new THREE.Mesh(geometry, this.material);
    this.scene.add(plane);

    this.render();
  }

  updateTexture() {
    // 画像を読み込む
    const image1 = new THREE.TextureLoader().load(
      this.texture[this.textureName].image1
    );
    const image2 = new THREE.TextureLoader().load(
      this.texture[this.textureName].image2[this.current - 1]
        ? this.texture[this.textureName].image2[this.current - 1]
        : this.texture[this.textureName].image2[0]
    );

    image1.minFilter = THREE.LinearFilter;
    image2.minFilter = THREE.LinearFilter;

    this.material.uniforms.uTex1.value = image1;
    this.material.uniforms.uTex2.value = image2;

    this.onResize();
  }

  render() {
    requestAnimationFrame(this.render);
    this.material.uniforms.uMouse.value = this.mouse;
    this.threshold = new THREE.Vector2(this.thresholdX, this.thresholdY);
    this.material.uniforms.uThreshold.value = this.threshold;
    this.renderer.render(this.scene, this.camera);

    console.log(this.current);

    if (
      this.textureName !== this.textureNameCache ||
      this.current !== this.currentCache
    ) {
      this.textureNameCache = this.textureName;
      this.currentCache = this.current;
      this.loadImage();
    }
  }

  // マウスのイベント
  onMouse(e) {
    let halfX = this.width / 2;
    let halfY = this.height / 2;

    const mouseTargetX = (halfX - e.clientX) / halfX;
    const mouseTargetY = (halfY - e.clientY) / halfY;

    this.mouse = new THREE.Vector2(mouseTargetX, mouseTargetY);
  }
}

const fackImage = new FackImage();
fackImage.init();

const pane = new Tweakpane();

const params = pane.addFolder({
  title: 'params'
});

const textures = pane.addFolder({
  title: 'textures'
});

params.addInput(fackImage, 'thresholdX', {
  min: 0,
  max: 100
});

params.addInput(fackImage, 'thresholdY', {
  min: 0,
  max: 100
});

textures.addInput(fackImage, 'textureName', {
  options: {
    ball: 'ball',
    canyon: 'canyon',
    lady: 'lady',
    mount: 'mount',
    tsugumi: 'tsugumi',
    tsugumi2: 'tsugumi2',
    tsugumi3: 'tsugumi3'
  }
});

textures.addInput(fackImage, 'current', {
  step: 1,
  min: 1,
  max: length - 1
});
