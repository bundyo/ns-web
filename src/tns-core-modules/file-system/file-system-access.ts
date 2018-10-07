import { encoding as textEncoding } from "../text";
import { ios } from "../utils";

// TODO: Implement all the APIs receiving callback using async blocks
// TODO: Check whether we need try/catch blocks for the iOS implementation
export class FileSystemAccess {

    public getLastModified(path: string): Date {
        // const fileManager = ios.getter(NSFileManager, NSFileManager.defaultManager);
        // const attributes = fileManager.attributesOfItemAtPathError(path);
        //
        // if (attributes) {
        //     return attributes.objectForKey("NSFileModificationDate");
        // } else {
            return new Date();
        // }
    }

    public getFileSize(path: string): number {
        // const fileManager = ios.getter(NSFileManager, NSFileManager.defaultManager);
        // const attributes = fileManager.attributesOfItemAtPathError(path);
        // if (attributes) {
        //     return attributes.objectForKey("NSFileSize");
        // } else {
            return 0;
        // }
    }

    public getParent(path: string, onError?: (error: any) => any): { path: string; name: string } {
        try {
            const fileManager = ios.getter(NSFileManager, NSFileManager.defaultManager);
            const nsString = NSString.stringWithString(path);

            const parentPath = nsString.stringByDeletingLastPathComponent;
            const name = fileManager.displayNameAtPath(parentPath);

            return {
                path: parentPath.toString(),
                name: name
            };
        } catch (exception) {
            if (onError) {
                onError(exception);
            }

            return undefined;
        }
    }

    public getFile(path: string, onError?: (error: any) => any): { path: string; name: string; extension: string } {
        try {
            // const fileManager = ios.getter(NSFileManager, NSFileManager.defaultManager);
            // const exists = fileManager.fileExistsAtPath(path);

            // if (!exists) {
            //     const parentPath = this.getParent(path, onError).path;
            //     if (!fileManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(parentPath, true, null)
            //         || !fileManager.createFileAtPathContentsAttributes(path, null, null)) {
            //         if (onError) {
            //             onError(new Error("Failed to create file at path '" + path + "'"));
            //         }
            //         return undefined;
            //     }
            // }

            // const fileName = fileManager.displayNameAtPath(path);

            if (!this.fileExists(path)) {
                onError(new Error("File at path '" + path + "' doesn't exist!"));
            }

            return {
                path: path,
                name: this.getFileName(path),
                extension: this.getFileExtension(path)
            };
        } catch (exception) {
            if (onError) {
                onError(exception);
            }

            return undefined;
        }
    }

    public getFolder(path: string, onError?: (error: any) => any): { path: string; name: string } {
        try {
//            const fileManager = ios.getter(NSFileManager, NSFileManager.defaultManager);
            const exists = this.folderExists(path);

            // if (!exists) {
            //     try {
            //         fileManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(path, true, null)
            //     }
            //     catch (ex) {
            //         if (onError) {
            //             onError(new Error("Failed to create folder at path '" + path + "': " + ex));
            //         }
            //
            //         return undefined;
            //     }
            // }
            //
            // const dirName = fileManager.displayNameAtPath(path);

            return {
                path: path,
                name: path
            };
        } catch (ex) {
            if (onError) {
                onError(new Error("Failed to create folder at path '" + path + "'"));
            }

            return undefined;
        }
    }

    public getExistingFolder(path: string, onError?: (error: any) => any): { path: string; name: string } {
        try {
            const exists = this.folderExists(path);

            if (exists) {
                return {
                    path: path,
                    name: this.getFileName(path),
                };
            }
            return undefined;
        } catch (ex) {
            if (onError) {
                onError(new Error("Failed to get folder at path '" + path + "'"));
            }

            return undefined;
        }
    }

    public eachEntity(path: string, onEntity: (file: { path: string; name: string; extension: string }) => any, onError?: (error: any) => any) {
        if (!onEntity) {
            return;
        }

        this.enumEntities(path, onEntity, onError);
    }

