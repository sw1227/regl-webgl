import React from "react";
import createRegl from "regl";
import { useAsyncEffect, fetchShaderText, loadImage } from "../common";
import starryNight from "../resources/starry_night.jpg";

const SHADER_PATH = {
  quadVert: "/vector_field/quad.vert",
  vectorFrag: "/vector_field/vector.frag",
};


const VectorField = () => {
  const regl = createRegl(); // No arguments: create a full screen canvas

  // ---------- regl commands ----------
  const draw = regl({
    vert: regl.prop("vert"),
    frag: regl.prop("frag"),
    attributes: {
      position: [[0, 0], [1, 0], [0, 1], [0, 1], [1, 0], [1, 1]],
    },
    uniforms: {
      texture: regl.prop("texture"),
      width: regl.prop("width"),
      height: regl.prop("height"),
      time: regl.prop("time"),
    },
    count: 6
  });

  // ---------- Draw ----------
  useAsyncEffect(async () => {
    const vert = await fetchShaderText(SHADER_PATH.quadVert);
    const frag = await fetchShaderText(SHADER_PATH.vectorFrag);
    const bitmap = await loadImage(starryNight);
    const texture = regl.texture(bitmap);

    regl.frame(({ time }) => {
      draw({
        vert: vert,
        frag: frag,
        texture: texture,
        width: bitmap.width,
        height: bitmap.height,
        time: time,
      });
    });
  }, [], () => { regl.destroy() });

  return <></>;
};


export default VectorField;
