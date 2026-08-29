import Element from "./element";

export default class Icon extends Element {
    private icon:string;

    constructor(icon:string) {
        super();

        this.icon = icon;
    }

    protected create():HTMLSpanElement {
        let icon = document.createElement("span");
        icon.classList.add("material-symbols-outlined");
        icon.appendChild(document.createTextNode(this.icon));

        return icon;
    }
}