import fs from 'fs';
import yaml from 'js-yaml';

let lastElement: DB;

class DB {
    public static load(path: string): DB {
        if (lastElement) if (lastElement.path == path) return lastElement;
        return lastElement = new DB(path);
    }
    protected path: string;
    public data: any = {};
    private constructor(path: string) {
        this.path = path;
        try {
            if (!fs.existsSync(path)) {
                if (path.includes('/')) {
                    let folder = DB.parent(path);
                    if (!fs.existsSync(folder)) {
                        fs.mkdirSync(folder);
                    }
                }
                fs.appendFile(this.path, '', 'utf-8', (err)=>{
                    if (err) console.log(err);
                    this._load();
                });
            } else {
                this._load()
            }
        } catch (e){
            console.log(e);
        }
    }
    private _load() {
        var a = fs.readFileSync(this.path, 'utf8');
        if (a) {
            this.data = yaml.load(a);
        }
    }
    public set(key: string, data: any) {
        if (!this.data) this.data = {}; 
        this.data[key] = data;
    }
    public get(key: string, def?: any): any {
        if (!this.data) return def;
        if (def || (typeof def === 'number' && def === 0)) {
            if (!this.data[key]) return def;
        }
        // if (def && !this.data[key]) return def;
        return this.data[key];
    }
    public async save() {
        if (!this.data) return;
        return fs.promises.writeFile(this.path, yaml.dump(this.data), 'utf-8');
    }
    public static parent(path: string): string {
        return path.substr(0, path.length - path.split('/')[path.split('/').length-1].length);
    }
}
export = DB;