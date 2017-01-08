"use strict"

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export enum Protocol
{
    http,
    https
}    

export enum OSArch
{
    x86,
    x64
}

export enum Browser
{
    MSEdge,
    Firefox,
    Opera,
    Vivaldi,
    Chrome
}

export interface IJSONSettings
{
    /**Custom iis folder */
    IISPath: string;
    /**Architecture */
    Architecture: OSArch;
    /**Port number */
    Port: number,
    /**Folder execution */
    RunningFolder: string;
    /**Browser */
    Browser: Browser;
    /**Protocol */
    Protocol: Protocol;
}

interface ILocalSettings
{
    LoadedSettings: IJSONSettings;
    DefaultPath: string;
    DefaultFile: string;
    LoadSettings(): void;
    UpdateSettings(json: IJSONSettings): void;
    GetLocalSettings(): string;
    SetLocalSettings(json: string): boolean;
    CreateLocalSettingsFile(): boolean;
    CanOperate(): boolean,
    GetDefaultSettings(): IJSONSettings;
}



export class LocalSettings implements ILocalSettings
{
    LoadedSettings: IJSONSettings;
    DefaultPath: string;
    /**Default workspace root path to the settings file */
    DefaultFile: string;
    /**Load settings in the LoadedSettings property */
    LoadSettings(): void
    {
        let jsonString = this.GetLocalSettings();
        let jsonSettingsObject = JSON.parse(jsonString);
        this.LoadedSettings = jsonSettingsObject;
    }
    UpdateSettings(json: IJSONSettings): void
    {
        this.SetLocalSettings(JSON.stringify(json));
    }
    /**Return the settings json */
    GetLocalSettings(): string
    {
        try 
        {
            let json = fs.readFileSync(this.DefaultFile, "utf8");
            return json;
        }
        catch (error)
        {
            //file dosn't exist, so we need to create it;
            if (!this.CreateLocalSettingsFile())
            {
                vscode.window.showErrorMessage("Cannot create the settings file, please check the folder");
            }
            let json = fs.readFileSync(this.DefaultFile, "utf8");
            return json;
        }
    }
    /**Set a string json in the settings file */
    SetLocalSettings(json: string): boolean
    {
        try 
        {
            fs.writeFileSync(this.DefaultFile, json, ["utf8"]);
            return true;
        }
        catch (error) 
        {
            //file dosn't exist, so we need to create it;
            if (!this.CreateLocalSettingsFile())
            {
                vscode.window.showErrorMessage("Cannot create the settings file, please check the folder");
                return false;
            }
            let json = fs.readFileSync(this.DefaultFile, "utf8");
            return true;
        }
    }
    /**Create the settings file */
    CreateLocalSettingsFile(): boolean
    {
        try 
        {
            if (!fs.existsSync(this.DefaultPath))
            {
                fs.mkdirSync(this.DefaultPath);
            }
            let settings: IJSONSettings;
            settings = this.GetDefaultSettings();
            fs.closeSync(fs.openSync(this.DefaultFile, 'w'));
            fs.writeFileSync(this.DefaultFile, JSON.stringify(settings), ["utf8"]);
            return true;
        }
        catch (error)
        {
            return false;
        }
    }
    CanOperate(): boolean
    {
        if (vscode.workspace.rootPath)
            return true;
        else
            return false;
    }
    GetDefaultSettings(): IJSONSettings
    {
        return { Port: 11117, RunningFolder: vscode.workspace.rootPath, Architecture: OSArch.x86, IISPath: path.join(process.env.ProgramFiles, 'IIS Express', 'iisexpress.exe'), Browser: Browser.MSEdge, Protocol: Protocol.http  };
    }
  
    /**Constructor */
    constructor()
    {
        this.DefaultPath = vscode.workspace.rootPath + "\\.vscode";
        this.DefaultFile = this.DefaultPath + "\\iis-e-settings.json";
    }
}