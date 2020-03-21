import React, { useEffect } from "react";
import createRegl from "regl";


const Sample = () => {
  const regl = createRegl(); // No arguments: create a full screen canvas

  const drawTriangle = regl({
    frag: `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

    vert: `
    precision mediump float;
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0, 1);
    }`,

    attributes: {
      position: [[0, -1], [-1, 0.5], [1, 1]] // No need to flatten
    },

    uniforms: {
      color: regl.prop("color")
    },
    // Number of vertices to draw in this command
    count: 3
  });

  useEffect(() => {
    regl.frame(({ time }) => {
      regl.clear({
        color: [0, 0, 0, 0],
        depth: 1
      });
      drawTriangle({
        color: [
          Math.cos(time * 1.0),
          Math.sin(time * 0.8),
          Math.cos(time * 3.0),
          1
        ]
      });
    });

    return () => { regl.destroy() }; // Clean up when unmounted
  }, []);

  return <></>;
};


export default Sample;
