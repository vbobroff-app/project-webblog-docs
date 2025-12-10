import { Directive, forwardRef, Input, OnInit, SimpleChanges } from '@angular/core';
import { NG_VALIDATORS, FormControl } from '@angular/forms';

@Directive({
  selector: '[containsInList][ngModel],[containsInList][formControl]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => ContainsInListValidator), multi: true }
  ]
})
export class ContainsInListValidator implements OnInit {
  private formControl: FormControl;

  @Input() distinct: string[];
  @Input() base?: string[];
  @Input() exclude?: any;
  validator: Function;

  constructor() { }

  ngOnInit(): void {
    this.validator = validateFactory(this.distinct, this.base, this.exclude);
  }

  validate(formControl: FormControl) {
    if (!this.formControl) {
      this.formControl = formControl;
    }
    return this.validator(formControl);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('distinct' in changes || 'base' in changes || 'exclude' in changes) {
      this.validator = validateFactory(this.distinct, this.base, this.exclude);
    }
  }
}

function validateFactory(distinct: string[], base?: string[], exclude?) {
  return (formControl: FormControl) => {
    if (!formControl.value || !distinct) {
      return null;
    }
    const value: string = typeof formControl.value === 'string' ? formControl.value : formControl.value.name;
    let isValid = !distinct.find(v=> v.toLowerCase() == value.toLowerCase());
    if (exclude) {
      const exc: string = typeof exclude === 'string' ? exclude : exclude.name;
      if (exc && !isValid && value == exc) {
        isValid = true;
      }
    }
    if (base) {
      if(base.find(v=> v.toLowerCase() == value.toLowerCase())) {
        isValid =false;
          return { isInBase: true }
      };
    }
    return isValid ? null : { notUnique: true };
  };
}