import { HotPatcher } from "hot-patcher";
import { createDirectory, deleteFile, getDirectoryContents, getFileContents, getMetadata, putFileContents } from "./requests.js";
import { DropboxFSInterface } from "./fs.js";
import { request } from "./request.js";
import { DropboxClientConfig, DropboxPathInfo } from "./types.js";

/**
 * Normalise a path to NFC (composed) Unicode form before sending it to
 * Dropbox. iOS stores filenames in NFD (decomposed) form on disk, so a
 * path built from locally-entered/observed text can otherwise diverge
 * (byte-for-byte) from the NFC form Dropbox's API expects/returns,
 * breaking lookups for filenames containing diacritics (buttercup/buttercup-mobile#147).
 * @param path The path to normalise
 * @returns The normalised path
 */
function normalisePath(path: string): string {
    return path.normalize("NFC");
}

export class DropboxClient {
    fs: DropboxFSInterface;
    patcher: HotPatcher = new HotPatcher();
    protected _config: DropboxClientConfig;
    private __token: string;

    constructor(token: string, config: DropboxClientConfig = {}) {
        this.patcher.patch("request", request);
        this.__token = token;
        this._config = config;
        this.fs = new DropboxFSInterface(this);
    }

    async createDirectory(path: string): Promise<void> {
        await createDirectory(normalisePath(path), this.__token, this.patcher, this._config);
    }

    async delete(path: string): Promise<void> {
        await deleteFile(normalisePath(path), this.__token, this.patcher, this._config);
    }

    /**
     * Delete a remote file
     * @deprecated Use `delete` instead
     * @param path The file path to delete
     */
    async deleteFile(path: string): Promise<void> {
        await this.delete(path);
    }

    async getDirectoryContents(path: string): Promise<Array<DropboxPathInfo>> {
        return getDirectoryContents(normalisePath(path), this.__token, this.patcher, this._config);
    }

    async getFileContents(filename: string): Promise<string> {
        return getFileContents(normalisePath(filename), this.__token, this.patcher, this._config);
    }

    async getInfo(path: string): Promise<DropboxPathInfo> {
        return getMetadata(normalisePath(path), this.__token, this.patcher, this._config);
    }

    async putFileContents(filename: string, data: string | Buffer): Promise<void> {
        await putFileContents(normalisePath(filename), data, this.__token, this.patcher, this._config);
    }
}

