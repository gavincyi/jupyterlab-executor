import { ReactWidget, UseSignal } from '@jupyterlab/apputils';

import { Signal } from '@lumino/signaling';

import { PartialJSONObject } from '@lumino/coreutils';

import * as React from 'react';
import { style } from 'typestyle';

export interface IExecutor extends PartialJSONObject {
  /**
   * Executor
   */

  // Command in the format of {path} and {args}
  command: string;

  // Name displayed in the widget
  name: string;
}

const wrapperClass = style({
  marginTop: '6px',
  marginBottom: '0',

  borderBottom: 'var(--jp-border-width) solid var(--jp-border-color2)'
});

const filterInputClass = style({
  boxSizing: 'border-box',

  width: '100%',
  height: '2em',

  /* top | right | bottom | left */
  padding: '1px 18px 2px 7px',

  color: 'var(--jp-ui-font-color1)',
  fontSize: 'var(--jp-ui-font-size1)',
  fontWeight: 300,

  backgroundColor: 'var(--jp-layout-color1)',

  border: 'var(--jp-border-width) solid var(--jp-border-color2)',
  borderRadius: '3px',

  $nest: {
    '&:active': {
      border: 'var(--jp-border-width) solid var(--jp-brand-color1)'
    },
    '&:focus': {
      border: 'var(--jp-border-width) solid var(--jp-brand-color1)'
    }
  }
});

export class CommandWidget extends ReactWidget {
  constructor(path: string, options: IExecutor[]) {
    super();
    this._path = path;
    this._options = options;
    this._selectedExecutor = options[0].command;
  }

  getValue(): string {
    const command = this._selectedExecutor
      .replace('{path}', this._path)
      .replace('{args}', this._arguments);

    if (this._environVariables.length === 0) {
      return command;
    }

    return `${this._environVariables} ${command}`;
  }

  protected render(): React.ReactElement<any> {
    return (
      <div className={wrapperClass}>
        <label htmlFor="executor">Executor</label>
        <select
          id="executor"
          className={filterInputClass}
          onChange={e => {
            this._selectedExecutor = e.target.value;
            this._signal.emit();
          }}
        >
          {this._options.map((executor: any) => (
            <option value={executor.command}>{executor.name}</option>
          ))}
        </select>
        <label>
          Path
          <input
            type="text"
            id="path"
            className={filterInputClass}
            value={this._path}
            disabled
          />
        </label>
        <label>
          Arugments
          <input
            type="text"
            id="arguments"
            className={filterInputClass}
            onChange={e => {
              this._arguments = e.target.value;
              this._signal.emit();
            }}
          />
        </label>
        <label>
          Environment variables
          <input
            type="text"
            id="environVariables"
            className={filterInputClass}
            onChange={e => {
              this._environVariables = e.target.value;
              this._signal.emit();
            }}
          />
        </label>
        <label>
          Command
          <UseSignal signal={this._signal}>
            {(): JSX.Element => (
              <input
                type="text"
                className={filterInputClass}
                value={this.getValue()}
                disabled
              />
            )}
          </UseSignal>
        </label>
      </div>
    );
  }

  private _path = '';
  private _selectedExecutor = '';
  private _arguments = '';
  private _environVariables = '';
  private _options = [] as IExecutor[];
  private _signal = new Signal<this, void>(this);
}