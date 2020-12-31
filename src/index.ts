import { toArray } from '@phosphor/algorithm';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { ExecutorOptions, showExecutionDialog } from './dialog';

function isExecutableScript(widget: any): boolean {
  return widget && toArray(widget.selectedItems()).length === 1;
}

const PLUGIN_ID = 'jupyterlab-executor:executor';

/**
 * Activate the jupyterlab-executor
 */
function activate(
  app: JupyterFrontEnd,
  factory: IFileBrowserFactory,
  settingRegistry: ISettingRegistry
) {
  console.log('JupyterLab extension jupyterlab-executor is activated!');
  const { tracker } = factory;
  const executorOptions = new ExecutorOptions();

  Promise.all([settingRegistry.load(PLUGIN_ID), app.restored]).then(
    ([settings]) => {
      executorOptions.executors = settings.get('executors').composite;
    }
  );

  app.commands.addCommand('jupyterlab-executor:executable', {
    execute: () => {
      const widget = tracker.currentWidget;
      if (!widget) {
        return;
      }

      // Show the execution dialog
      const path = widget.selectedItems().next().path;
      showExecutionDialog(app, path, executorOptions);
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
  id: PLUGIN_ID,
  autoStart: true,
  requires: [IFileBrowserFactory, ISettingRegistry],
  activate: activate
};

export default extension;
