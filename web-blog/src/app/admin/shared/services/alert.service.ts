import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

export type AlertType = 'success' | 'danger' | 'warning';

export interface Alert {
    type: AlertType,
    text: string,
    boldMark?: string
}

@Injectable({ providedIn: 'root' })
export class AlertService {

    public alert$ = new BehaviorSubject<Alert>({ type: 'success', text: 'text', boldMark: 'boldMark' });

    success(text: string, boldMark?: string) {
        this.alert$.next({ type: 'success', text: text, boldMark: boldMark });
    }
    danger(text: string, boldMark?: string) {
        this.alert$.next({ type: 'success', text: text, boldMark: boldMark });
    }
    warning(text: string, boldMark?: string) {
        this.alert$.next({ type: 'success', text: text, boldMark: boldMark });
    }

}