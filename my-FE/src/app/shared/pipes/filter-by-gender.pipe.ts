import { Pipe, PipeTransform } from '@angular/core';

interface CategoryWithGender {
  id?: number;
  name?: string;
  gender?: string;
  children?: any[];
}

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterByGenderPipe implements PipeTransform {
  transform(categories: CategoryWithGender[], gender: string): CategoryWithGender[] {
    if (!categories || !gender) {
      return categories;
    }
    return categories.filter(cat => cat.gender === gender);
  }
}
