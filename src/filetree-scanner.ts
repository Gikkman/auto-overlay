import fs from 'fs';
import path from 'path';

type FileEntity = {name: string, absolutePath: string, type: 'file'|'folder'}
type FolderStub = {name: string, absolutePath: string, type: 'folder'};
type Folder = FolderStub & {children: FileEntity[]};


export function filetreeScanner(folderRelativePath: string): Folder {
    const cwd = process.cwd();
    const absolutePath = path.join(cwd, folderRelativePath);
    const name = path.basename(absolutePath);
    if( !fs.existsSync(absolutePath) ) throw `No folder exists for value ${folderRelativePath} at location ${absolutePath}.`;

    return filetreeScannerRecursive( {name, absolutePath, type: 'folder'});
}

function filetreeScannerRecursive(folder: FolderStub): Folder {
    const children = fs.readdirSync(folder.absolutePath, { withFileTypes: true} )
        .filter( obj => obj.isDirectory() || obj.isFile() || obj.isSymbolicLink() )
        .map( obj => {
            const name = obj.name;
            const absolutePath = path.join(folder.absolutePath, obj.name);
            const type = obj.isFile() ? 'file' : 'folder';
            const entity: FileEntity = {name, absolutePath, type};
            return entity;
        })
        .map(obj => {
            if(obj.type === "file")  {
                return obj;
            }
            const folder = obj as FolderStub;
            return filetreeScannerRecursive(folder);
        });
    return {...folder, children};
}

export function toFlatArray(folder: Folder): FileEntity[] {
    const {name, absolutePath, type} = folder;
    const entity: FileEntity = {name, absolutePath, type};

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