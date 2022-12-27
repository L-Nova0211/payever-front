// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
//
// @Injectable({ providedIn: 'root' })
// export class PebClientTerminalService {
//   private pathSubject$ = new BehaviorSubject(null);
//   private terminalSubject$ = new BehaviorSubject(null);
//   private themeSubject$ = new BehaviorSubject(null);
//   private merchantModeSubject$ = new BehaviorSubject(false);
//
//   terminal$ = this.terminalSubject$.asObservable();
//   theme$ = this.themeSubject$.asObservable();
//
//   set terminal(terminal: any) {
//     this.terminalSubject$.next(terminal);
//   }
//
//   get terminal() {
//     return this.terminalSubject$.value;
//   }
//
//   set path(path: string) {
//     this.pathSubject$.next(path);
//   }
//
//   get path() {
//     return this.pathSubject$.value ?? '/';
//   }
//
//   set theme(theme: any) {
//     this.themeSubject$.next(theme);
//   }
//
//   get theme() {
//     return this.themeSubject$.value;
//   }
//
//   set merchantMode(merchantMode: boolean) {
//     this.merchantModeSubject$.next(merchantMode);
//   }
//
//   get merchantMode() {
//     return this.merchantModeSubject$.value;
//   }
// }
