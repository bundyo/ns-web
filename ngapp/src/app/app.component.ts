import { Component, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';

import { TestComponent } from './test/test.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ng-custom-elements';
  constructor(injector: Injector) {
    const TestElement = createCustomElement(TestComponent, { injector });
    customElements.define("ns-test", TestElement);
  }
}
