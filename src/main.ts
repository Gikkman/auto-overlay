import { HELLO } from "./module";
import { readFile, readProperties } from "./read-file";

console.log(HELLO);

console.log( readFile("README.md") );

const props = readProperties("auto-overlay.properties");
console.log( props.getAllProperties() );
