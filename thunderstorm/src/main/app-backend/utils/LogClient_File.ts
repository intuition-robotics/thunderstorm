import {LogClient_BaseRotate} from "@intuitionrobotics/ts-common/core/logger/LogClient_BaseRotate";
import {createWriteStream, existsSync, mkdirSync, renameSync, statSync, unlinkSync, WriteStream} from "fs";

export class LogClient_File
    extends LogClient_BaseRotate {

    private readonly pathToFolder: string;
    private buffer!: WriteStream;

    constructor(name: string, pathToFolder: string, maxEntries = 10, maxSize = 1024 * 1024) {
        super(name, maxEntries, maxSize);
        this.pathToFolder = pathToFolder;
        if (!existsSync(pathToFolder))
            mkdirSync(pathToFolder, {recursive: true});

        const defaultLogfile = this.getFileName();
        if (existsSync(defaultLogfile))
            this.bufferSize = statSync(`${defaultLogfile}`).size;

        this.prepare();
    }


    private getFileName(index = 0) {
        return `${this.pathToFolder}/${this.name}-${index}.txt`;
    }

    protected printLogMessage(log: string) {
        this.buffer.write(log);
    }

    protected rotateBuffer(fromIndex: number, toIndex: number): void {
        if (existsSync(this.getFileName(fromIndex))) {
            console.log(`rotating ${fromIndex} => ${toIndex}`);
            renameSync(this.getFileName(fromIndex), this.getFileName(toIndex));
        }
    }

    protected cleanup(): void {
        const fileName = this.getFileName(this.maxEntries - 1);
        if (existsSync(fileName))
            unlinkSync(fileName);
        this.buffer.end();
    }

    protected prepare(): void {
        this.buffer = createWriteStream(this.getFileName(), {flags: 'a'});
    }
}
