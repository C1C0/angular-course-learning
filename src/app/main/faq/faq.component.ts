import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from 'src/app/shared/local-storage.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit, OnDestroy {
  @Output() faqLoaded = new EventEmitter<boolean>();
  faqs;

  constructor(private http: HttpClient, private lss: LocalStorageService) {}

  ngOnInit(): void {
    this.faqLoaded.emit(true);
    this.getFaqs();
  }

  ngOnDestroy(): void {
    this.faqLoaded.emit(false);
  }

  //to avoid a lot of requests from client
  getFaqs() {
    let faqsInLs = this.lss.getLS('faqs');
    if (faqsInLs) {
      this.faqs = faqsInLs;
    } else {
      this.http.get(environment.fetchUrl + 'faq').subscribe((faqs) => {
        this.lss.setToLS('faqs', faqs);
        this.faqs = faqs;
      });
    }
  }
}
