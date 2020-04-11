import { useEffect } from "react";


export function useAsyncEffect(asyncFunc, deps, cleanup=() => {}) {
  useEffect(() => {
    (async () => {
      asyncFunc();
    })();
    return cleanup;
  }, deps);
}


// Fetch shader code as string
export async function fetchShaderText(path) {
  const response = await fetch(path);
  const text = await response.text();
  return text;
};


// Load image bitmap for texture
export function loadImage(imageSource) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSource;
    image.onload = async () => {
      const bitmap = await createImageBitmap(image);
      resolve(bitmap);
    };
  });
};


// Reduction on the GPU
// https://github.com/regl-project/regl/blob/gh-pages/example/reduction.js
export function gpuReduceCreate(regl, texture, op) {
  // A single reduce pass: reduces "tex" to the half size framebuffer by "op"
  const reducePass = regl({
    frag: `
    precision mediump float;
    uniform sampler2D tex;
    varying vec2 uv;
    uniform float rcpDim;
    float op(float a, float b) {
      return ${op};
    }
    void main () {
      float a = texture2D(tex, uv - vec2(0.0, 0.0) * rcpDim).x;
      float b = texture2D(tex, uv - vec2(1.0, 0.0) * rcpDim).x;
      float c = texture2D(tex, uv - vec2(0.0, 1.0) * rcpDim).x;
      float d = texture2D(tex, uv - vec2(1.0, 1.0) * rcpDim).x;
      float result = op(op(a, b), op(c, d));
      gl_FragColor = vec4(result);
    }`,

    vert: `
    precision mediump float;
    attribute vec2 position;
    varying vec2 uv;
    void main () {
      uv = position;
      gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
    }`,

    attributes: {
      position: [-2, 0, 0, -2, 2, 2] // Large-enough triangle
    },

    uniforms: {
      tex: regl.prop("inTex"),
      rcpDim: regl.prop("rcpDim") // reciprocal texture dimensions.
    },

    framebuffer: regl.prop("outFbo"),

    count: 3
  });

  let dim = texture.width; // == texture.height
  const buffers = [texture];
  while (dim > 1) {
    dim >>= 1;
    buffers.push(regl.framebuffer({
      width: dim,
      height: dim
    }));
  }

  return () => {
    // Render pass: original texture -> half-size fbo -> ... -> 1x1 fbo
    for (let i = 0; i < buffers.length - 1; i++) {
      reducePass({
        inTex: buffers[i],
        outFbo: buffers[i + 1],
        rcpDim: 1.0 / (buffers[i].width)
      });
    }

    // now retrieve the result from the GPU
    let result
    regl({ framebuffer: buffers[buffers.length - 1] })(() => {
      result = regl.read()[0];
    });
    return result;
  };
}
