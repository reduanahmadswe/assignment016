module.exports = {
  apps: [
    {
      name: "oriyet-backend",
      cwd: "/root/oriyet/backend",
      script: "dist/server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
