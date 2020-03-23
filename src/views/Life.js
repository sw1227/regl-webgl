import React from "react";
import createRegl from "regl";
import { useAsyncEffect, fetchShaderText } from "../common";

const SHADER_PATH = {
  updateFrag: "/life/update.frag",
  quadVert: "/life/quad.vert",
  quadFrag: "/life/quad.frag",
};


const Life = () => {
  const regl = createRegl(); // No arguments: create a full screen canvas

  // ---------- Constants ----------
  const radius = 1024;

  // ---------- States ----------
  const initialState = (Array(radius * radius * 4)).fill(0).map(
    () => Math.random() < 0.1 ? 255 : 0
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
  const updateCommand = (vert, frag) => regl({
    vert: vert,
    frag: frag,
    attributes: {
      position: [-4, -4, 4, -4, 0, 4]
    },
    uniforms: {
      prevState: ({ tick }) => state[tick % 2],
      radius: radius
    },
    depth: { enable: false },
    count: 3
  });

  const quadCommand = (vert, frag) => regl({
    vert: vert,
    frag: frag,
    attributes: {
      position: [-4, -4, 4, -4, 0, 4]
    },
    uniforms: {
      prevState: ({ tick }) => state[tick % 2]
    },
    depth: { enable: false },
    count: 3
  });



  // ---------- Draw ----------
  useAsyncEffect(async () => {
    // Create regl command with fetched GLSL code
    const updateLife = updateCommand(
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
        updateLife();
      });
    });

  }, [], () => { regl.destroy() });

  return <></>;
};


export default Life;
