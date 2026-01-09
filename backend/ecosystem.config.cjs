module.exports = {
  apps: [
    {
      name: "oriyet-backend",
      script: "dist/server.js",
      cwd: "/root/OriyetWeb/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
