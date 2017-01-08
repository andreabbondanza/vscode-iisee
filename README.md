# IIS Express Executer 

With this extension you can run your website in IIS directly from Visual studio Code.
This extension works with the default iis express __applicationhost.config__ file (documents/iis express/config/applicationhost.config).
This is cool because when you install php or other stuff, the edited config file is updated and all the features will work with the execution from vscode.

##WARNING

The workspace root name is used like site name (unique) in the file.
If you use another project with the same name, the new project settings will overwrite the old project settings.

## How to use

### Check compatibility
Just press F1 to open prompt and select IIS-EE: Check option

### Set Port or iis custom installation folder
- Port: the port where server will listen
- IIS installation path: If you have installed IIS Express in a custom folder you can set here the path

Just press F1 to open prompt and select the appropriate IIS-EE: "Set" option

### Set Browser or architecture
You can select the opening browser
- MSEdge
- Opera
- Firefox
- Vivaldi Browser
- Chrome

and the architecture (if you have IIS Express installed in "Program Files(x86)" select the x86 option)
- x86
- x64

Just press __F1__ to open prompt and select the appropriate IIS-EE: "Set" option

### Set protocol for https support
You can set the protocol
- http
- https

Just press __F1__ to open prompt and select the appropriate IIS-EE: "Set" option

### Set server running folder
Just select which folder is the root path for server execution.
You can set it from workspace (just press right __mouse__ button and "Set" Running Folder option)
Or if you want, just press F1 to open prompt and select the appropriate IIS-EE: "Set" option

__NOTE:__ To select root workspace folder with mouse, just click on empty space in the panel and select the menu voice.

### Start server
You can start server from prompt (F1 with IIS-EE: "Start server" option) and it will be executed from the root path folder (from settings)
or you can start server by right __mouse__ click and select the "Start server" voice.
In this case, the path for the execution will be the folder where you've clicked.

### Start server from script
You can start the server and the current opened script directly by the (F1 with IIS-EE: "Start ISS Express server from current file") command.

__NOTE:__ This will __NOT__ override the running folder in the settings.

### Stop server
You can stop the server by typing IIS-EE: "Stop" option or clicking on the server (orange) url in the status bar  

## Features

- Check if your environment is compatible
- Set a custom path for iis installation
- Set a custom path for iis execution (you can also set it directly from workspace with mouse context menu)
- Execute the server directly in a folder from mouse context menu
- Reset default settings if you need
- Select the browser you want to open (MSEdge, Opera, Firefox, Chrome)
- Set the port

## Requirements

- Windows OS
- IIS Express

## Known Issues

*Nothing for now

## Release Notes

### 1.2.1

Added support to __Vivaldi__ Browser

### 1.1.8

Fixed a problem about the current file execution

### 1.1.7

Fixed the bug for dotted folders

### 1.1.5

Now you can start a script with a direct command

### 1.1.4

Added protocol setting for https support

### 1.1.1

Now the extension works with iis express default applicationhost.config file, so if you install php or other stuff for iis express, you can use them directly from vscode.
In other words, now the extension is compatible with __PHP__ and other stuff for iis.

### 1.0.0

First release

-----------------------------------------------------------------------------------------------------------

##Note

This is my first release and my first extension, please for every problem mail me to: andreabbondanza.developer@outlook.com

[Andrea Vincenzo Abbondanza](http://www.andrewdev.eu)