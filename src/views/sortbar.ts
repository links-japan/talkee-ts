import helper from "../utils/helper";
import icons from "../icons";
import { $e } from "../utils/dom";
import { $t } from "../i18n";

import "./sortbar.scss";

export default class SortBar {
  talkee: any;

  element: HTMLElement | null;

  total: number;

  constructor(talkee: any, opts) {
    this.talkee = talkee;
    this.element = null;

    this.total = opts.total || 0;
  }

  render() {
    const sortBar = $e("div", { className: "talkee-sort-bar" });
    const sortBarLeft = $e("div", { className: "talkee-sort-bar-left" });
    const sortBarCommentIcon = $e("span", {
      className: "talkee-sort-bar-comment-icon",
    });
    sortBarCommentIcon.style.backgroundImage =
      'url("' + icons.commentIcon + '")';
    const sortBarCommentCount = $e("span", {
      className: "talkee-sort-bar-comment-count",
      innerText: this.total,
    });

    sortBarLeft.appendChild(sortBarCommentIcon);
    sortBarLeft.appendChild(sortBarCommentCount);
    sortBar.appendChild(sortBarLeft);

    const sortBarRight = $e("div", { className: "talkee-sort-bar-right" });
    const sortIcon = $e("span", { className: "talkee-sort-icon" });
    sortIcon.style.backgroundImage = 'url("' + icons.sortIcon + '")';
    const sortPrefix = $e("span", {
      className: "talkee-sort-prefix",
      innerText: "",
    });
    sortBarRight.appendChild(sortIcon);
    sortBarRight.appendChild(sortPrefix);

    const sortByFavButton = $e("button", {
      className: "talkee-button talkee-sort-button talkee-sort-by-fav-button",
      innerText: $t("sort_by_fav_button"),
      disabled: true,
    });
    sortByFavButton.addEventListener("click", () => {
      this.talkee.applySortMethod("favor_count");
    });
    const sortByIdButton = $e("button", {
      className:
        "talkee-button talkee-sort-button talkee-sort-by-id-desc-button",
      innerText: $t("sort_by_id_desc_button"),
    });
    sortByIdButton.addEventListener("click", () => {
      this.talkee.applySortMethod("id");
    });
    const sortByIdAscButton = $e("button", {
      className:
        "talkee-button talkee-sort-button talkee-sort-by-id-asc-button",
      innerText: $t("sort_by_id_asc_button"),
    });
    sortByIdAscButton.addEventListener("click", () => {
      this.talkee.applySortMethod("id-asc");
    });

    const menu = $e("ul", {
      className: "talkee-menu",
    });
    const menuItemLogout = $e("li", {
      className: "talkee-menu-item talkee-menu-item-logout",
      innerText: $t("logout"),
    });
    menuItemLogout.addEventListener("click", () => {
      helper.removeAuth();
      window.location.reload();
    });
    menu.append(menuItemLogout);

    const menuButton = $e("button", {
      className: "talkee-button talkee-menu-button",
      innerText: " ",
    });
    menuButton.addEventListener("click", () => {
      if (menu.style.display === "block") {
        menu.style.display = "none";
      } else {
        menu.style.display = "block";
      }
    });
    menuButton.style.backgroundImage = 'url("' + icons.menuIcon + '")';

    sortBarRight.appendChild(sortByFavButton);
    sortBarRight.appendChild(sortByIdButton);
    sortBarRight.appendChild(sortByIdAscButton);
    if (this.talkee.isSigned) {
      sortBarRight.appendChild(menuButton);
      sortBarRight.appendChild(menu);
    }
    sortBar.appendChild(sortBarRight);

    this.element = sortBar;
    return this.element;
  }
}
