import props from "properties-reader";
import { Logger } from "./logger";
import { getAbsolutePath } from "./paths";

export function readProperties(fileRelativePath: string) {
    return props( getAbsolutePath(fileRelativePath) );
}

export function ensureProperty(property: string, props: props.Reader): string {
    const value = props.get(property);
    if(value === null) {
        throw "Missing properties value " + property
    } 
    const valueString = value.toString();
    Logger.debug(`Property detected. ${property}: ${valueString}`)
    return valueString;
}