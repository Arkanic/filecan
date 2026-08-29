import Element from "./element";

export default class IconButton extends Element {
    private icon:number;
    private clickedIcon:number;
    private title?:string;

    constructor(icon:number, title?:string, clickedIcon:number = 0xf0be)  {
        super();

        this.icon = icon;
        this.clickedIcon = clickedIcon;
        this.title = title;
    }

    protected create():HTMLElement {
        let iconSpan = document.createElement("span");
        iconSpan.classList.add("material-symbols-outlined", "icon-clickable");
        if(this.title) iconSpan.title = this.title;
        let defaultIcon = document.createTextNode(String.fromCodePoint(this.icon));
        iconSpan.appendChild(defaultIcon);
        
        iconSpan.addEventListener("click", () => {
            let newIcon = document.createTextNode(String.fromCharCode(this.clickedIcon));
            defaultIcon.replaceWith(newIcon);
            setTimeout(() => {
                newIcon.replaceWith(defaultIcon);
            }, 500);
        });

        return iconSpan;
    }
}