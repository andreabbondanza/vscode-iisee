"use strict";

import * as fsystem from 'fs';
import * as vscode from "vscode";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as prc from "child_process";
import * as settings from "./Settings";
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
    StartServer(currentPath: string): void;
    /**Stop server */
    StopServer(): void;
    GetBrowserString(browser: settings.Browser);
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
    StartServer(selectedPath: any): void
    {
        console.log(vscode.workspace.rootPath);
        if (!selectedPath)
            selectedPath = this.Settings.RunningFolder;
        else
        {
            selectedPath = selectedPath._fsPath;
        }
        let url: string = selectedPath;
        url = url.replace(this.Settings.RunningFolder, "");
        let isDir = fsystem.lstatSync(selectedPath).isDirectory();
        let effectivePath = !isDir ? path.dirname(selectedPath) : selectedPath;
        let protocol = this.Settings.Protocol == settings.Protocol.https ? "https" : "http";
        if (Server.Process == null)
        {
            let appcmd = path.dirname(this.Settings.IISPath) + "\\appcmd.exe";
            //need to refresh
            Server.Process = prc.spawnSync(appcmd, [("delete"), ("site"), (path.basename(vscode.workspace.rootPath).replace(" ", "_"))]);
            //add site to default config file            
            Server.Process = prc.spawnSync(appcmd, [("add"), ("site"), ("-name:" + path.basename(vscode.workspace.rootPath).replace(" ","_")), ("-bindings:"+protocol+"://localhost:" + this.Settings.Port),
                ("-physicalPath:" + effectivePath)]);            
            Server.Process = prc.spawn(this.Settings.IISPath, [("-site:" + path.basename(vscode.workspace.rootPath).replace(" ","_") )]);
        }            
        let browser = prc.exec("start " + this.GetBrowserString(this.Settings.Browser) + " "+protocol+"://localhost:" + this.Settings.Port + url);
        Server.Process.stdout.on('data', function (data)
        {
            let toAppend = data;
            vsh.VsCodeHelper.GetOutputChannel().appendLine(data);
        });
        Server.Process.stderr.on('data', function (data)
        {
            vsh.VsCodeHelper.GetOutputChannel().appendLine("stderr: " + data);            
        });
        Server.Process.on('error', function (err)
        {
            vsh.VsCodeHelper.GetOutputChannel().appendLine("ERROR: " + err);            
        });
    }
    StartServerScript(selectedPath: string): void
    {
        console.log(vscode.workspace.rootPath);
        let url: string = selectedPath;
        url = url.replace(path.dirname(selectedPath), "");
        let effectivePath = path.dirname(selectedPath);
        let protocol = this.Settings.Protocol == settings.Protocol.https ? "https" : "http";
        if (Server.Process == null)
        {
            let appcmd = path.dirname(this.Settings.IISPath) + "\\appcmd.exe";
            //need to refresh
            Server.Process = prc.spawnSync(appcmd, [("delete"), ("site"), (path.basename(vscode.workspace.rootPath).replace(" ", "_"))]);
            //add site to default config file            
            Server.Process = prc.spawnSync(appcmd, [("add"), ("site"), ("-name:" + path.basename(vscode.workspace.rootPath).replace(" ","_")), ("-bindings:"+protocol+"://localhost:" + this.Settings.Port),
                ("-physicalPath:" + effectivePath)]);            
            Server.Process = prc.spawn(this.Settings.IISPath, [("-site:" + path.basename(vscode.workspace.rootPath).replace(" ","_") )]);
        }            
        let browser = prc.exec("start " + this.GetBrowserString(this.Settings.Browser) + " "+protocol+"://localhost:" + this.Settings.Port + url);
        Server.Process.stdout.on('data', function (data)
        {
            let toAppend = data;
            vsh.VsCodeHelper.GetOutputChannel().appendLine(data);
        });
        Server.Process.stderr.on('data', function (data)
        {
            vsh.VsCodeHelper.GetOutputChannel().appendLine("stderr: " + data);            
        });
        Server.Process.on('error', function (err)
        {
            vsh.VsCodeHelper.GetOutputChannel().appendLine("ERROR: " + err);            
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
    constructor(settings: IISSettings)
    {
        this.Settings = settings;
    }
    /**Return the browser string */
    GetBrowserString(browser: settings.Browser)
    {
        switch (browser)
        {
            case settings.Browser.Opera:
                {
                    return "opera";
                }
            case settings.Browser.Firefox:
                {
                    return "firefox";
                }
            case settings.Browser.Chrome:
                {
                    return "chrome";
                }
            case settings.Browser.Vivaldi:
                {
                    return "vivaldi";
            }    
        }
        return "";
    }
}