import { $e } from "../utils/dom";
import { $t } from "../i18n";

import "./pagination.scss";

export default class SortBar {
  talkee: any;

  element: HTMLElement | null;

  totalPage: number;
  page: number;

  prev: Function;
  next: Function;
  locate: Function;

  constructor(talkee: any, opts) {
    this.talkee = talkee;
    this.element = null;

    this.totalPage = opts.totalPage || 0;
    this.page = opts.page || 0;

    this.prev = opts.prev || (() => 0);
    this.next = opts.next || (() => 0);
    this.locate = opts.locate || (() => 0);
  }

  render() {
    // [prev] [1], [2], [3] ... [n] [next]
    const paginationCan = $e("div", { className: "talkee-pagination" });
    const pageIndicators = $e("div", {
      className: "talkee-pagination-indicators",
    });
    const prevPageButton = $e("button", {
      className:
        "talkee-button talkee-pagination-button talkee-pagination-prev-button",
      innerText: $t("prev_page"),
    });
    // prev
    prevPageButton.addEventListener("click", () => {
      this.page = Math.max(this.page - 1, 1);
      this.prev(this.page);
    });
    if (this.page === 1) {
      prevPageButton.style.display = "none";
    }
    // next
    const nextPageButton = $e("button", {
      className:
        "talkee-button talkee-pagination-button talkee-pagination-next-button",
      innerText: $t("next_page"),
    });
    nextPageButton.addEventListener("click", () => {
      this.page = Math.min(this.page + 1, this.totalPage);
      this.next(this.page);
    });
    if (this.page === this.totalPage) {
      nextPageButton.style.display = "none";
    }
    // others
    const range = 5;
    const prefixIndicatorCount = Math.min(this.totalPage, range);
    const startFrom = Math.max(this.page - range, 0);
    for (let ix = startFrom; ix < startFrom + prefixIndicatorCount; ix++) {
      const btn = $e("button", {
        className: `talkee-button talkee-pagination-button talkee-pagination-${
          ix + 1
        }-button`,
        innerText: ix + 1,
      }) as HTMLButtonElement;
      if (this.page === ix + 1) {
        btn.disabled = true;
      }
      btn.addEventListener("click", () => {
        this.page = ix + 1;
        this.next(this.page);
      });
      pageIndicators.appendChild(btn);
    }
    // dots and last page
    paginationCan.appendChild(prevPageButton);
    paginationCan.appendChild(pageIndicators);
    paginationCan.appendChild(nextPageButton);

    this.element = paginationCan;
    return this.element;
  }
}
