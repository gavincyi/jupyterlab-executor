import {
  Widget
} from '@lumino/widgets';

function createOption(text: string, value: string) {
  const option = document.createElement('option');
  option.text = text;
  option.value = value;
  return option;
}

function createDialogBody() {
  const body = document.createElement('div');

  // Add executor selector
  const executor_label = document.createElement('label');
  executor_label.textContent = 'Executor';
  body.appendChild(executor_label);
  const selector = document.createElement('select');
  selector.appendChild(createOption('bash', 'bash '));
  selector.appendChild(createOption('python', 'python '));
  selector.appendChild(createOption('cat', 'cat '));
  body.appendChild(selector);

  // Add execute arguments
  const arguments_label = document.createElement('label');
  arguments_label.textContent = 'Arugments';
  body.appendChild(arguments_label);
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
  constructor(path: string) {
    super({ node: createDialogBody() });
    this._path = path;
  }

  getValue() {
    const executor = this.node.querySelector('select') as HTMLSelectElement;
    const args = this.node.querySelector('input') as HTMLInputElement;
    return `${executor.value}${this._path} ${args.value}`;
  }

  private _path = '';
}
