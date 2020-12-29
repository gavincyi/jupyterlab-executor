import { Widget } from '@lumino/widgets';

function createOption(text: string, value: string): HTMLElement {
  const option = document.createElement('option');
  option.text = text;
  option.value = value;
  return option;
}

function createDialogBody(): HTMLElement {
  const body = document.createElement('div');

  // Add executor selector
  const executorLabel = document.createElement('label');
  executorLabel.textContent = 'Executor';
  body.appendChild(executorLabel);
  const selector = document.createElement('select');
  selector.appendChild(createOption('bash', 'bash '));
  selector.appendChild(createOption('python', 'python '));
  selector.appendChild(createOption('cat', 'cat '));
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
  constructor(path: string) {
    super({ node: createDialogBody() });
    this._path = path;
  }

  getValue(): string {
    const executor = this.node.querySelector('select') as HTMLSelectElement;
    const args = this.node.querySelector('input') as HTMLInputElement;
    return `${executor.value}${this._path} ${args.value}`;
  }

  private _path = '';
}
