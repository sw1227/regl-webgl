import React from "react";
import createRegl from "regl";
import * as d3 from "d3";
import { useAsyncEffect, fetchShaderText, loadImage } from "../common";

const SHADER_PATH = {
  quadVert: "/visibility/quad.vert",
  quadFrag: "/visibility/quad.frag",
};


const Visibility = () => {
  let regl; // Attatch to canvas element when it's created

  // ---------- Constants ----------
  const canvasSize = 512;
  const tile = { z: 13, x: 7262, y: 3232 };
  const demUrl = `https://cyberjapandata.gsi.go.jp/xyz/dem_png/${tile.z}/${tile.x}/${tile.y}.png`;
  const mapUrl = `https://cyberjapandata.gsi.go.jp/xyz/relief/${tile.z}/${tile.x}/${tile.y}.png`;

  // ---------- regl commands ----------
  const quadCommand = (vert, frag, demTexture, mapTexture) => regl({
    vert: vert,
    frag: frag,
    attributes: {
      position: [[0, 0], [1, 0], [0, 1], [0, 1], [1, 0], [1, 1]]
    },
    uniforms: {
      radius: regl.prop("radius"),
      target: regl.prop("target"),
      demTexture: demTexture,
      mapTexture: mapTexture,
    },
    count: 6
  });

  // ---------- Draw ----------
  useAsyncEffect(async () => {
    regl = createRegl("#regl-canvas");

    // Load tile
    const demImage = await loadImage(demUrl);
    const mapImage = await loadImage(mapUrl);

    // Create regl command with fetched GLSL code
    const drawQuad = quadCommand(
      await fetchShaderText(SHADER_PATH.quadVert),
      await fetchShaderText(SHADER_PATH.quadFrag),
      regl.texture(demImage),
      regl.texture(mapImage),
    );

    // Initial draw
    drawQuad({ radius: demImage.width, target: [0.41, 0.54] });

    // Update on mousemove: d3.mouse returns [-1, canvasSize-1]
    const scale = d3.scaleLinear().domain([-1, canvasSize-1]).range([0, 1]);
    const canvasElement = d3.select("#regl-canvas");
    canvasElement.on("mousemove", () => {
      const [mouseX, mouseY] = d3.mouse(canvasElement.node());
      drawQuad({ radius: demImage.width, target: [scale(mouseX), 1 - scale(mouseY)] });
    });

  }, [], () => { regl.destroy() });


  return (
    <div style={{ margin: "20px" }}>
      <canvas id="regl-canvas" width={`${canvasSize}px`} height={`${canvasSize}px`} />
    </div>
  );
};


export default Visibility;
