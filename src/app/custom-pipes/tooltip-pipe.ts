import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tooltip',
})
export class TooltipPipe implements PipeTransform {
  transform(value: string, maxLength: number = 20): string {
    if (!value) return '';

    if (value.length > maxLength) {
      return value.substring(0, maxLength) + '...';
    }

    return value;
  }
}
