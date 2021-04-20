import { $e } from "../utils/dom";
import { $t } from "../i18n";

export default class Expansion {
  talkee: any;
  element: HTMLElement | Element | null;
  expanded: boolean;
  expand: Function;

  constructor(talkee: any, opts: any) {
    this.talkee = talkee;
    this.element = null;
    this.expanded = opts.expanded || true;
    this.expand = opts.expand || (() => 0);
  }

  render() {
    const expansionPanel = $e("div", {
      className: "talkee-expansion-panel",
    });
    const expansionPanelInner = $e("div", {
      className: "talkee-expansion-panel-inner",
    });

    const expandButton = $e("button", {
      className: "talkee-button talkee-expand-button",
      innerText: $t("expand_button"),
    });
    expandButton.addEventListener("click", () => {
      this.expand();
    });
    expansionPanelInner.appendChild(expandButton);
    expansionPanel.appendChild(expansionPanelInner);

    this.element = expansionPanel;
    return this.element;
  }
}
