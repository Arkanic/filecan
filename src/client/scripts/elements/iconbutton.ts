import Element from "./element";
import Icons from "../../font/icons";

export default class IconButton extends Element {
    private icon:string;
    private clickedIcon:string;
    private title?:string;

    constructor(icon:string, title?:string, clickedIcon:string = Icons.check_circle)  {
        super();

        this.icon = icon;
        this.clickedIcon = clickedIcon;
        this.title = title;
    }

    protected create():HTMLElement {
        let iconSpan = document.createElement("span");
        iconSpan.classList.add("material-symbols-outlined", "icon-clickable");
        if(this.title) iconSpan.title = this.title;
        let defaultIcon = document.createTextNode(this.icon);
        iconSpan.appendChild(defaultIcon);
        
        iconSpan.addEventListener("click", () => {
            let newIcon = document.createTextNode(this.clickedIcon);
            defaultIcon.replaceWith(newIcon);
            setTimeout(() => {
                newIcon.replaceWith(defaultIcon);
            }, 500);
        });

        return iconSpan;
    }
}