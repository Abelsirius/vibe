import { HttpClient  } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {from, Observable} from 'rxjs';
import { DialogComponent } from './shared/dialog/dialog.component';

@Injectable({
	providedIn: 'root',
})

export class SharedCoreService {
    constructor(private _dialog: MatDialog) {}
	/**
	 * Mensaje Modal sharedCore
	 * @param {number}Num_Config - Numero de Switch
	 * @param {string}Mensaje  - Mensaje en string o formato html
	 * @param {Array}[ArrayData] - Contenido de array
	 */
	openDialog(Num_Config: number, Mensaje = '', ArrayData = []): Observable<any> {
		const dialogRef = this._dialog.open(DialogComponent, {
			data: {Num_Config, Mensaje, ArrayData},
			panelClass: 'custom-modalbox',
			autoFocus: false,
		});
		return from(dialogRef.afterClosed());
	}

}