import { toArray } from '@phosphor/algorithm';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  Clipboard, showDialog, Dialog, MainAreaWidget
} from '@jupyterlab/apputils';

import {
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';

import { TerminalManager } from '@jupyterlab/services';

import { Terminal } from '@jupyterlab/terminal';

import { ExecutionWidget } from './executor';

function isExecutableScript (widget : any) {
  return (
    widget &&
    toArray(widget.selectedItems()).length === 1
  )
}

/**
* Activate the jupyterlab-executor
*/
function activate(
  app: JupyterFrontEnd, 
  factory: IFileBrowserFactory
) {
  console.log('JupyterLab extension jupyterlab-executor is activated!');
  const { tracker } = factory;

  app.commands.addCommand('jupyterlab-executor:executable', {
    execute: () => {
      const widget = tracker.currentWidget;
      if (!widget) {
        return;
      }
      const path = widget.selectedItems().next().path;
      const result = showDialog({
          title: "Execute",
          buttons: [
            Dialog.createButton({ label:'Execute' }),
            Dialog.okButton({ label: 'Copy Command' }),
            Dialog.cancelButton({ label: 'Cancel' })
          ],
          body: new ExecutionWidget(path)
      });

      result.then(async object => {
        if (object.button.accept) {
          if (object.button.label === 'Execute') {
            console.log('Execute the command');

            const manager = new TerminalManager();
            const s1 = await manager.startNew();
            const term1 = new Terminal(s1, { 
              theme: 'light',
              initialCommand: `${object.value}`
            });
            term1.title.closable = true;

            const widget = new MainAreaWidget({ content: term1 });
            widget.id = 'jupyter-executor';
            widget.title.label = 'Execute';
            widget.title.closable = true;

            if (!widget.isAttached) {
              // Attach the widget to the main work area if it's not there
              app.shell.add(widget, 'main');
            }
            // Activate the widget
            app.shell.activateById(widget.id);
          }
          else if (object.button.label == 'Copy Command') {
            Clipboard.copyToSystem(object.value);
          }
          else {
            console.log(`${object.button.label}`);
          }
        }
        else {
          console.log('Canceled');
        }
      });
    },
    isVisible: () => isExecutableScript(tracker.currentWidget),
    iconClass: 'jp-RunIcon',
    label: 'Execute'
  });

  app.contextMenu.addItem({
    command: 'jupyterlab-executor:executable',
    selector: '.jp-DirListing-item'
  })
}

/**
 * Initialization data for the jupyterlab-executor extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-executor',
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: activate
};

export default extension;
