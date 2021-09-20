import { HELLO } from "./module";
import { readFile } from "./read-file";

console.log(HELLO);

console.log( readFile("README.md") );
