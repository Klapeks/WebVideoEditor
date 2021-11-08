import { IncomingMessage, ServerResponse } from "http";
import url from 'url';
import video from "./handl/video";

interface Parametrs {
    URL: url.UrlWithParsedQuery;
    contentType: string;
    filePath: string;
}
interface Handler {
    path: string;
    accept(request: IncomingMessage, response: ServerResponse, params: Parametrs): boolean | Promise<boolean>;
}

let handlers: any = {};

let handler = {
    addHandler: (handler: Handler) => {
        handlers[handler.path] = handler;
    },
    doHandler: async (request: IncomingMessage, response: ServerResponse, params: Parametrs): Promise<boolean> => {
        try {
            if (!params?.URL?.pathname) return false;
            if (!Object.keys(handlers).includes(params.URL.pathname)) return false;
            let a = handlers[params.URL.pathname].accept(request, response, params);
            if (a?.then) {
                if (await a) return true;
                return false;
            }
            return a;
        } catch (e){
            console.log(e);
            console.log(params.URL.pathname);
            console.log("");
            return false;
        }
    },
    init: () => {
        video.init();
    }
};

export {handler, Parametrs};