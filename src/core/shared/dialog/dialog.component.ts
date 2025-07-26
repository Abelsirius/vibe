import { Component, Inject, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
  selector: 'app-dialog',
  imports: [
    MatIconModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
	private dialogRef = inject(MatDialogRef<DialogComponent>);
	private sanitizer = inject(DomSanitizer);
	constructor(
		@Inject(MAT_DIALOG_DATA)
		public data: {Num_Config: number; Mensaje: string; ArrayData: any}
	) {

		
	}

	ngOnInit(): void {
		if (this.data.Num_Config == 3) {
			console.log('D- mensaje  =>', this.data.Mensaje);
		}
	}
	OnClickNO(): void {
		this.dialogRef.close();
	}
  	transformYourHtml(htmlTextWithStyle: string): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(htmlTextWithStyle);
	}
}
