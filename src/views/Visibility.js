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
  const url = "https://cyberjapandata.gsi.go.jp/xyz/dem_png/13/7262/3232.png";

  // ---------- regl commands ----------
  const quadCommand = (vert, frag) => regl({
    vert: vert,
    frag: frag,
    attributes: {
      position: [[0, 0], [1, 0], [0, 1], [0, 1], [1, 0], [1, 1]]
    },
    uniforms: {
      radius: regl.prop("radius"),
      texture: regl.prop("texture"),
      target: regl.prop("target"),
    },
    count: 6
  });

  // ---------- Draw ----------
  useAsyncEffect(async () => {
    regl = createRegl("#regl-canvas");

    // Create regl command with fetched GLSL code
    const drawQuad = quadCommand(
      await fetchShaderText(SHADER_PATH.quadVert),
      await fetchShaderText(SHADER_PATH.quadFrag),
    );

    // Load tile and initial draw
    const image = await loadImage(url);
    const texture = regl.texture(image);
    drawQuad({ texture: texture, radius: image.width, target: [0.41, 0.54] });

    // Update on mousemove: d3.mouse returns [-1, canvasSize-1]
    const scale = d3.scaleLinear().domain([-1, canvasSize-1]).range([0, 1]);
    const canvasElement = d3.select("#regl-canvas");
    canvasElement.on("mousemove", () => {
      const [mouseX, mouseY] = d3.mouse(canvasElement.node());
      drawQuad({ texture: texture, radius: image.width, target: [scale(mouseX), 1 - scale(mouseY)] });
    });

  }, [], () => { regl.destroy() });


  return (
    <div style={{ margin: "20px" }}>
      <canvas id="regl-canvas" width={`${canvasSize}px`} height={`${canvasSize}px`} />
    </div>
  );
};


export default Visibility;
