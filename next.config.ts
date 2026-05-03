import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // .glb/.gltf files in /public are served as static assets — no extra config needed.
  turbopack: {},
};

export default nextConfig;
