let $ghUrl=document.getElementById("gh-url");
let $submitBtn = document.getElementById("submit-btn");
let $output=document.getElementById("result")
let $copyBtn = document.getElementById("copy-btn");
let $status = document.getElementById("status");


$submitBtn.onclick=()=>{
    let ghUrl=$ghUrl.value;
    let urlFragment=ghUrl.split("/");
    if(urlFragment[2]!="github.com"){
        alert("Please enter a valid github URL!")
        return
    }
    let repo=urlFragment[3]+"/"+urlFragment[4]
    $output.innerText = `[Count Code Lines](https://nikjos.in/code-line-counter/open?repo=${repo})`;
}

$copyBtn.onclick=()=>{
    result.select();
    result.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    navigator.clipboard.writeText(result.value);

    $status.innerText="Markdown Copied 😊";
}