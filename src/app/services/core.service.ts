import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  constructor(private _snackBar: MatSnackBar) {}
  openSnackBar(message: string, action: string = 'Ok', type: 'success' | 'error' = 'success') {
    this._snackBar.open(message, action, {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'right', // ✅ TOP RIGHT
      panelClass: type === 'success' ? ['snack-success'] : ['snack-error'],
    });
  }
}
