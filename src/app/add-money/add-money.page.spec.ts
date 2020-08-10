import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMoneyPage } from './add-money.page';

describe('AddMoneyPage', () => {
  let component: AddMoneyPage;
  let fixture: ComponentFixture<AddMoneyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMoneyPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMoneyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
