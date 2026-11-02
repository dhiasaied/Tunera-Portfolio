import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { SECTIONS } from '../core/data/profile.data';
import { UiService } from '../core/services/ui.service';
import { AboutComponent } from '../sections/about.component';
import { ActivityComponent } from '../sections/activity.component';
import { CertificationsComponent } from '../sections/certifications.component';
import { ContactComponent } from '../sections/contact.component';
import { EducationComponent } from '../sections/education.component';
import { ExperienceComponent } from '../sections/experience.component';
import { FeaturedComponent } from '../sections/featured.component';
import { GarageComponent } from '../sections/garage.component';
import { HeroComponent } from '../sections/hero.component';
import { LanguagesComponent } from '../sections/languages.component';
import { NabeulComponent } from '../sections/nabeul.component';
import { ServicesComponent } from '../sections/services.component';
import { SkillsComponent } from '../sections/skills.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    HeroComponent, AboutComponent, NabeulComponent, ServicesComponent, FeaturedComponent, ActivityComponent, ExperienceComponent,
    EducationComponent, CertificationsComponent, SkillsComponent, LanguagesComponent, GarageComponent, ContactComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero />
    <app-about />
    <app-nabeul />
    <app-services />
    <app-featured />
    <app-activity />
    <app-experience />
    <app-education />
    <app-certifications />
    <app-skills />
    <app-languages />
    <app-garage />
    <app-contact />
  `,
})
export class HomePage implements AfterViewInit, OnDestroy {
  private readonly ui = inject(UiService);
  private stop: () => void = () => {};

  ngAfterViewInit(): void {
    this.stop = this.ui.watchSections(SECTIONS.map((s) => s.id));
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
