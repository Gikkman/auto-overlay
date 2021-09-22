import fs from 'fs';
import Jimp from 'jimp';
import path from 'path';
import { FileTree, toFlatArray } from "./filetree-scanner";
import { Logger } from './logger';
import { getAbsolutePath } from "./paths";

type Unpromisify<T> = T extends Promise<infer U> ? U : T;
type JimpPromise = ReturnType<typeof Jimp.read>;
type Image = Unpromisify<JimpPromise>;

let overlay: Image;
const overlayCache: Map<string, Image> = new Map();

function computeCacheKey(overlay: Image) {
    return overlay.getWidth() + "x" + overlay.getHeight();
}

function cacheOverlay(overlay: Image) {
    const key = computeCacheKey(overlay);
    overlayCache.set(key, overlay);
}

export async function loadOverlay(imageRelativePath: string) {
    const imageAbsolutePath = getAbsolutePath(imageRelativePath);
    overlay = await Jimp.read(imageAbsolutePath);
    const width = overlay.getWidth();
    const height = overlay.getHeight();
    const format = overlay.getExtension();
    Logger.info(`Loaded overlay. Metadata: Width: ${width}, Height: ${height}, Format: ${format}`);
    cacheOverlay(overlay);
}

export async function applyOverlay(folderRelativePath: string, filetree: FileTree, allowOverwrite: boolean) {
    const outputRootAbsolutePath = getAbsolutePath(folderRelativePath);
    const flatArray = toFlatArray(filetree.folder).filter(e => e.type === 'file');
    Logger.info(`Input folder contained ${flatArray.length} images`);
    
    const filteredArray = flatArray
        .map(img => {
            const inputAbsolutePath = path.join(filetree.rootAbsolutePath, img.relativePath);
            const outputAbsolutePath = path.join(outputRootAbsolutePath, img.relativePath);
            return {inputAbsolutePath, outputAbsolutePath, outputRelativePath: img.relativePath};
        })
        .filter( img => {
            if(allowOverwrite) return img;
            else if( fs.existsSync(img.outputAbsolutePath) ) {
                Logger.info(`An image already exists at ${img.outputRelativePath}. Skipping.`);
            }
            else return img;
        });
    
    Logger.info(`Found ${filteredArray.length} images to apply overlay on.`)
    for(const img of filteredArray) {
        try {
            await applyOverlayToImage(img);
        } catch (e) {
            console.error(`[Error processing image ${img.outputRelativePath}]`);
            console.error(e);
        }
    }
    Logger.info("All images processed.")
}

type Img = {inputAbsolutePath: string, outputAbsolutePath: string, outputRelativePath: string};
async function applyOverlayToImage(img: Img) {
    Logger.info(`* Processing image ${img.outputRelativePath}`)
    const image = await Jimp.read(img.inputAbsolutePath);

    const imageWidth = image.getWidth();
    const imageHeight = image.getHeight();
    
    Logger.debug(`** Input image metadata - W: ${imageWidth} H: ${imageHeight} Format: ${image.getExtension()}`);
    Logger.debug(`** Overlay image metadata - W: ${overlay.getWidth()} H: ${overlay.getHeight()} Format: ${overlay.getExtension()}`);

    const scaledOverlay = getScaledOverlay(image);
    image.composite(scaledOverlay, 0, 0, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacityDest: 1,
        opacitySource: 1,
    });
    image.writeAsync(img.outputAbsolutePath);
    Logger.info(`* Successfully processed ${img.outputRelativePath}`)
}

function getScaledOverlay(image: Image) {
    const key = computeCacheKey(image);
    
    const existingOverlay = overlayCache.get(key);
    if(existingOverlay) return existingOverlay;

    Logger.info(`** ** No pre-scaled overlay found that fits ${key}. Scaling overlay...`)
    const scaledOverlay = overlay.clone().resize(image.getWidth(), image.getHeight() );
    Logger.info("** ** Done scaling");
    cacheOverlay(scaledOverlay);
    return scaledOverlay;
}
