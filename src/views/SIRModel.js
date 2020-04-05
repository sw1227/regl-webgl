import React from "react";
import createRegl from "regl";
import { useAsyncEffect, fetchShaderText } from "../common";

const SHADER_PATH = {
  quadVert: "/sir/quad.vert",
  quadFrag: "/sir/quad.frag",
  updateFrag: "/sir/update.frag",
};


const SIRModel = () => {
  const regl = createRegl(); // No arguments: create a full screen canvas

  // ---------- Constants ----------
  const radius = 1024;
  const nInfected = 20; // Initial number of "Infected"
  const density = 0.58;
  const beta = 0.3;
  const gamma = 1.0 / 4.0;

  // ---------- States ----------
  // S: [255, 0, 0, 0], I: [0, 255, 0, 0], R: [0, 0, 255, 0], empty: [0, 0, 0, 0]
  const generateInitState = (nInfected, density) => {
    const initialState = (Array(radius * radius * 4)).fill(0);

    const nSusceptible = Math.floor(radius * radius * density - nInfected);
    const shuffled = [...Array(radius * radius).keys()] // Shuffle twice
      .sort(() => 0.5 - Math.random()).sort(() => 0.5 - Math.random());
    const infectedIdx = shuffled.slice(0, nInfected);
    const susceptibleIdx = shuffled.slice(nInfected, nInfected + nSusceptible);

    infectedIdx.forEach(i => {
      initialState[4 * i + 1] = 255;
    });
    susceptibleIdx.forEach(i => {
      initialState[4 * i] = 255;
    });

    return initialState;
  };
  const initialState = generateInitState(nInfected, density);

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
      beta: beta,
      gamma: gamma,
      seed: regl.prop("seed"),
      prevState: ({ tick }) => state[tick % 2]
    },
    count: 6
  });

  // ---------- Draw ----------
  useAsyncEffect(async () => {
    // Create regl command with fetched GLSL code
    const drawQuad = quadCommand(
      await fetchShaderText(SHADER_PATH.quadVert),
      await fetchShaderText(SHADER_PATH.quadFrag),
    );
    const update = updateCommand(
      await fetchShaderText(SHADER_PATH.quadVert),
      await fetchShaderText(SHADER_PATH.updateFrag),
    );

    // Animate
    regl.frame(({ tick }) => {
      drawQuad();
      state[(tick + 1) % 2].use(() => {
        update({seed: Math.random()});
      });
    });

  }, [], () => { regl.destroy() });

  return <></>;
};


export default SIRModel;
