import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jupyterlab_executor extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_executor:plugin',
  description: 'JupyterLab extension of executing the scripts',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab_executor is activated!');
  }
};

export default plugin;
