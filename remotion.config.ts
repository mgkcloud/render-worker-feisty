// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind';

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);
Config.setEntryPoint('src/remotion-root.ts');

// Video handling configurations
Config.setChromiumOpenGlRenderer('angle'); // Better video rendering
Config.setMuted(false); // Ensure audio is enabled
Config.setBrowserExecutable(null); // Use default Chrome for better codec support

// Security settings
Config.setChromiumIgnoreCertificateErrors(true); // Handle HTTPS issues with media files

// Performance settings
Config.setDelayRenderTimeoutInMilliseconds(30000); // 30s timeout for loading resources
