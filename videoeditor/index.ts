import http from 'http';
import readline from "readline";
import fs from 'fs';
import path from 'path';
import funcs from './scripts/funcs';
import url from 'url';
import {handler} from './scripts/handler';

const server = http.createServer(async (request, response) => {
    try {
        // console.log(request.headers?.range);
        if (request.url) {
            let URL = url.parse(request.url, true);
            if (!URL.pathname || URL.pathname === '/') URL.pathname = 'index.html';
            let filePath = path.join(__dirname, 'public', URL.pathname);
            let contentType = funcs.getContentType(filePath);
            if (await handler.doHandler(request, response, {URL, contentType, filePath})) return;
            if (!contentType) { contentType = 'text/html'; filePath += ".html" };
            
            if (contentType.startsWith('video/')) {
                const range = request.headers.range;
                const videoSize  = fs.statSync(filePath).size;
                const CHUNK_SIZE = 10 ** 6; // 1MB
                const start = Number(range ? range.replace(/\D/g, "") : 0);
                const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
                const contentLength = end - start + 1;
                const headers = {
                    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": contentLength,
                    "Content-Type": "video/mp4",
                };
                response.writeHead(206, headers);
                let stream = fs.createReadStream(filePath, {start, end});
                stream.pipe(response);
                return;
            }
            funcs.debug(URL.query);
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    response.end("<h1>404 not found</h1>");
                    console.error(err);
                    return;
                }
                response.writeHead(200, {'Content-Type': contentType});
                response.end(data);
            });
        }
    } catch (err){
        console.log(err);
    }
});

server.listen(3000, () => {
    handler.init();
    console.log("Server has been started");
    console_command();
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout});

function console_command() {
    rl.question("", (command: string) => {
        while (command.includes('  ')) command = command.replace('  ', ' ');
        let args: any = command.split(" ");
        command = args.shift().toLowerCase();
        switch (command) {
            case '': break;
            case 'stop': {
                console.log('Thank you and goodbye :)');
                process.exit(0);
                break;
            }
            case 'test': {
                console.log('test command');
                break;
            }
            default: {
                console.log(`Unknown command: ${command}`);
                break;
            }
        }
        console_command();
    });
}