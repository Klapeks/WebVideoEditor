import { handler, Parametrs } from "../handler";
import { IncomingMessage, ServerResponse } from "http";
import url from 'url';
import funcs from "../funcs";
import fs from 'fs';
import path from 'path';
import DB from "../localdb";

const folders: any = ['D:/obka/', 'V:/ShadowPlayerVideo/'];

export = {
    init: () => {
        let toNum = (str: string): string => {
            str = str.replace('.mp4', '');
            let t = "";
            let numbers = '0123456789';
            for (let s of str) {
                if (numbers.includes(s)) t += s;
            }
            return `n${t}`;
        };
        let toInt = (str: any): number => {
            return typeof str === 'number' ? str : parseInt(`${str}`);
        };
        let toFloat = (str: any): number => {
            return typeof str === 'number' ? str : parseFloat(`${str}`);
        };
        handler.addHandler({
            path: "/%",
            accept: async (request: IncomingMessage, response: ServerResponse, params: Parametrs) => {
                response.writeHead(200, {'Content-Type': "text/html"});
                response.end("")
                return true;
            }
        });
        handler.addHandler({
            path: "/api/savevideo",
            accept: async (request: IncomingMessage, response: ServerResponse, params: Parametrs) => {
                let {URL, contentType, filePath} = params;
                let from: number = toFloat(URL.query.sm);
                if (from == 0) {
                    response.end("notok");
                    return true;
                }
                let to: number = toFloat(URL.query.em);
                filePath = Buffer.from(`${URL.query.p}`, 'base64').toString('ascii');
                let filename = filePath.split('/')[filePath.split('/').length-1];
                let db: DB = DB.load(DB.parent(filePath)+"_ve.yml");
                db.set(toNum(filename), { filename, from, to });
                await db.save();
                // console.log(filePath);
                response.end("ok");
                return true;
            }
        });
        handler.addHandler({
            path: "/api/getvideoid",
            accept: async (request: IncomingMessage, response: ServerResponse, params: Parametrs) => {
                let {URL, contentType, filePath} = params;
                const folderId: number = typeof URL.query.f === 'number' ? URL.query.f : parseInt(`${URL.query.f}`);
                const subfolderId: number = typeof URL.query.sf === 'number' ? URL.query.sf : parseInt(`${URL.query.sf}`);
                const videoId: number = typeof URL.query.id === 'number' ? URL.query.id : parseInt(`${URL.query.id}`);

                let folder = folders[folderId-1];
                let a = fs.readdirSync(folder);
                a = a.filter(name => !name.includes('.'));
                // a = a.filter(name => name.endsWith('.mp4'));
                let b = fs.readdirSync(folder+a[subfolderId-1]);
                b = b.filter(name => name.endsWith('.mp4'));
                if (b.length < videoId) {
                    response.end(`doreset§§§§${folderId}§§§§${subfolderId}`);
                    return true;
                }

                let marker_from = -1;
                let marker_to = -1;
                let db: DB = DB.load(folder + a[subfolderId-1]+"/_ve.yml");
                let dat = db.get(toNum(b[videoId-1]));
                if (dat?.from) marker_from = dat.from;
                if (dat?.to) marker_to = dat.to;

                response.end(Buffer.from(folder + a[subfolderId-1] + "/" + b[videoId-1]).toString('base64') 
                        + "§§§§" + folderId + "§§§§" + subfolderId + "§§§§" + videoId + "§§§§" + b.length
                        + "§§§§" + marker_from + "§§§§" + marker_to);
                return true;
            }
        });
        handler.addHandler({
            path: "/api/video",
            accept: async (request: IncomingMessage, response: ServerResponse, params: Parametrs) => {
                let {URL, contentType, filePath} = params;
                filePath = Buffer.from(`${URL.query.videopath}`, 'base64').toString('ascii');
                
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

                return true;
            }
        });
    }
}