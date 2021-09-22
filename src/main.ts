import { ensureProperty, readProperties } from "./properties";
import { filetreeScanner, copyFiletreeFolderStructure } from "./filetree-scanner";
import { applyOverlay, loadOverlay } from "./image-processor";
import { Logger, setLogLevel } from "./logger";
import PropertiesReader from "properties-reader";

async function main() {
    const props = readProperties("auto-overlay.properties");
    configureLogger(props.get("app.log-level")?.toString());

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
.then(async () => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    console.log("---- Press any key to exit ----")
    process.stdin.on('data', () => {
        process.exit();
    });
})
.catch(e => {
    Logger.error("Uncaught exception:");
    Logger.error(e);
});

function configureLogger(logLevel?: string) {
    if(logLevel !== 'error' && logLevel !== 'info' && logLevel !== 'debug') {
        setLogLevel('info');
        Logger.info(`Invalid log level '${logLevel}'. Defaulting to 'info'.`);
    } else {
        setLogLevel(logLevel);
        Logger.info(`Log level set to' ${logLevel}'.`);
    }
}