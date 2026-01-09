module.exports = {
  apps: [
    {
      name: "oriyet-frontend",
      cwd: "/root/OriyetWeb/frontend",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
