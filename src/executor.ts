import {
    showDialog,
    Dialog,
    Clipboard,
    MainAreaWidget
  } from '@jupyterlab/apputils';
  
  import { JupyterFrontEnd } from '@jupyterlab/application';
  
  import { TerminalManager } from '@jupyterlab/services';
  
  import { Terminal } from '@jupyterlab/terminal';
  
  import { IExecutor, CommandWidget } from './command';
  
  /**
   * Show the execution dialog
   */
  export function showExecutionDialog(
    app: JupyterFrontEnd,
    path: string,
    options: IExecutor[]
  ) {
    const dialog = showDialog({
      title: 'Execute',
      buttons: [
        Dialog.cancelButton({ label: 'Cancel' }),
        Dialog.createButton({ label: 'Copy Command' }),
        Dialog.okButton({ label: 'Execute' })
      ],
      body: new CommandWidget(path, options)
    });
  
    dialog.then(async object => {
      if (object.button.accept) {
        if (object.button.label === 'Execute') {
          console.log('Execute the command');
  
          const manager = new TerminalManager();
          const s1 = await manager.startNew();
          const term1 = new Terminal(s1, {
            initialCommand: `${object.value}`
          });
          term1.title.closable = true;
  
          const widget = new MainAreaWidget({ content: term1 });
          widget.id = `jupyter-executor-${Date.now()}`;
          widget.title.label = 'Execute';
          widget.title.closable = true;
  
          if (!widget.isAttached) {
            // Attach the widget to the main work area if it's not there
            app.shell.add(widget, 'main');
          }
          // Activate the widget
          app.shell.activateById(widget.id);
        } else if (object.button.label === 'Copy Command') {
          Clipboard.copyToSystem(object.value!);
        } else {
          console.log(`${object.button.label}`);
        }
      } else {
        console.log('Canceled');
      }
    });
  
    return dialog;
  }