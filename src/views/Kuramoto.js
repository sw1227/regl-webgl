import React from "react";
import createRegl from "regl";
import { useAsyncEffect, fetchShaderText } from "../common";

const SHADER_PATH = {
  quadVert: "/kuramoto/quad.vert",
  quadFrag: "/kuramoto/quad.frag",
  updateFrag: "/kuramoto/update.frag",
};


const Kuramoto = () => {
  const regl = createRegl(); // No arguments: create a full screen canvas

  // ---------- Constants ----------
  const radius = 1024;

  // ---------- States ----------
  // Only using 8-bits of red
  const initialState = (Array(radius * radius * 4)).fill(0).map(
    () => 255 * Math.random()
  );
  const state = (Array(2)).fill().map(() =>
    regl.framebuffer({
      color: regl.texture({
        radius: radius,
        data: initialState
      }),
      depth: false,
      depthStencil: false
    })
  );

  // ---------- regl commands ----------
  const quadCommand = (vert, frag) => regl({
    vert: vert,
    frag: frag,
    attributes: {
      position: [[0, 0], [1, 0], [0, 1], [0, 1], [1, 0], [1, 1]]
    },
    uniforms: {
      prevState: ({ tick }) => state[tick % 2]
    },
    count: 6
  });

  const updateCommand = (vert, frag) => regl({
    vert: vert,
    frag: frag,
    attributes: {
      position: [[0, 0], [1, 0], [0, 1], [0, 1], [1, 0], [1, 1]]
    },
    uniforms: {
      radius: radius,
      prevState: ({ tick }) => state[tick % 2],
      k: 10, // coupling
      omega: 10, // Natural frequency. TODO: random
    },
    count: 6
  });


  // ---------- Draw ----------
  useAsyncEffect(async () => {
    // Create regl command with fetched GLSL code
    const update = updateCommand(
      await fetchShaderText(SHADER_PATH.quadVert),
      await fetchShaderText(SHADER_PATH.updateFrag),
    );
    const drawQuad = quadCommand(
      await fetchShaderText(SHADER_PATH.quadVert),
      await fetchShaderText(SHADER_PATH.quadFrag),
    );

    // Animate
    regl.frame(({ tick }) => {
      drawQuad();
      state[(tick + 1) % 2].use(() => {
        update();
      });
    });

  }, [], () => { regl.destroy() });

  return <></>;
};


export default Kuramoto;
