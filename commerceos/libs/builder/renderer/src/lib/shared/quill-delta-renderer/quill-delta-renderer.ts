import { Injectable } from '@angular/core';

import { pebLinkDatasetLink } from '@pe/builder-core';

@Injectable({ providedIn: 'root' })
export class PebQuillRenderer {

  render(value: { ops: any[] }, scale: number) {
    const parts = this.processOps(value.ops, scale);

    return parts.join('');
  }

  private processOps(ops: any[], scale: number): string[] {
    let chunks = [];
    const result = Object.values(ops).reduce((acc: string[], op) => {
      const { insert, attributes } = op;
      if (insert) {
        const tokens = this.tokenize(insert);
        tokens.forEach((token) => {
          if (token === '\n') {
            if (chunks.length) {
              acc.push(this.endLine(chunks.join(''), attributes));
              chunks = [];
            } else {
              acc.push(this.endLine('', attributes));
            }
          } else {
            chunks.push(this.chunk(token, attributes, scale));
          }
        });
      }

      return acc;
    }, []);

    /** In case Delta does not have trailing new line */
    if (chunks.length) {
      result.push(this.endLine(chunks.join('')));
    }

    return result;
  }

  private chunk(text, attributes = [], scale: number): string {
    const tags = [];
    const styles = [];
    Object.entries(attributes).forEach(([attr, value]) => {
      if (value) {
        switch (attr) {
          case 'italic':
            tags.push('em');
            break;
          case 'link':
            const { type, payload } = value;
            const dataset = Object.entries(payload || {}).reduce((acc, [key, v]) => {
              if (v) {
                return acc.concat(` data-${key}="${v}"`);
              }

              return acc;
            }, ``);
            tags.push(`a href="#" ${pebLinkDatasetLink.type}="${type}" ${dataset}`);
            break;
          case 'underline':
            tags.push('u');
            break;
          case 'strike':
            tags.push('s');
            break;
          case 'fontFamily':
            const fontFamily = /\s/.test(value) ? `'${value}'` : value;
            styles.push({ value: `${fontFamily}`, property: 'font-family' });
            break;
          case 'color':
            styles.push({ value, property: attr });
            break;
          case 'fontSize':
            styles.push({ value: `${value}px`, property: 'font-size' });
            break;
          case 'fontWeight':
            styles.push({ value, property: 'font-weight' });
            break;
        }
      }
    });

    /** Wrap content in a `span` element if there is some styles to apply but no tags */
    if (styles.length > 0 && tags.length === 0) {
      tags.push('span');
    }

    const opening = tags.reverse()
      .reduce((acc, tag, index) => {
        if (index === 0 && styles.length > 0) {
          const inlineStyles = styles.map(({ property, value }) => `${property}: ${value};`);
          acc.push(`<${tag} style="${inlineStyles.join(' ')}">`);
        } else {
          acc.push(`<${tag}>`);
        }

        return acc;
      }, []).join('');

    const closing = tags.map(tag => /href/.test(tag) ? '</a>' : `</${tag}>`).join('');

    return `${opening}${text}${closing}`;
  }

  private endLine(line: string, attributes = { align: 'left' }) {
    const { align } = attributes;
    let quillClass: string;
    switch (align) {
      case 'left':
        // don't apply any class
        break;
      case 'right':
        quillClass = 'ql-align-right';
        break;
      case 'center':
        quillClass = 'ql-align-center';
        break;
      case 'justify':
        quillClass = 'ql-align-justify';
        break;
    }

    if (quillClass) {
      return `<p class="${quillClass}">${line ? line : '<br/>'}</p>`;
    }

    return `<p>${line ? line : '<br/>'}</p>`;
  }

  /**
   *  Splits by new line character ("\n") by putting new line characters into the
   *  array as well. Ex: "hello\n\nworld\n " => ["hello", "\n", "\n", "world", "\n", " "]
   */
  private tokenize(str: string): string[] {
    const newLine = '\n';

    if (str === newLine) {
      return [str];
    }

    const lines = str.split(newLine);

    if (lines.length === 1) {
      return lines;
    }

    const lastIndex = lines.length - 1;

    return lines.reduce((acc: string[], line: string, index: number) => {
      if (line !== '') {
        acc.push(line);
      }

      if (index !== lastIndex) {
        acc.push(newLine);
      }

      return acc;
    }, []);
  }
}