    public getEntities(path: string, onError?: (error: any) => any): Array<{ path: string; name: string; extension: string }> {
        const fileInfos = new Array<{ path: string; name: string; extension: string }>();

        const onEntity = function (entity: { path: string; name: string; extension: string }): boolean {
            fileInfos.push(entity);
            return true;
        }

        let errorOccurred;
        const localError = function (error: any) {
            if (onError) {
                onError(error);
            }

            errorOccurred = true;
        }

        this.enumEntities(path, onEntity, localError);

        if (!errorOccurred) {
            return fileInfos;
        }

        return null;
    }

    public fileExists(path: string): boolean {
        const result = this.exists(path);
        return result.exists;
    }

    public folderExists(path: string): boolean {
        const result = this.exists(path);
        return result.exists && result.isDirectory;
    }

    private exists(path: string): { exists: boolean, isDirectory: boolean } {
        // const fileManager = ios.getter(NSFileManager, NSFileManager.defaultManager);
        // const isDirectory = new interop.Reference(interop.types.bool, false);
        // const exists = fileManager.fileExistsAtPathIsDirectory(path, isDirectory);
        //
        // return { exists: exists, isDirectory: isDirectory.value };
        path = this.normalizePath(path);
        const exists = global.context.keys().filter(key => key.startsWith(path)).length > 0;
        const isDirectory = global.context.keys().filter(key => key.startsWith(path + "/")).length > 0;
        return { exists, isDirectory };
    }

    public concatPath(left: string, right: string): string {
        // return NSString.pathWithComponents(<any>[left, right]).toString();
        return this.joinPath(left, right);
    }

    public deleteFile(path: string, onError?: (error: any) => any) {
        this.deleteEntity(path, onError);
    }

    public deleteFolder(path: string, onError?: (error: any) => any) {
        this.deleteEntity(path, onError);
    }

    public emptyFolder(path: string, onError?: (error: any) => any) {
        // const fileManager = ios.getter(NSFileManager, NSFileManager.defaultManager);
        // const entities = this.getEntities(path, onError);
        //
        // if (!entities) {
        //     return;
        // }
        //
        // for (let i = 0; i < entities.length; i++) {
        //     try {
        //         fileManager.removeItemAtPathError(entities[i].path);
        //     }
        //     catch (ex) {
        //         if (onError) {
        //             onError(new Error("Failed to empty folder '" + path + "': " + ex));
        //         }
        //
        //         return;
        //     }
        // }
    }

    public rename(path: string, newPath: string, onError?: (error: any) => any) {
        // const fileManager = ios.getter(NSFileManager, NSFileManager.defaultManager);
        //
        // try {
        //     fileManager.moveItemAtPathToPathError(path, newPath);
        // } catch (ex) {
        //     if (onError) {
        //         onError(new Error("Failed to rename '" + path + "' to '" + newPath + "': " + ex));
        //     }
        // }
    }

    public getLogicalRootPath(): string {
        // const mainBundlePath = ios.getter(NSBundle, NSBundle.mainBundle).bundlePath;
        // const resolvedPath = NSString.stringWithString(mainBundlePath).stringByResolvingSymlinksInPath;
        // return resolvedPath;
        return "";
    }

    public getDocumentsFolderPath(): string {
        // return this.getKnownPath(NSSearchPathDirectory.DocumentDirectory);
        return "";
    }

    public getTempFolderPath(): string {
        // return this.getKnownPath(NSSearchPathDirectory.CachesDirectory);
        return "";
    }

    public getCurrentAppPath(): string {
        // return ios.getCurrentAppPath();
        return "";
    }

    public readText(path: string, onError?: (error: any) => any, encoding?: any) {
        try {
            return global.context(this.normalizePath(path));
        } catch (ex) {
            if (onError) {
                onError(new Error("Failed to read file at path '" + path + "': " + ex));
            }
        }
    }

    public read(path: string, onError?: (error: any) => any): NSData {
        try {
            return this.readText(path);
        } catch (ex) {
            if (onError) {
                onError(new Error("Failed to read file at path '" + path + "': " + ex));
            }
        }
    }

