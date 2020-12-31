import { toArray } from '@phosphor/algorithm';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { showExecutionDialog } from './dialog';

function isExecutableScript(widget: any): boolean {
  return widget && toArray(widget.selectedItems()).length === 1;
}

/**
 * Activate the jupyterlab-executor
 */
function activate(app: JupyterFrontEnd, factory: IFileBrowserFactory) {
  console.log('JupyterLab extension jupyterlab-executor is activated!');
  const { tracker } = factory;

  app.commands.addCommand('jupyterlab-executor:executable', {
    execute: () => {
      const widget = tracker.currentWidget;
      if (!widget) {
        return;
      }

      // Show the execution dialog
      const path = widget.selectedItems().next().path;
      showExecutionDialog(app, path);
    },
    isVisible: () => isExecutableScript(tracker.currentWidget),
    iconClass: 'jp-RunIcon',
    label: 'Execute'
  });

  app.contextMenu.addItem({
    command: 'jupyterlab-executor:executable',
    selector: '.jp-DirListing-item'
  });
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
