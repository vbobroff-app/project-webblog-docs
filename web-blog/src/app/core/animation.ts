import { trigger, state, style, transition, animate } from "@angular/animations";

const buttonStyle = {
  'display': 'inline-block',
  'padding': '0.4rem 1.3rem',
  'font': 'inherit',
  'font-size': '1rem',
  'font-family': 'inherit',
  'border': 'none',
  'border-radius': '0',
  'cursor': 'pointer',
  'margin-right': '0.5rem'
};

export const buttonState = trigger('buttonState', [
  state('false', style({
    ...buttonStyle,
    background: '#333333',
    color: '#fff'
  })),
  state('true', style({
    ...buttonStyle,
    background: '#efefef',
    color: '#4e4e4e',
    height: '36px',
    cursor: 'not-allowed'
  })),
  transition('0 <=> 1', animate('300ms ease'))
]);

export const buttonCancelState = trigger('buttonCancelState', [
  state('false', style({
    ...buttonStyle,
    background: '#efefef',
    color: 'black'
  })),
  state('true', style({
    ...buttonStyle,
    background: '#686868',
    color: '#4e4e4e',
    height: '36px',
    cursor: 'not-allowed'
  })),
  transition('0 <=> 1', animate('300ms ease'))
]);

export const flash = trigger('flash', [
  state('false', style({
    opacity: 0
  })),
  state('true', style({
    opacity: 1
  })),
  transition('0 <=> 1', animate('300ms ease'))
]);

export const fadeOut = trigger('fadeInOut', [
  state('void', style({
    opacity: 0
  })),
  transition('void <=> *', animate(200)),
]);

export const enterLeave = trigger('EnterLeave', [
  transition(':enter', [
    style({ transform: 'translateX(-50%)' }),
    animate('0.5s 300ms ease-in')
  ]),
  transition(':leave', [
    animate('0.3s ease-out', style({ transform: 'translateX(100%)' }))
  ])
]);