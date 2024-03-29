import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { SharedDataService } from 'src/providers/shared-data/shared-data.service';
import { ConfigService } from 'src/providers/config/config.service';

@Component({
  selector: 'app-categories4',
  templateUrl: './categories4.page.html',
  styleUrls: ['./categories4.page.scss'],
})
export class Categories4Page implements OnInit {

  categories = [];
  parent: { [k: string]: any } = {};
  constructor(
    public shared: SharedDataService,
    public config: ConfigService,
    public router: Router,
    private ga: GoogleAnalytics,
    private activatedRoute: ActivatedRoute) {

    this.parent.id = this.activatedRoute.snapshot.paramMap.get('parent');
    this.parent.name = this.activatedRoute.snapshot.paramMap.get('name');

    if (this.parent.id == undefined) this.parent.id = 0;
    if (this.parent.name == undefined) this.parent.name = 0;
    if (this.parent.name == 0) this.parent.name = "Categories";
    this.ga.startTrackerWithId('UA-164323626-1')
   .then(() => {
     console.log('Google analytics is ready now');
      this.ga.trackView('227810086');
     // Tracker is ready
     // You can now track pages or set additional information such as AppVersion or UserId
   })
   .catch(e => console.log('Error starting GoogleAnalytics', e));
  }
  getCategories() {
    let cat = [];
    for (let value of this.shared.allCategories) {
      if (value.parent_id == this.parent.id) { cat.push(value); }
    }
    return cat;
  }
  openSubCategories(parent) {
    let count = 0;
    for (let value of this.shared.allCategories) {
      if (parent.id == value.parent_id) count++;
    }
    if (count != 0)
      this.router.navigateByUrl(this.config.currentRoute + "/categories4/" + parent.id + "/" + parent.name);
    else
      this.router.navigateByUrl(this.config.currentRoute + "/products/" + parent.id + "/" + parent.name + "/newest");
  }
  viewAll() {
    this.router.navigateByUrl(this.config.currentRoute + "/products/" + this.parent.id + "/" + this.parent.name + "/newest");
  }
  ngOnInit() {
  }
}

