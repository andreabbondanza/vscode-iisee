'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ls from './Settings';
import * as srv from './Server';
import * as path from "path";
import * as vsh from "./VScodeHelper";
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
                {   //get settings and check if are availables
                    let localSettings = new ls.LocalSettings();
                    if (localSettings.CanOperate())
                    {
                        //set port setting and update
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
                {   //get settings and check if are availables
                    let localSettings = new ls.LocalSettings();
                    if (localSettings.CanOperate())
                    {
                        //set iis path setting and update
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
        //load settings and check if they are availables
        let localSettings = new ls.LocalSettings();
        if (localSettings.CanOperate())
        {   //reset settings and update 
            localSettings.UpdateSettings(localSettings.GetDefaultSettings());
            vscode.window.showInformationMessage("Settings have been restored to default values");
        }
        else
            vscode.window.showErrorMessage("You need to open a workspace directory before proceed");
    }, this);
    let disposableSetRunningFolder = vscode.commands.registerCommand('iisee.setRunningFolder', (args) =>
    {
        let nextPath = vscode.workspace.rootPath;
        //if opened by context menu args is null (and this means that we are in the root workspace directory)
        //if opened from console, args is undefined
        //if undefined show the popup
        if (args !== null && !args)
        {
            let iBox = vscode.window.showInputBox({
                placeHolder: "Default " + nextPath,
                prompt: "Select the site root path for the server",
                validateInput: (val: string) => { if (val == null || !val || val == "") return "Cannot insert empty path"; }
            }).then(SetRunningFolder);
        }
        else
        {   //else check if args is null (so I set nextPath to the workspace directory)
            if (args != null)
                nextPath = args._fsPath;
            //remove eventually file in the path
            var basePath = path.extname(nextPath) != "" ? path.dirname(nextPath) : nextPath;
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
    let disposableSetBrow = vscode.commands.registerCommand('iisee.setBrowser', (args) =>
    {
        var qPick = vscode.window.showQuickPick(["Edge", "Opera", "Firefox", "Chrome"], { placeHolder: "Edge" }).then((args) => 
        {
            if (!args)
                return;
            else
            {
                let brow = ls.Browser.MSEdge;
                switch (args)
                {
                    case "Opera":
                        {
                            brow = ls.Browser.Opera;
                            break;
                        }
                    case "Firefox":
                        {
                            brow = ls.Browser.Firefox;
                            break;
                        }
                    case "Chrome":
                        {
                            brow = ls.Browser.Chrome;
                            break;
                        }
                }
                let localSettings = new ls.LocalSettings();
                if (localSettings.CanOperate())
                {
                    localSettings.LoadSettings();
                    localSettings.LoadedSettings.Browser = brow;
                    localSettings.UpdateSettings(localSettings.LoadedSettings);
                    vscode.window.showInformationMessage("The current browser is : " + args);
                }
                else
                    vscode.window.showErrorMessage("You need to open a workspace directory before proceed");
            }
        }

        );

    }, this);
    let disposableStop = vscode.commands.registerCommand('iisee.stopServer', (args) =>
    {
        let localSettings = new ls.LocalSettings();
        localSettings.LoadSettings();
        var iisServer = new srv.Server(localSettings.LoadedSettings);
        if (!iisServer.StopServer())
            vscode.window.showErrorMessage("No server is running");
        else
            vscode.window.showInformationMessage("Server has been stopped");
        vsh.VsCodeHelper.ResetOutputChannel();
        vsh.VsCodeHelper.ResetStatusBarItem();

    });
    let disposableStart = vscode.commands.registerCommand('iisee.startServer', (args) =>
    {
        let localSettings = new ls.LocalSettings();
        localSettings.LoadSettings();
        var iisServer = new srv.Server(localSettings.LoadedSettings);
        //check if the server environment is OK
        if (iisServer.CheckEnvironment() == srv.ServerExecutionError.OK)
        {
            //execute server and show outputs
            iisServer.StartServer(args);
            let output = vsh.VsCodeHelper.GetOutputChannel();
            let url = "Connecting to: http:\\\\localhost:" + iisServer.Settings.Port;
            output.show(vscode.ViewColumn.Three);
            output.appendLine(url);
            let statusBar = vsh.VsCodeHelper.GetStatusBarItem();
            statusBar.text = "$(stop) " + url;
            statusBar.color = "orange";
            statusBar.tooltip = "Click to stop server";
            statusBar.command = "iisee.stopServer";
            statusBar.show();
        }
        else
        {
            vscode.window.showErrorMessage("You have a problem with the environment, please execute \"check\" command for more details");
        }
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
            vscode.window.showInformationMessage("The current folder path now is: " + val);
        }
        else
            vscode.window.showErrorMessage("You need to open a workspace directory before proceed");
    }
}
// this method is called when your extension is deactivated
export function deactivate()
{
}