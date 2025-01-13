module.exports = {
  apps: [
    {
      name: 'api-server',
      script: 'src/server.js',
      watch: ['src'],
      ignore_watch: ['rendered-videos', 'node_modules'],
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'remotion-studio',
      script: 'npx remotion studio src/remotion-root.ts',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3003
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003
      }
    },
    {
      name: 'vite-server',
      script: 'npx vite',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
