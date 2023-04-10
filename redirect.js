let $ghUrl = document.getElementById("gh-url");
let $redirectButton = document.getElementById("redirect-btn");

$redirectButton.onclick = () => {
    let ghUrl = $ghUrl.value;
    let urlFragment = ghUrl.split("/");
    if (urlFragment[2] != "github.com") {
        alert("Please enter a valid github URL!");
        return;
    }
    let repo = urlFragment[3] + "/" + urlFragment[4];
    console.log(repo);
    let url = `./open?repo=${repo}`;
    if(urlFragment[5]==="tree") url+=`&branch=${urlFragment[6]}`
    // console.log(urlFragment)
    window.location =url;
};
