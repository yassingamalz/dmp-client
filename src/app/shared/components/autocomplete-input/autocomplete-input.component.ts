// src/app/shared/components/autocomplete-input/autocomplete-input.component.ts
import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AutocompleteSuggestion } from '../../../core/models/autocomplete-suggestion';

@Component({
  selector: 'app-autocomplete-input',
  templateUrl: './autocomplete-input.component.html',
  styleUrls: ['./autocomplete-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteInputComponent),
      multi: true
    }
  ]
})
export class AutocompleteInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() placeholder = '';
  @Input() suggestions: AutocompleteSuggestion[] = [];
  @Input() loading = false;
  @Input() actionIcon = '';
  @Input() actionTooltip = '';
  
  @Output() inputChange = new EventEmitter<string>();
  @Output() suggestionSelected = new EventEmitter<AutocompleteSuggestion>();
  @Output() actionClicked = new EventEmitter<void>();

  control = new FormControl('');
  showDropdown = false;
  private destroy$ = new Subject<void>();
  
  private onChange = (value: string) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        const stringValue = value || '';
        this.onChange(stringValue);
        this.inputChange.emit(stringValue);
        this.showDropdown = this.suggestions.length > 0 && stringValue.length > 0;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  writeValue(value: string): void {
    this.control.setValue(value || '', { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  onFocus(): void {
    this.onTouched();
    if (this.suggestions.length > 0) {
      this.showDropdown = true;
    }
  }

  onBlur(): void {
    // Delay hiding dropdown to allow click on suggestions
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  selectSuggestion(suggestion: AutocompleteSuggestion): void {
    this.control.setValue(suggestion.value);
    this.onChange(suggestion.value);
    this.suggestionSelected.emit(suggestion);
    this.showDropdown = false;
  }

  onActionClick(): void {
    this.actionClicked.emit();
  }

  updateSuggestions(suggestions: AutocompleteSuggestion[]): void {
    this.suggestions = suggestions;
    const currentValue = this.control.value || '';
    this.showDropdown = suggestions.length > 0 && currentValue.length > 0;
  }
}