import fs from "fs";
import path from "path";

export function readFile(file: string) {
    return fs.readFileSync( path.join(process.cwd(), file), 'utf8' );
}