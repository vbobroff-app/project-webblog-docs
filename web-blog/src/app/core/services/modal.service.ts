import { Injectable, Type, ComponentFactoryResolver } from "@angular/core";
import { RefDirective } from 'src/app/admin/ref.directive';
import { Modal } from '../interfaces/modal.interface';

@Injectable({ providedIn: 'root' })
export class ModalService<T> {

    public opened = new Map<any, Modal<T>>();
    constructor( private resolver: ComponentFactoryResolver) { }

    createModal<N extends Modal<T>>(component: Type<N>, refDirective: RefDirective, id: any): N {
        const modalFactory = this.resolver.resolveComponentFactory(component);
        refDirective.containerRef.clear();
        const factory = refDirective.containerRef.createComponent(modalFactory);
        const modalComponent = factory.instance;
        modalComponent.id = id;
        modalComponent.viewRef = refDirective.containerRef;
        this.opened.set(id,modalComponent)
        modalComponent.close.subscribe(() => {
          refDirective.containerRef.clear();
          this.opened.delete(id);
        });
        return modalComponent;
      }

    close(id?: any, name?:any){
        if(id){
             const modal = this.opened.get(id);
             if(modal){
                modal.viewRef.clear();
                this.opened.delete(id);
             }
             return;
        }
        if(name){
            const modal = [...this.opened.values()].find(m=>m.name == name);
             if(modal){
                modal.viewRef.clear();
                this.opened.delete(modal.id);
             }
             return;
        }
        [...this.opened.values()].forEach(modal => {
            modal.viewRef.clear();
        });
        this.opened.clear();    
    }

    closeAll(){
        this.close();
    }

}