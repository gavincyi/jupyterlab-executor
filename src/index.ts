import { toArray } from '@phosphor/algorithm';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  Clipboard, showDialog, Dialog
} from '@jupyterlab/apputils';

import {
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';

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

      result.then(object => {
        if (object.button.accept) {
          if (object.button.label === 'Execute') {
            console.log('Execute the command');
            // return app.commands.execute('terminal:open', {
            //   // initialCommand: `${object.value}\r\n${object.value}`
            //   initialCommand: 'bash -c "touch abc.txt"'
            // });
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
