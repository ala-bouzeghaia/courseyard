/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

const withTM = require("next-transpile-modules")([
  "@fullcalendar/core",
  "@fullcalendar/react",
  "@fullcalendar/common",
  "@fullcalendar/daygrid",
  "@fullcalendar/timegrid",
  "@fullcalendar/interaction",
]);

module.exports = withTM(nextConfig);
