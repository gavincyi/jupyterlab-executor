import { toArray } from '@phosphor/algorithm';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { IExecutor } from './command';

import { showExecutionDialog } from './executor';

function isExecutableScript(widget: any): boolean {
  return widget && toArray(widget.selectedItems()).length === 1;
}

const PLUGIN_ID = '@gavincyi/jupyterlab-executor:executor';

const COMMAND_ID = 'jupyterlab-executor:execute';

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
  var executors = [] as IExecutor[];

  Promise.all([settingRegistry.load(PLUGIN_ID), app.restored]).then(
    ([settings]) => {
       executors = settings.composite.executors as IExecutor[];
    }
  );

  app.commands.addCommand(COMMAND_ID, {
    execute: () => {
      const widget = tracker.currentWidget;
      if (!widget) {
        return;
      }

      // Show the execution dialog
      const path = widget.selectedItems().next().path;
      showExecutionDialog(app, path, executors);
    },
    isVisible: () => isExecutableScript(tracker.currentWidget),
    iconClass: 'jp-RunIcon',
    label: 'Execute'
  });

  app.contextMenu.addItem({
    command: COMMAND_ID,
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
