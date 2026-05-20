// prisma.config.ts ou demo/prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "demo/prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"), // Ou a sua variável correspondente
  },
});
