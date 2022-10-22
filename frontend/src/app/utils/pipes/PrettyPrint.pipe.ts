import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prettyprint'
})
export class PrettyPrintPipe implements PipeTransform {
  transform(val: any) {
    return JSON.stringify(val, null, 2)
      .replace('{', '')
      .replace(',', '\t')
      // .replace(' ', '&nbsp;')
      // .replace('\n', '<br/>')
      .replace('}', '');
  }

}
