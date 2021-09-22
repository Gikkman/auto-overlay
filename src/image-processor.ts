import fs from 'fs';
import path from 'path';
import sharp, { Metadata, Sharp } from "sharp";
import { FileTree, toFlatArray } from "./filetree-scanner";
import { getAbsolutePath } from "./paths";

let overlay: Sharp;
let overlayMetadata: Metadata;

export async function loadOverlay(imageRelativePath: string) {
    const imageAbsolutePath = getAbsolutePath(imageRelativePath);
    overlay = sharp(imageAbsolutePath, {failOnError: true});
    overlayMetadata = await overlay.metadata();
    console.log(`Overlay metadata. Width: ${overlayMetadata.width}, Height: ${overlayMetadata.height}, Format: ${overlayMetadata.format}`)
}

export async function applyOverlay(folderRelativePath: string, filetree: FileTree, allowOverwrite: boolean) {
    const outputRootAbsolutePath = getAbsolutePath(folderRelativePath);
    const flatArray = toFlatArray(filetree.folder)
        .filter(e => e.type === 'file')
        .map(img => {
            const inputAbsolutePath = path.join(filetree.rootAbsolutePath, img.relativePath);
            const outputAbsolutePath = path.join(outputRootAbsolutePath, img.relativePath);
            return {inputAbsolutePath, outputAbsolutePath, outputRelativePath: img.relativePath};
        })
        .filter( img => {
            if(allowOverwrite) return img;
            else if( fs.existsSync(img.outputAbsolutePath) ) {
                console.log(`An image already exists at ${img.outputRelativePath}. Skipping`);
            }
            else return img;
        });
    for(const img of flatArray) {
        try {
            await applyOverlayToImage(img);
        } catch (e) {
            console.error(`Error processing image ${img.outputRelativePath}`);
            console.error(e);
        }
    }
}

type Img = {inputAbsolutePath: string, outputAbsolutePath: string, outputRelativePath: string};
async function applyOverlayToImage(img: Img) {
    
}


