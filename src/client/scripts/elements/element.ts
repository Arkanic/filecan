/**
 * Dynamic element base class
 * Got tired of inline creation of DOM elements, these elements are building blocks
 * of a sort, and provide their own convenient functions for handling their elements.
 */
export default abstract class Element {
    element?:HTMLElement;

    constructor() {
    }

    get():HTMLElement {
        if(!this.element) this.element = this.create();

        return this.element;
    }

    /**
     * Helper, escape a user input string if it's being direct
     * inserted into a HTML string for some evil reason.
     */
    protected escape(str:string):string {
        return str
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#039;");
    }

    protected abstract create():HTMLElement
}