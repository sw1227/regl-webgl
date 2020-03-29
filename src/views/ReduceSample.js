import React, { useState } from "react";
import createRegl from "regl";
import { gpuReduceCreate, useAsyncEffect } from "../common";


const View = () => {
  const [messages, setMessages] = useState(["Profiling. wait seconds..."]);

  // Prepare WebGL environment
  const canvas = document.body.appendChild(document.createElement("canvas"));
  canvas.width = 1;
  canvas.height = 1;
  const regl = createRegl(canvas);

  // Prepare dummy data
  const dim = 1024 * 4; // memo: GPU outperforms CPU around 1024
  const data = [];
  for (let i = 0; i < dim * dim; i++) {
    data.push(Math.floor(Math.random() * 255));
  }
  // Create texture of data
  const textureData = [];
  data.forEach(d => {
    textureData.push(d, d, d, d); // We must use a texture format of type RGBA
  });
  const texture = regl.texture({
    width: dim,
    height: dim,
    data: textureData
  });


  // Start profiling when opened
  useAsyncEffect(async () => {
    // Create GPU / CPU reduce function
    const gpuReduce = gpuReduceCreate(regl, texture, "max(a, b)");
    const cpuReduce = () => {
      const op = (a, b) => Math.max(a, b);
      let result = op(data[0], data[1]);
      for (let i = 2; i < data.length; i++) {
        result = op(result, data[i]);
      }
      return result;
    };

    const n = 200;
    [gpuReduce, cpuReduce].forEach((r, j) => {
      let total = 0;
      for (let i = 0; i < n; i++) {
        const t0 = performance.now();
        const res = r();
        // console.log(res);
        const t1 = performance.now();
        total += (t1 - t0);
      }
      const totalStr = Math.round((total / n) * 100) / 100;
      setMessages(old => [
        ...old,
        `[${j === 0 ? "GPU" : "CPU"}] Finished: Average time=${totalStr} [msec]`
      ]);
    });
  }, []);


  return (
    <div style={{padding: "10px"}}>
      <h3>Reduction algorithm with WebGL</h3>
      <p>
        Based on regl official example <br />
        https://github.com/regl-project/regl/blob/gh-pages/example/reduction.js
      </p>
      {messages.map((m, i) => <p key={i}>{m}</p>)}
    </div>
  );
};


export default View;
