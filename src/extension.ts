'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ls from './Settings';
import * as srv from './Server';
import * as path from "path";

class VsCodeHelper
{
    static StatusBar = null;
    static OutputChannel = null;
    static GetOutputChannel(): vscode.OutputChannel
    {

        return VsCodeHelper.OutputChannel == null ? VsCodeHelper.OutputChannel = vscode.window.createOutputChannel("IIS-Express executer") : VsCodeHelper.OutputChannel;
    }
    static GetStatusBarItem(): vscode.StatusBarItem
    {
        return VsCodeHelper.StatusBar != null ? VsCodeHelper.StatusBar : VsCodeHelper.StatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "iis-express-executer" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposableCheck = vscode.commands.registerCommand('iisee.checkComp', () =>
    {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        let localSettings = new ls.LocalSettings();
        //get settings
        if (localSettings.CanOperate())
        {
            localSettings.LoadSettings();
            let server = new srv.Server(localSettings.LoadedSettings);
            let compatibility = server.CheckEnvironment();
            if (compatibility == srv.ServerExecutionError.OK)
            {
                vscode.window.showInformationMessage("Your environment can run IIS-Express-executor");
            }
            else
            {
                let error = "";
                switch (compatibility) 
                {
                    case srv.ServerExecutionError.ERROR:
                        {
                            error = "A generic error occurred";
                            break;
                        }
                    case srv.ServerExecutionError.IISNotInstalled:
                        {
                            error = "IIS isn't installed in the path";
                            break;
                        }
                    case srv.ServerExecutionError.InvalidOS:
                        {
                            error = "IIS works only on windows";
                            break;
                        }
                    case srv.ServerExecutionError.NoFolderInWorkspace:
                        {
                            error = "You need to open a folder in your workspace";
                            break;
                        }
                }

                vscode.window.showErrorMessage("I'm sorry, but seems that your environment can't run IIS because: " + error);
            }
        }
        else
        {
            vscode.window.showErrorMessage("You need to open a workspace directory before proceed");
        }
    });
    let disposableSetPort = vscode.commands.registerCommand('iisee.setPort', () =>
    {
        let iBox = vscode.window.showInputBox({
            placeHolder: "Default 11117",
            prompt: "Select the server exposed port",
            validateInput: (val: string) => { if (isNaN(Number(val)) || Number(val) <= 1024) return "You shoud insert a number > 1024"; }
        }).then(
            (val) =>
            {
                if (!val || val == "" || val == null)
                    return;
                else
                {
                    let localSettings = new ls.LocalSettings();
                    if (localSettings.CanOperate())
                    {
                        localSettings.LoadSettings();
                        localSettings.LoadedSettings.Port = +val;
                        localSettings.UpdateSettings(localSettings.LoadedSettings);
                        vscode.window.showInformationMessage("The port now is: " + val);
                    }
                    else
                        vscode.window.showErrorMessage("You need to open a workspace directory before proceed");
                }
            });
        //let outChannel = vscode.window.createOutputChannel('Git');

    }, this);
    let disposableSetIISPath = vscode.commands.registerCommand('iisee.setIISPath', () =>
    {
        let iBox = vscode.window.showInputBox({
            placeHolder: "Default (depending by architectures) " + process.env.ProgramFiles,
            prompt: "Select the path for IIS installation",
            validateInput: (val: string) => { if (val == null || !val || val == "") return "Cannot insert empty path"; }
        }).then(
            (val) =>
            {
                if (!val || val == "" || val == null)
                    return;
                else
                {
                    let localSettings = new ls.LocalSettings();
                    if (localSettings.CanOperate())
                    {
                        localSettings.LoadSettings();
                        localSettings.LoadedSettings.IISPath = val;
                        localSettings.UpdateSettings(localSettings.LoadedSettings);
                        vscode.window.showInformationMessage("The IIS path now is:" + val);
                    }
                    else
                        vscode.window.showErrorMessage("You need to open a workspace directory before proceed");
                }
            });
    }, this);
    let disposableReset = vscode.commands.registerCommand('iisee.reset', () =>
    {
        let localSettings = new ls.LocalSettings();
        if (localSettings.CanOperate())
        {
            localSettings.UpdateSettings(localSettings.GetDefaultSettings());
            vscode.window.showInformationMessage("Settings have been restored to default values");
        }
        else
            vscode.window.showErrorMessage("You need to open a workspace directory before proceed");
    }, this);
    let disposableSetRunningFolder = vscode.commands.registerCommand('iisee.setRunningFolder', (args) =>
    {
        if (!args)
        {
            let iBox = vscode.window.showInputBox({
                placeHolder: "Default \".\"",
                prompt: "Select the site root path for the server",
                validateInput: (val: string) => { if (val == null || !val || val == "") return "Cannot insert empty path"; }
            }).then(SetRunningFolder);
        }
        else
        {
            var basePath = path.dirname(args._fsPath);
            SetRunningFolder(basePath);
        }
    }, this);
    let disposableSetArch = vscode.commands.registerCommand('iisee.setOSArch', (args) =>
    {
        var qPick = vscode.window.showQuickPick(["x86", "x64"], { placeHolder: "x86" }).then((args) => 
        {
            if (!args)
                return;
            else
            {
                let arch = ls.OSArch.x86;
                switch (args)
                {
                    case "x64":
                        {
                            arch = ls.OSArch.x64;
                            break;
                        }
                }
                let localSettings = new ls.LocalSettings();
                if (localSettings.CanOperate())
                {
                    localSettings.LoadSettings();
                    localSettings.LoadedSettings.Architecture = arch;
                    localSettings.UpdateSettings(localSettings.LoadedSettings);
                    vscode.window.showInformationMessage("The current architecture is : " + args);
                }
                else
                    vscode.window.showErrorMessage("You need to open a workspace directory before proceed");
            }
        }

        );

    }, this);
    let disposableStop = vscode.commands.registerCommand('iisee.stopServer', (args) =>
    {
        var ls = new ls.LocalSettings();
        ls.LoadSettings();
        var iisServer = new srv.Server(ls.LoadedSettings);
        if (!iisServer.StopServer())
            vscode.window.showErrorMessage("No server is running");
        else
            vscode.window.showInformationMessage("Server has been stopped");
        VsCodeHelper.GetOutputChannel().clear();
        VsCodeHelper.GetOutputChannel().hide();
        VsCodeHelper.GetOutputChannel().dispose();
        VsCodeHelper.GetStatusBarItem().hide();
        VsCodeHelper.GetStatusBarItem().dispose();
    });
    let disposableStart = vscode.commands.registerCommand('iisee.startServer', (args) =>
    {
        var ls = new ls.LocalSettings();
        ls.LoadSettings();
        var iisServer = new srv.Server(ls.LoadedSettings);
        //iisServer.StartServer();
        let output = VsCodeHelper.GetOutputChannel();
        let url = "Connecting to: http:\\\\localhost:" + iisServer.Settings.Port;
        output.show(vscode.ViewColumn.Three);
        output.appendLine(url);
        let statusBar = VsCodeHelper.GetStatusBarItem();
        statusBar.text = "$(browser) " + url;
        statusBar.tooltip = "Click to stop server";
        statusBar.command = "extension:iisee.stopServer";
        statusBar.show();
        



    }, this);
    context.subscriptions.push(disposableCheck);
    context.subscriptions.push(disposableSetPort);
    context.subscriptions.push(disposableSetIISPath);
    context.subscriptions.push(disposableReset);
    context.subscriptions.push(disposableSetRunningFolder);
    context.subscriptions.push(disposableSetArch);
    context.subscriptions.push(disposableStart);
    context.subscriptions.push(disposableStop);
}
function SetRunningFolder(val): void
{
    if (!val || val == "" || val == null)
        return;
    else
    {
        let localSettings = new ls.LocalSettings();
        if (localSettings.CanOperate())
        {
            localSettings.LoadSettings();
            localSettings.LoadedSettings.RunningFolder = val;
            localSettings.UpdateSettings(localSettings.LoadedSettings);
            vscode.window.showInformationMessage("The current folder path path now is: " + val);
        }
        else
            vscode.window.showErrorMessage("You need to open a workspace directory before proceed");
    }
}
// this method is called when your extension is deactivated
export function deactivate()
{
}