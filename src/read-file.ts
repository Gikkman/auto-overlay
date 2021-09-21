import fs from "fs";
import path from "path";
import props from "properties-reader";

export function readFile(file: string) {
    return fs.readFileSync( path.join(process.cwd(), file), 'utf8' );
}

export function readProperties(file: string) {
    return props( path.join(process.cwd(), file) );
}