// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind';

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Export webpack config override function
export const webpackOverride = (currentConfig) => {
  return enableTailwind({
    ...currentConfig,
    entry: './src/remotion-root.ts',
    resolve: {
      ...currentConfig.resolve,
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      modules: ['node_modules'],
    },
    module: {
      ...currentConfig.module,
      rules: [
        ...(currentConfig.module?.rules || []),
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
  });
};

Config.overrideWebpackConfig(webpackOverride);
Config.setEntryPoint('./src/remotion-root.ts');

// Video handling configurations
Config.setChromiumOpenGlRenderer('angle'); // Better video rendering
Config.setMuted(false); // Ensure audio is enabled
Config.setBrowserExecutable(null); // Use default Chrome for better codec support

// Security settings
Config.setChromiumIgnoreCertificateErrors(true); // Handle HTTPS issues with media files

// Performance settings
Config.setDelayRenderTimeoutInMilliseconds(60000); // 60s timeout for loading resources and slower playback

// OffthreadVideo optimization settings
Config.setConcurrency(4); // Optimize frame extraction concurrency
Config.setOffthreadVideoCacheSizeInBytes(1024 * 1024 * 1024); // 1GB cache for frame extraction
