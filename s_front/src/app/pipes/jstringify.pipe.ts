import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jStringify'
})
export class JStringifyPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return JSON.stringify(value);
  }

}
