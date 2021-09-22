import { ensureProperty, readProperties } from "./properties";
import { filetreeScanner, copyFiletreeFolderStructure } from "./filetree-scanner";
import { applyOverlay, loadOverlay } from "./image-processor";

async function main() {
    const props = readProperties("auto-overlay.properties");
    console.log( props.getAllProperties() );

    const inputFolder = ensureProperty("input.folder", props);
    const overlayPath = ensureProperty("input.overlay", props);
    const outputFolder = ensureProperty("output.folder", props);
    const allowOverwrite = ensureProperty("output.allow-overwrite", props) === 'true';
    
    const fileTree = filetreeScanner(inputFolder, ["png", "jpg", "jpeg"]);
    copyFiletreeFolderStructure(outputFolder, fileTree);

    await loadOverlay(overlayPath);
    await applyOverlay(outputFolder, fileTree, allowOverwrite);
}

main()
.then(() => {
    console.log("******************************** END ********************************")
})
.catch(e => {
    console.error("Uncaught exception:");
    console.error(e);
});