import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SearchBoxService } from '../../services/search-box.service';
import { SearchGroup } from '../search-results/search-items.interface';

@Component({ template: '' })
export abstract class SearchBoxAbstractComponent implements OnInit {
  hasValue: boolean;
  groups: SearchGroup[] = [];

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected searchBoxService: SearchBoxService,
  ) {}

  ngOnInit(): void {
    this.searchBoxService.reset();
  }

  protected abstract onSearch(value: string): void;
}
