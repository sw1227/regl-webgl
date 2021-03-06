import React from "react";
import createRegl from "regl";
import { useAsyncEffect, fetchShaderText } from "../common";

const SHADER_PATH = {
  quadVert: "/particle/quad.vert",
  screenFrag: "/particle/screen.frag",
  particleVert: "/particle/particle.vert",
  particleFrag: "/particle/particle.frag",
  updateFrag: "/particle/update.frag",
};


const Particle = () => {
  const regl = createRegl(); // No arguments: create a full screen canvas

  // ---------- Constants ----------
  const fadeOpacity = 0.99; // how fast the particle trails fade on each frame
  const particleRes = 32;
  const numParticles = particleRes * particleRes;
  const a_pos = [[0, 0], [1, 0], [0, 1], [0, 1], [1, 0], [1, 1]];

  // ---------- States ----------
  const screenState = (Array(2)).fill().map(() =>
    regl.framebuffer({
      color: regl.texture({ // resized dynamically in regl.frame
        radius: 1,
        data: [0, 0, 0, 0]
      }),
      depth: false,
      depthStencil: false
    })
  );

  const initialParticleState = Array.from(
    Array(numParticles * 4),
    () => Math.floor(Math.random() * 256)
  );

  const particleState = (Array(2)).fill().map(() =>
    regl.framebuffer({
      color: regl.texture({
        radius: particleRes,
        data: initialParticleState
      }),
      depth: false,
      depthStencil: false
    })
  );

  // ---------- regl commands ----------
  // Draw faded texture
  const fadeCommand = (vert, frag) => regl({
    vert: vert,
    frag: frag,
    attributes: {
      a_pos: a_pos,
    },
    uniforms: {
      u_screen: regl.prop("texture"),
      u_opacity: regl.prop("opacity"),
    },
    count: 6
  });

  // Draw particle dots to the framebuffer screenState[tick%2]
  const particleCommand = (vert, frag) => regl({
    vert: vert,
    frag: frag,
    attributes: {
      a_index: [...Array(numParticles).keys()]
    },
    uniforms: {
      u_particles: regl.prop("particle"),
      u_particles_res: particleRes,
    },
    primitive: "points",
    count: numParticles
  });

  // Update particle state
  const updateCommand = (vert, frag) => regl({
    vert: vert,
    frag: frag,
    attributes: {
      a_pos: a_pos,
    },
    uniforms: {
      u_particles: ({tick}) => particleState[tick % 2]
    },
    framebuffer: ({tick}) => particleState[(tick+1) % 2],
    count: 6
  });

  // ---------- Draw ----------
  useAsyncEffect(async () => {
    // Create regl command with fetched GLSL code
    const drawFadedTexture = fadeCommand(
      await fetchShaderText(SHADER_PATH.quadVert),
      await fetchShaderText(SHADER_PATH.screenFrag),
    );
    const drawParticles = particleCommand(
      await fetchShaderText(SHADER_PATH.particleVert),
      await fetchShaderText(SHADER_PATH.particleFrag),
    );
    const updateParticles = updateCommand(
      await fetchShaderText(SHADER_PATH.quadVert),
      await fetchShaderText(SHADER_PATH.updateFrag)
    );

    regl.frame(({ viewportWidth, viewportHeight, tick }) => {
      // Resize and clear screen
      screenState.forEach(screen => {
        screen.resize(viewportWidth, viewportHeight);
      });

      screenState[tick % 2].use(() => {
        regl.clear({ color: [0, 0, 0, 1] });
        drawFadedTexture({
          opacity: fadeOpacity,
          texture: screenState[(tick + 1) % 2]
        });
        drawParticles({ particle: particleState[tick % 2] });
      });
      // screenState[tick % 2] -> screen
      drawFadedTexture({ opacity: 1, texture: screenState[tick % 2] });

      // Update states
      updateParticles(); // particleState: [tick % 2] -> [(tick+1) % 2]
    });

  }, [], () => { regl.destroy() });

  return <></>;
};


export default Particle;
