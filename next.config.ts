import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" — раскомментируй если нужен Docker-деплой
  // Для Vercel это поле не нужно

  serverActions: {
    bodySizeLimit: "5mb", // лимит для загрузки аватарок
  },
};

export default nextConfig;
