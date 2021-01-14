import { Widget } from '@lumino/widgets';

import {
  showDialog,
  Dialog,
  Clipboard,
  MainAreaWidget
} from '@jupyterlab/apputils';

import { JupyterFrontEnd } from '@jupyterlab/application';

import { TerminalManager } from '@jupyterlab/services';

import { Terminal } from '@jupyterlab/terminal';

/**
 * Executor options
 */
export class ExecutorOptions {
  /**
   * List of executors
   */
  executors: any;
}

function createDialogBody(options: ExecutorOptions, path: string): HTMLElement {
  const body = document.createElement('div');

  // Add executor selector
  var label = document.createElement('label');
  label.textContent = 'Executor';
  body.appendChild(label);
  const selector = document.createElement('select');
  for (const executor of options.executors) {
    const option = document.createElement('option');
    option.text = executor['name'];
    option.value = executor['command'];
    selector.appendChild(option);
  }
  body.appendChild(selector);

  // Add path (disabled)
  label = document.createElement('label');
  label.textContent = 'Path';
  body.appendChild(label);
  var textbox = document.createElement('input');
  textbox.className = 'path';
  textbox.type = 'text';
  textbox.value = path;
  textbox.disabled = true;
  body.appendChild(textbox);

  // Add execute arguments
  label = document.createElement('label');
  label.textContent = 'Arugments';
  body.appendChild(label);
  var textbox = document.createElement('input');
  textbox.className = 'arguments';
  textbox.type = 'text';
  textbox.value = '';
  body.appendChild(textbox);

  // Add environment variable
  label = document.createElement('label');
  label.textContent = 'Environment variables';
  body.appendChild(label);
  textbox = document.createElement('input');
  textbox.className = 'envs';
  textbox.type = 'text';
  textbox.value = '';
  body.appendChild(textbox);

  return body;
}

/**
 * A widget to return the execution command
 */
export class ExecutionWidget extends Widget {
  /**
   * Create a new kernel selector widget.
   */
  constructor(path: string, options: ExecutorOptions) {
    super({ node: createDialogBody(options, path) });
    this._path = path;
  }

  getValue(): string {
    const executor = this.node.querySelector('select') as HTMLSelectElement;
    const args = this.node.querySelector('.arguments') as HTMLInputElement;
    const envs = this.node.querySelector('.envs') as HTMLInputElement;
    var value = executor.value;
    if (!!envs.value) {
      value = `${envs.value} ${value}`;
    }
    return (
      value
      .replace('{path}', this._path)
      .replace('{args}', args.value)
    );
  }

  private _path = '';
}

/**
 * Show the execution dialog
 */
export function showExecutionDialog(
  app: JupyterFrontEnd,
  path: string,
  options: ExecutorOptions
) {
  const dialog = showDialog({
    title: 'Execute',
    buttons: [
      Dialog.createButton({ label: 'Execute' }),
      Dialog.okButton({ label: 'Copy Command' }),
      Dialog.cancelButton({ label: 'Cancel' })
    ],
    body: new ExecutionWidget(path, options)
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
        widget.id = 'jupyter-executor';
        widget.title.label = 'Execute';
        widget.title.closable = true;

        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widget, 'main');
        }
        // Activate the widget
        app.shell.activateById(widget.id);
      } else if (object.button.label === 'Copy Command') {
        Clipboard.copyToSystem(object.value);
      } else {
        console.log(`${object.button.label}`);
      }
    } else {
      console.log('Canceled');
    }
  });

  return dialog;
}
