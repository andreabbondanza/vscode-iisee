"use strict"

import * as vscode from "vscode";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as settings from "./Settings";

export enum ServerExecutionError
{
    OK,
    InvalidOS,
    IISNotInstalled,
    NoFolderInWorkspace,
    ERROR
}


interface IISSettings extends settings.IJSONSettings
{

}

interface IServer
{
    /**Server settings */
    Settings: IISSettings;
    /**Check if the environment can run extension and server */
    CheckEnvironment(): ServerExecutionError;
    /**Start the server */
    StartServer(port:number, currentPath:string): void;
    /**Stop server */
    StopServer(): void;
}

export class Server implements IServer
{
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
                        iisPath = path.join(process.env.ProgramFilesW6432, 'IIS Express', 'iisexpress.exe');
                        break;
                    }
                case settings.OSArch.x64:
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

    }
    StopServer(): void
    {

    }
    constructor(settings: IISSettings)
    {
        this.Settings = settings;
    }
}