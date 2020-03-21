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
