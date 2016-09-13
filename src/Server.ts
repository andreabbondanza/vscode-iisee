"use strict";

import * as vscode from "vscode";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as prc from "child_process";
import * as settings from "./Settings";
import * as iconv from "iconv-lite";
import * as vsh from "./VScodeHelper";
/**Errors */
export enum ServerExecutionError
{
    OK,
    InvalidOS,
    IISNotInstalled,
    NoFolderInWorkspace,
    ERROR
}
/**Extends the IJSONSettings (maybe for only server settings) */
interface IISSettings extends settings.IJSONSettings
{

}
/**Server interface */
interface IServer
{
    /**Server settings */
    Settings: IISSettings;
    /**Check if the environment can run extension and server */
    CheckEnvironment(): ServerExecutionError;
    /**Start the server */
    StartServer(port: number, currentPath: string): void;
    /**Stop server */
    StopServer(): void;
    DecodeBuffer(daty: any): any;
}

/**Server implementation */
export class Server implements IServer
{
    static Process = null;
    Settings: IISSettings;

    CheckEnvironment(): ServerExecutionError
    {
        //Check if the OS is windows
        //----------------------------------------------------------------------------------------
        let myOs = os.type();
        let osID = myOs.toUpperCase();
        if (!osID.includes("WINDOWS_NT"))
        {
            vscode.window.showErrorMessage('Sorry, IIS work only on Windows environment');
            return ServerExecutionError.InvalidOS;
        }
        //----------------------------------------------------------------------------------------
        //Check if the workspace folder exists
        let workSpaceFolder = vscode.workspace.rootPath;
        if (!workSpaceFolder)
        {
            vscode.window.showErrorMessage('This extension works only with an active workspace directory');
            return ServerExecutionError.NoFolderInWorkspace;
        }
        //----------------------------------------------------------------------------------------
        //Get the IIS path
        //If custom
        let iisPath = this.Settings.IISPath != "" ? this.Settings.IISPath : null;
        if (iisPath == null)
        {
            switch (this.Settings.Architecture)
            {
                case settings.OSArch.x64:
                    {
                        iisPath = path.join(process.env.ProgramW6432, 'IIS Express', 'iisexpress.exe');
                        break;
                    }
                case settings.OSArch.x86:
                    {
                        iisPath = path.join(process.env.ProgramFiles, 'IIS Express', 'iisexpress.exe');
                        break;
                    }
            }
        }
        try
        {
            //Check if we can find the file path (get stat info on it)
            var fileCheck = fs.statSync(iisPath);
        }
        catch (err)
        {
            //ENOENT - File or folder not found
            if (err && err.code.toUpperCase() === 'ENOENT')
            {
                vscode.window.showErrorMessage("IIS isn't installed in the current path: " + iisPath);
                return ServerExecutionError.IISNotInstalled;
            }
            else if (err)
            {
                vscode.window.showErrorMessage("Something wrong finding into :" + iisPath + ". Details: " + err.message);
                return ServerExecutionError.ERROR;
            }
        }
        return ServerExecutionError.OK;
    }
    StartServer(): void
    {
        Server.Process = prc.spawn(this.Settings.IISPath, [(".path:" + this.Settings.RunningFolder), ("-port:" + this.Settings.Port)]);
        //Attach all the events & functions to iisProcess
        Server.Process.stdout.on('data', function (data)
        {
            var data = this.DecodeBuffer(data);
            vsh.VsCodeHelper.GetOutputChannel().appendLine(data);
        });
        Server.Process.stderr.on('data', function (data)
        {
            var data = this.DecodeBuffer(data);
            vsh.VsCodeHelper.GetOutputChannel().appendLine("stderr: " + data);            
        });
        Server.Process.on('error', function (err)
        {
            var message = this.DecodeBuffer(err.message);
            vsh.VsCodeHelper.GetOutputChannel().appendLine("ERROR: " + message);            
        });
    }
    StopServer(): boolean
    {
        if (Server.Process == null)
        {
            return false;
        }
        Server.Process.kill('SIGINT');
        Server.Process = null;
        return true;
    }
    DecodeBuffer(data: any): any
    {
        var buffer = new Buffer(data);
        return iconv.decode(buffer, 'utf8');
    }
    constructor(settings: IISSettings)
    {
        this.Settings = settings;
    }
}