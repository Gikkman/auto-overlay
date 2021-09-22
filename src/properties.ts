import props from "properties-reader";
import { getAbsolutePath } from "./paths";

export function readProperties(fileRelativePath: string) {
    return props( getAbsolutePath(fileRelativePath) );
}

export function ensureProperty(property: string, props: props.Reader): string {
    const value = props.get(property);
    if(value === null) {
        throw "Missing properties value " + property
    }
    return value.toString();
}