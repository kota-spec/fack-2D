import * as THREE from 'three';

import vertexShader from './gl/vertexShader.vert';
import fragmentShader from './gl/fragmentShader.frag';

class FackImage {
  constructor () {
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
    this.threshold = new THREE.Vector2(35, 15);

    // bind系
    this.onMouse = this.onMouse.bind(this);
    this.onResize = this.onResize.bind(this);
    this.render = this.render.bind(this);
    this.onOrientation = this.onOrientation.bind(this);
  }

  init () {
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

    const image = new Image();
    image.src = './image/lady.jpg';
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

      this.setGl();
    };

    this.onListener();
  }

  onListener () {
    document.addEventListener('mousemove', this.onMouse);
    window.addEventListener('resize', this.onResize);

    if (
      DeviceOrientationEvent &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      document.addEventListener('click', () => this.onOrientationEvent());
    } else {
      window.addEventListener('devicemotion', this.onOrientation);
    }
  }

  onOrientationEvent () {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        console.log(permissionState);
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

  onOrientation (e) {
    const { x, y } = e.accelerationIncludingGravity;
    const maxTilt = 3;

    this.mouse = new THREE.Vector2(
      this.clamp(x, -maxTilt, maxTilt) / maxTilt,
      this.clamp(y, -maxTilt, maxTilt) / maxTilt
    );
  }

  clamp (number, lower, upper) {
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

  onResize () {
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

  setGl () {
    // 画像を読み込む
    const image1 = new THREE.TextureLoader().load('./image/lady.jpg');
    const image2 = new THREE.TextureLoader().load('./image/lady-map.jpg');

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

    const plane = new THREE.Mesh(geometry, this.material);
    this.scene.add(plane);

    this.render();
  }

  render () {
    requestAnimationFrame(this.render);
    this.material.uniforms.uMouse.value = this.mouse;
    this.renderer.render(this.scene, this.camera);
  }

  // マウスのイベント
  onMouse (e) {
    let halfX = this.width / 2;
    let halfY = this.height / 2;

    const mouseTargetX = (halfX - e.clientX) / halfX;
    const mouseTargetY = (halfY - e.clientY) / halfY;

    this.mouse = new THREE.Vector2(mouseTargetX, mouseTargetY);
  }
}

const fackImage = new FackImage();
fackImage.init();
