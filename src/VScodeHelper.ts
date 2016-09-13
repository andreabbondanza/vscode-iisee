"use strict";

import * as vscode from "vscode";


export class VsCodeHelper
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
