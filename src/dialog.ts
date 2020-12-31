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

function createOption(text: string, value: string): HTMLElement {
  const option = document.createElement('option');
  option.text = text;
  option.value = value;
  return option;
}

export class ExecutorOptions {
  constructor() {}
  executors: any;
}

function createDialogBody(options: ExecutorOptions): HTMLElement {
  const body = document.createElement('div');

  // Add executor selector
  const executorLabel = document.createElement('label');
  executorLabel.textContent = 'Executor';
  body.appendChild(executorLabel);
  const selector = document.createElement('select');
  for (var executor of options.executors) {
    const option = document.createElement('option');
    option.text = executor['name'];
    option.value = executor['command'];
    selector.appendChild(option);
  }
  body.appendChild(selector);

  // Add execute arguments
  const arugmentsLabel = document.createElement('label');
  arugmentsLabel.textContent = 'Arugments';
  body.appendChild(arugmentsLabel);
  const textbox = document.createElement('input');
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
    super({ node: createDialogBody(options) });
    this._path = path;
  }

  getValue(): string {
    const executor = this.node.querySelector('select') as HTMLSelectElement;
    const args = this.node.querySelector('input') as HTMLInputElement;
    return `${executor.value}${this._path} ${args.value}`;
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
