// src/app/shared/components/modal/modal.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalService, ModalConfig } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: false,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  isOpen$: Observable<boolean>;
  config$: Observable<ModalConfig | null>;

  constructor(private modalService: ModalService) {
    this.isOpen$ = this.modalService.isOpen$;
    this.config$ = this.modalService.config$;
  }

  ngOnInit(): void {}

  closeModal(): void {
    this.modalService.closeModal();
  }

  confirm(): void {
    this.modalService.confirm();
  }

  cancel(): void {
    this.modalService.cancel();
  }
}
