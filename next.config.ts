import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Configure path aliases explicitly if needed
  experimental: {},
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
