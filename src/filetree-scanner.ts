import fs from 'fs';
import path from 'path';
import { Logger } from './logger';
import { getAbsolutePath } from './paths';

type FileEntity = {name: string, relativePath: string, type: 'file'|'folder'}
type FolderStub = {name: string, relativePath: string, type: 'folder'};
type Folder = FolderStub & {children: FileEntity[]};
export type FileTree = {folder: Folder, rootAbsolutePath: string};

export function filetreeScanner(folderRelativePath: string, allowedExtensions?: string[]): FileTree {
    const rootAbsolutePath = getAbsolutePath(folderRelativePath);
    const name = path.basename(rootAbsolutePath);
    if( !fs.existsSync(rootAbsolutePath) ) throw `No folder exists for value ${folderRelativePath} at location ${rootAbsolutePath}.`;

    const folder: Folder = filetreeScannerRecursive(rootAbsolutePath, allowedExtensions ?? [], {name, relativePath: ".", type: 'folder'});
    return {rootAbsolutePath, folder};
}

function filetreeScannerRecursive(rootAbsolutePath: string, allowedExtensions: string[], folder: FolderStub): Folder {
    const absolutePath = path.join(rootAbsolutePath, folder.relativePath);
    const children = fs.readdirSync(absolutePath, { withFileTypes: true} )
        .filter( obj => obj.isDirectory() || obj.isFile() )
        .map( obj => {
            const name = obj.name;
            const relativePath = path.join(folder.relativePath, obj.name);
            const type = obj.isFile() ? 'file' : 'folder';
            const entity: FileEntity = {name, relativePath, type};
            return entity;
        })
        .filter(obj => {
            // Allow everything if "allowed extensions" is empty
            if(allowedExtensions.length === 0) {
                return obj;
            }
            // Allow folders
            else if(obj.type === 'folder') {
                return obj;
            }
            // Allow files if it has an extension which is part of "allowed extensions"
            else {
                // Slice(0,1) will remove the leading '.' from the extension, that extname() returns
                const extension = path.extname(obj.relativePath).slice(1); 
                if( allowedExtensions.includes(extension) ) return obj;
                Logger.debug(`Skipping file ${obj.relativePath} due to illegal extension '${extension}'. Legal extensions are [${allowedExtensions.join(",")}]`)
            }
        })
        .map(obj => {
            if(obj.type === "file")  {
                return obj;
            }
            const folder = obj as FolderStub;
            return filetreeScannerRecursive(rootAbsolutePath, allowedExtensions, folder);
        });
    return {...folder, children};
}

export function toFlatArray(folder: Folder): FileEntity[] {
    const {name, relativePath, type} = folder;
    const entity: FileEntity = {name, relativePath, type};

    const children = folder.children
        .flatMap(e => {
            if(e.type === 'file') {
                return [e];
            }
            const folder = e as Folder;
            return [...toFlatArray(folder)];
        });
    return [entity, ...children];
}

export function copyFiletreeFolderStructure(folderRelativePath: string, fileTree: FileTree) {
    const rootAbsolutePath = getAbsolutePath(folderRelativePath);
    const flatArray = toFlatArray(fileTree.folder);
    flatArray
        .filter(e => e.type === 'folder')
        .map(e => path.join(rootAbsolutePath, e.relativePath))
        .filter(e => !fs.existsSync(e))
        .forEach(e => fs.mkdirSync(e));
}