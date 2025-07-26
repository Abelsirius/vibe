import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private isLoading = new BehaviorSubject<boolean>(false);
  public loading$ = this.isLoading.asObservable();
  constructor() { }
   show() {
    this.isLoading.next(true);
  }

  hide() {
    this.isLoading.next(false);
  }
}
