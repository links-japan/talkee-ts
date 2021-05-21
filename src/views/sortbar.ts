import helper from "../utils/helper";
import icons from "../icons";
import { $e } from "../utils/dom";
import { $t } from "../i18n";

import "./sortbar.scss";

/** import types */
import type Talkee from "../talkee";

export default class SortBar {
  talkee: Talkee;

  element: HTMLElement | Element | null;

  total: number;

  constructor(talkee: Talkee, opts) {
    this.talkee = talkee;
    this.element = null;

    this.total = opts.total || 0;
  }

  public setProps = (props) => {
    this.total = props?.total || 0;
    const count = this.element?.querySelector(
      `.${this.talkee.classes("sort-bar-comment-count")}`
    );
    (count as any).innerText = this.total;
  };

  public render = () => {
    const sortBar = $e("div", { className: this.talkee.classes("sort-bar") });
    const sortBarLeft = $e("div", {
      className: this.talkee.classes("sort-bar-left"),
    });
    const sortBarCommentIcon = $e("span", {
      className: this.talkee.classes("sort-bar-comment-icon"),
    });
    sortBarCommentIcon.style.backgroundImage =
      'url("' + icons.commentIcon + '")';
    const sortBarCommentCount = $e("span", {
      className: this.talkee.classes("sort-bar-comment-count"),
      innerText: this.total,
    });

    sortBarLeft.appendChild(sortBarCommentIcon);
    sortBarLeft.appendChild(sortBarCommentCount);
    sortBar.appendChild(sortBarLeft);

    const sortBarRight = $e("div", {
      className: this.talkee.classes("sort-bar-right"),
    });
    const sortIcon = $e("span", {
      className: this.talkee.classes("sort-icon"),
    });
    sortIcon.style.backgroundImage = 'url("' + icons.sortIcon + '")';
    const sortPrefix = $e("span", {
      className: this.talkee.classes("sort-prefix"),
      innerText: "",
    });
    sortBarRight.appendChild(sortIcon);
    sortBarRight.appendChild(sortPrefix);

    const sortByFavButton = $e("button", {
      className: this.talkee.classes(
        "button",
        [
          this.talkee.classes("sort-button"),
          this.talkee.classes("sort-by-fav-button"),
        ].join(" ")
      ),
      innerText: $t("sort_by_fav_button"),
      disabled: true,
    });
    sortByFavButton.addEventListener("click", () => {
      this.talkee.applySortMethod("favor_count");
    });
    const sortByIdButton = $e("button", {
      className: this.talkee.classes(
        "button",
        [
          this.talkee.classes("sort-button"),
          this.talkee.classes("sort-by-id-desc-button"),
        ].join(" ")
      ),
      innerText: $t("sort_by_id_desc_button"),
    });
    sortByIdButton.addEventListener("click", () => {
      this.talkee.applySortMethod("id");
    });
    const sortByIdAscButton = $e("button", {
      className: this.talkee.classes(
        "button",
        [
          this.talkee.classes("sort-button"),
          this.talkee.classes("sort-by-id-asc-button"),
        ].join(" ")
      ),
      innerText: $t("sort_by_id_asc_button"),
    });
    sortByIdAscButton.addEventListener("click", () => {
      this.talkee.applySortMethod("id-asc");
    });

    const menu = $e("ul", {
      className: this.talkee.classes("menu"),
    });
    const menuItemLogout = $e("li", {
      className: this.talkee.classes(
        "menu-item",
        this.talkee.classes("menu-item-logout")
      ),
      innerText: $t("logout"),
    });
    menuItemLogout.addEventListener("click", () => {
      helper.removeAuth();
      window.location.reload();
    });
    menu.append(menuItemLogout);

    const menuButton = $e("button", {
      className: this.talkee.classes(
        "button",
        this.talkee.classes("menu-button")
      ),
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
  };
}
