const elements = {
    body: document.getElementsByTagName("body")[0]! as HTMLBodyElement,
    title: document.getElementById("title")!,
    loading: document.getElementById("loading")! as HTMLDivElement,
    content: document.getElementById("content")! as HTMLDivElement,
    results: document.getElementById("results")! as HTMLDivElement,
    passwordbox: document.getElementById("passwordbox")! as HTMLDivElement,
    password: document.getElementById("password")! as HTMLInputElement,
    form: document.getElementById("form")! as HTMLFormElement,
    submitbutton: document.getElementById("submitbutton")! as HTMLInputElement,
    progressbox: document.getElementById("progressbox")! as HTMLDivElement,
    progressbar: document.getElementById("progressbar")! as HTMLProgressElement,
    progressinfo: document.getElementById("progressinfo")! as HTMLParagraphElement,

    admintoggle: document.getElementById("admintoggle")! as HTMLAnchorElement,
    adminlogin: document.getElementById("adminlogin")!,
    adminpassword: document.getElementById("adminpassword")! as HTMLInputElement,
    adminsubmit: document.getElementById("adminsubmit")! as HTMLInputElement,

    admincontent: document.getElementById("admincontent")!,
    adminfilesbox: document.getElementById("adminfilesbox")!,
    adminlogbox: document.getElementById("adminlogbox")!,
    adminlogclear: document.getElementById("adminlogclear")! as HTMLAnchorElement
}

export default elements;