    public writeText(path: string, content: string, onError?: (error: any) => any, encoding?: any) {
        throw new Error("writeText is not implemented!");
        // const actualEncoding = encoding || textEncoding.UTF_8;
        //
        // // TODO: verify the useAuxiliaryFile parameter should be false
        // try {
        //     const nsString = NSString.stringWithString(content);
        //
        //     nsString.writeToFileAtomicallyEncodingError(path, false, actualEncoding);
        // } catch (ex) {
        //     if (onError) {
        //         onError(new Error("Failed to write to file '" + path + "': " + ex));
        //     }
        // }
    }

    public write(path: string, content: NSData, onError?: (error: any) => any) {
        throw new Error("write is not implemented!");
        // try {
        //     content.writeToFileAtomically(path, true);
        // } catch (ex) {
        //     if (onError) {
        //         onError(new Error("Failed to write to file '" + path + "': " + ex));
        //     }
        // }
    }

    private getKnownPath(folderType: number): string {
        // const fileManager = ios.getter(NSFileManager, NSFileManager.defaultManager);
        // const paths = fileManager.URLsForDirectoryInDomains(folderType, NSSearchPathDomainMask.UserDomainMask);
        //
        // const url = paths.objectAtIndex(0);
        // return url.path;

        return "";
    }

    public getFileName(path: string): string {
        return path.substr(path.lastIndexOf('/') + 1, path.length);
    }
    // TODO: This method is the same as in the iOS implementation.
    // Make it in a separate file / module so it can be reused from both implementations.
    public getFileExtension(path: string): string {
        // TODO [For Panata]: The definitions currently specify "any" as a return value of this method
        //const nsString = Foundation.NSString.stringWithString(path);
        //const extension = nsString.pathExtension();

        //if (extension && extension.length > 0) {
        //    extension = extension.concat(".", extension);
        //}

        //return extension;
        const dotIndex = path.lastIndexOf(".");
        if (dotIndex && dotIndex >= 0 && dotIndex < path.length) {
            return path.substring(dotIndex);
        }

        return "";
    }

    private deleteEntity(path: string, onError?: (error: any) => any) {
        throw new Error("deleteEntity is not implemented");
        // try {
        //     const fileManager = ios.getter(NSFileManager, NSFileManager.defaultManager);
        //
        //     fileManager.removeItemAtPathError(path);
        // } catch (ex) {
        //     if (onError) {
        //         onError(new Error("Failed to delete file at path '" + path + "': " + ex));
        //     }
        // }
    }

    private enumEntities(path: string, callback: (entity: { path: string; name: string; extension: string }) => boolean, onError?: (error) => any) {
        try {
            let files = [];

            try {
                path = this.normalizePath(path);
                files = global.context.keys()
                    .filter(x => x.startsWith(path))
                    .map(x => {
                        const relative = x.substring(path.length + 1);
                        const slashIdx = relative.indexOf('/');
                        return slashIdx > 0 ? relative.substring(0, slashIdx) : relative;
                    });
            } catch (ex) {
                if (onError) {
                    onError(new Error("Failed to enum files for folder '" + path + "': " + ex));
                }

                return;
            }

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                const info = {
                    path: this.concatPath(path, file),
                    name: file,
                    extension: ""
                };

                if (!this.folderExists(this.joinPath(path, file))) {
                    info.extension = this.getFileExtension(info.path);
                }

                const retVal = callback(info);
                if (retVal === false) {
                    // the callback returned false meaning we should stop the iteration
                    break;
                }
            }
        } catch (ex) {
            if (onError) {
                onError(ex);
            }
        }
    }

    public getPathSeparator(): string {
        return "/";
    }

    public normalizePath(path: string): string {
        // const nsString: NSString = NSString.stringWithString(path);
        // const normalized = nsString.stringByStandardizingPath;
        //
        // return normalized;

        //context entries start with "./"
        if (!path.startsWith("./")) {
            if (path.startsWith("/")) {
                path = "." + path;
            } else {
                path = "./" + path;
            }
        }

        // strip trailing /
        path = path.endsWith('/') ? path.substring(0, path.length-1) : path;

        return path;
    }

    public joinPath(left: string, right: string): string {
        // const nsString: NSString = NSString.stringWithString(left);
        // return nsString.stringByAppendingPathComponent(right);
        return `${left}/${right}`;
    }

    public joinPaths(paths: string[]): string {
       // return ios.joinPaths(...paths);
        return paths.join("/");
    }
}
