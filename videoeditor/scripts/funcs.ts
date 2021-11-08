import path from "path";

let debug = false;

export = {
    isDebug: debug,
    debug: (text: any): void => {
        if (!debug) return;
        if (typeof text === 'string' || typeof text === 'number' || typeof text === 'boolean'){
            console.debug(`\x1b[33m[DEBUG] ${text}`);
        } else {
            console.debug(text);
        }
    },
    getContentType: (filePath: string): string => {
        const ext = path.extname(filePath);
        if (!ext) return '';
        else switch (ext) {
            case '.css': return 'text/css';
            case '.js': return 'text/javascript';
            case '.mp4': return 'video/mp4';
            default: return 'text/html';
        }
    },
    getPath: (url: string | undefined): string => {
        if (!url) url = '/';
        if (url === '/') url = 'index.html';
        return path.join(path.dirname(__dirname), 'public', url);
    }
}