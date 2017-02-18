"use strict";

import * as vscode from "vscode";


export class VsCodeHelper
{
    static StatusBar = null;
    static OutputChannel : vscode.OutputChannel = null;
    /**Return the output channel instance */
    static GetOutputChannel(): vscode.OutputChannel
    {
        return VsCodeHelper.OutputChannel == null ? VsCodeHelper.OutputChannel = vscode.window.createOutputChannel("IIS-Express executer") : VsCodeHelper.OutputChannel;
    }
    /**Return the status bar instance */
    static GetStatusBarItem(): vscode.StatusBarItem
    {
        return VsCodeHelper.StatusBar != null ? VsCodeHelper.StatusBar : VsCodeHelper.StatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    }
    /**reset the output channel */
    static ResetOutputChannel(): void
    {
        VsCodeHelper.OutputChannel.clear();
        VsCodeHelper.OutputChannel.hide();
        VsCodeHelper.OutputChannel = null;
    }
    /**reset the status bar */
    static ResetStatusBarItem(): void
    {
        VsCodeHelper.StatusBar.hide();
        VsCodeHelper.StatusBar.dispose();
        VsCodeHelper.StatusBar = null;
    }
}
