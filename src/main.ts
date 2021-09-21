import { HELLO } from "./module";
import { readFile, readProperties } from "./read-file";
import { filetreeScanner } from "./filetree-scanner";

console.log(HELLO);

console.log( readFile("README.md") );

const props = readProperties("auto-overlay.properties");
console.log( props.getAllProperties() );

const inputFolder = props.get('input.folder');
if(inputFolder === null) process.exit(1);

const fileTree = filetreeScanner(inputFolder.toString());
console.log(JSON.stringify(fileTree, null, 2));