'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ls from './Settings';
import * as srv from './Server';


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

                vscode.window.showErrorMessage("I'm sorry, but seems that your environment can't run IIS because:" + error);
            }
        }
        else
        {
            vscode.window.showErrorMessage("You need to open a workspace directory before proceed");
        }
    });
    let disposableSetPort = vscode.commands.registerCommand('iisee.setPort', () =>
    {
        let x = vscode.window.showInputBox({
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
        let x = vscode.window.showInputBox({
            placeHolder: "Default (depending by architectures) "+process.env.ProgramFiles,
            prompt: "Select the path for IIS installation",
            validateInput: (val: string) => { if(val == null || !val || val == "") return "Cannot insert empty path"; } 
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


    context.subscriptions.push(disposableCheck);
    context.subscriptions.push(disposableSetPort);
}

// this method is called when your extension is deactivated
export function deactivate()
{
}