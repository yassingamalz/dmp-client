// src/app/shared/components/autocomplete-input/autocomplete-input.component.ts
import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AutocompleteSuggestion } from '../../../core/models/autocomplete-suggestion';

@Component({
  selector: 'app-autocomplete-input',
  standalone: false,
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
  @Input() loading = false;
  @Input() actionIcon = '';
  @Input() actionTooltip = '';

  @Output() inputChange = new EventEmitter<string>();
  @Output() suggestionSelected = new EventEmitter<AutocompleteSuggestion>();
  @Output() actionClicked = new EventEmitter<void>();

  private _suggestions: AutocompleteSuggestion[] = [];

  @Input()
  set suggestions(value: AutocompleteSuggestion[]) {
    this._suggestions = value;
    // Show dropdown only if user has focused and we're not currently selecting
    if (!this.isSelectingSuggestion && this.hasBeenFocused) {
      this.showDropdown = value.length > 0;
    }
  }

  get suggestions(): AutocompleteSuggestion[] {
    return this._suggestions;
  }

  control = new FormControl('');
  showDropdown = false;
  private destroy$ = new Subject<void>();
  private isSelectingSuggestion = false;
  private hasBeenFocused = false;

  private onChange = (value: string) => { };
  private onTouched = () => { };

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

        // Only emit inputChange if not selecting a suggestion
        if (!this.isSelectingSuggestion) {
          this.inputChange.emit(stringValue);
          // Don't hide dropdown here - let the parent component and suggestions setter handle it
        }
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
    this.hasBeenFocused = true;
    const currentValue = this.control.value || '';

    // If empty field, emit empty string to trigger "show all" functionality
    if (currentValue.length === 0) {
      this.inputChange.emit('');
    }

    // If we already have suggestions, show dropdown immediately
    if (this.suggestions.length > 0) {
      this.showDropdown = true;
    }
  }

  onBlur(): void {
    // Delay hiding dropdown to allow click on suggestions
    setTimeout(() => {
      if (!this.isSelectingSuggestion) {
        this.showDropdown = false;
        this.hasBeenFocused = false; // Reset focus state
      }
    }, 200);
  }

  selectSuggestion(suggestion: AutocompleteSuggestion): void {
    this.isSelectingSuggestion = true;
    this.showDropdown = false;
    this.hasBeenFocused = false; // Reset focus state
    this.control.setValue(suggestion.value);
    this.onChange(suggestion.value);
    this.suggestionSelected.emit(suggestion);

    // Reset the flag after a longer delay to prevent parent updates from showing dropdown
    setTimeout(() => {
      this.isSelectingSuggestion = false;
    }, 500);
  }

  onActionClick(): void {
    this.actionClicked.emit();
  }
}
