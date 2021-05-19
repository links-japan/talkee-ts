import { $e } from "../utils/dom";
import { $t } from "../i18n";

/** import types */
import type Talkee from "../talkee";

export default class Expansion {
  talkee: Talkee;
  element: HTMLElement | Element | null;
  expanded: boolean;
  expand: Function;

  constructor(talkee: Talkee, opts: any) {
    this.talkee = talkee;
    this.element = null;
    this.expanded = opts.expanded || true;
    this.expand = opts.expand || (() => 0);
  }

  public render = () => {
    const expansionPanel = $e("div", {
      className: this.talkee.classes("expansion-panel"),
    });
    const expansionPanelInner = $e("div", {
      className: this.talkee.classes("expansion-panel-inner"),
    });

    const expandButton = $e("button", {
      className: this.talkee.classes(
        "button",
        this.talkee.classes("expand-button")
      ),
      innerText: $t("expand_button"),
    });
    expandButton.addEventListener("click", () => {
      this.expand();
    });
    expansionPanelInner.appendChild(expandButton);
    expansionPanel.appendChild(expansionPanelInner);

    this.element = expansionPanel;
    return this.element;
  };
}
