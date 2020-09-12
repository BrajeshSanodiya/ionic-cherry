import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Home11Page } from './home11.page';

describe('Home11page', () => {
  let component: Home11Page;
  let fixture: ComponentFixture<Home2Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Home11Page ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Home2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
