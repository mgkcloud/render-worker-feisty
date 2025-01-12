import { renderMedia } from '@remotion/renderer';
import { getCompositions } from '@remotion/renderer';
import path from 'path';
import os from 'os';
import fs from 'fs';
export class RemotionLocalRenderer {
    constructor(config) {
        this.serveUrl = config.serveUrl;
        this.outputDir = config.outputDir || path.join(os.tmpdir(), 'remotion-renders');
        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }
    async renderVideo(request) {
        console.log('Starting local video render...');
        const outputFile = path.join(this.outputDir, `${request.compositionId}-${Date.now()}.mp4`);
        try {
            // Get composition details
            const compositions = await getCompositions(this.serveUrl);
            const composition = compositions.find((c) => c.id === request.compositionId);
            if (!composition) {
                throw new Error(`Composition ${request.compositionId} not found`);
            }
            const renderProps = {
                composition,
                serveUrl: this.serveUrl,
                outputLocation: outputFile,
                inputProps: request.inputProps,
                codec: request.codec,
                chromiumOptions: {
                    disableWebSecurity: true,
                },
            };
            const renderData = await renderMedia(renderProps);
            console.log('Render started:', renderData);
            return {
                renderId: outputFile, // Use output file path as render ID for local rendering
                outputFile
            };
        }
        catch (error) {
            console.error('Local render error:', error);
            throw error;
        }
    }
    async checkProgress(renderId) {
        // For local rendering, we just check if the file exists
        try {
            const exists = fs.existsSync(renderId);
            return {
                done: exists,
                overallProgress: exists ? 1 : 0,
                outputFile: exists ? renderId : null,
            };
        }
        catch (error) {
            console.error('Progress check error:', error);
            throw error;
        }
    }
    getVideoPath(renderId) {
        const files = fs.readdirSync(this.outputDir);
        const videoFile = files.find(file => file.includes(renderId));
        return videoFile ? path.join(this.outputDir, videoFile) : null;
    }
}
//# sourceMappingURL=local.js.map