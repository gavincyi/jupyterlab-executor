import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { buildIcon } from '@jupyterlab/ui-components';

import { IExecutor } from './command';

import { showExecutionDialog } from './executor';

const PLUGIN_ID = '@gavincyi/jupyterlab-executor:executor';

const COMMAND_ID = 'gavincyi/jupyterlab-executor:execute';

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
  let executors = [] as IExecutor[];

  const updateSettings = (settings: ISettingRegistry.ISettings): void => {
    executors = settings.composite.executors as IExecutor[];
  };

  Promise.all([settingRegistry.load(PLUGIN_ID), app.restored]).then(
    ([settings]) => {
      updateSettings(settings);
      settings.changed.connect(updateSettings);
    }
  );

  app.commands.addCommand(COMMAND_ID, {
    label: 'Execute',
    caption: "Execute script",
    icon: buildIcon,
    execute: () => {
      const widget = tracker.currentWidget;
      if (!widget) {
        return;
      }

      // Show the execution dialog
      const path = widget.selectedItems().next()!.value.path;
      showExecutionDialog(app, path, executors);
    },
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