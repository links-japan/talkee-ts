import { $e } from "../utils/dom";
import { $t } from "../i18n";
import icons from "../icons/index";

/** import types */
import type Talkee from "../talkee";

export default class EditorMask {
  talkee: Talkee;
  element: HTMLElement | Element | null;

  constructor(talkee: Talkee) {
    this.talkee = talkee;
    this.element = null;
  }

  public render = () => {
    const editorMask = $e("div", {
      className: this.talkee.classes("editor-mask"),
    });
    const loginButton = $e("a", {
      className: this.talkee.classes("tap-to-login"),
      innerText: $t("tap_to_login"),
    });
    loginButton.style.backgroundImage = `url("${icons.commentBtnIcon}")`;
    loginButton.setAttribute("rel", "nofollow");
    loginButton.setAttribute("href", this.talkee.buildLoginURL());
    editorMask.append(loginButton);

    this.element = editorMask;
    return this.element;
  };
}
