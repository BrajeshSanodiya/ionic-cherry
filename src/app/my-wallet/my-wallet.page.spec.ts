import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyWalletPage } from './my-wallet.page';

describe('MyWalletPage', () => {
  let component: MyWalletPage;
  let fixture: ComponentFixture<MyWalletPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyWalletPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyWalletPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
