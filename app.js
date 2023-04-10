let files={}

let $fileNames=document.getElementById("file-names")
let $open=document.getElementById("open")
let $rewrite = document.getElementById("rewrite");
let $counter=document.getElementById("counter")
let $status = document.getElementById("status");
let $tokenInit=document.getElementById("token-init")
let $header=document.getElementById("header")

let urlParamPart = window.location.href.split("?")[1];
let paramPlainText=urlParamPart.split("&");
let params={}
paramPlainText.forEach(elt=>{
    let parts=elt.split("=")
    params[parts[0]]=parts[1]
})

// let auth=null
let {repo,branch}=params
let url = `https://api.github.com/repos/${repo}/contents/`;
let ghParams=(branch&&branch.trim()!="")?`?ref=${branch}`:"";
let ghHeader=new Headers();
let total=0,loaded=0,reject=0;
let errorCount=0;

let totalLine=0,totalNonBlank=0;

const updateHeader=()=>{
    $header.innerHTML=`<h3>Repo: ${repo}</h3><h4>Branch: ${branch||"Default"}</h4>`
}

const processToken=()=>{
    let localToken=localStorage.getItem("gh-token")
    console.log({localToken})
    if(localToken&&localToken!="null"&&localToken!="undefined"&&localToken.trim()!=""){
        // ("Authorization":`Bearer ${localToken}`)
        ghHeader.append("Authorization", `Bearer ${localToken}`);
        $tokenInit.innerText="Edit API Key"
        // console.log(ghHeader)
    }
    else{
        console.log("Token Not Found")
    }
}

function getFile(prefix,url){
    console.log(ghHeader)
    fetch(url+prefix+ghParams,{
        "method":"GET",
        "headers":ghHeader
    })
    .then(res=>{
        if(!res.ok){
            addFiletoDOM("Error: "+prefix+" --> "+res.status,"error")
            throw(new Error(res.status))
        }
        return res.json()
    })
    .then(data=>{
        if(total!=0){
            total--;
        }
        total+=data.length
        updateCounter()
        data.forEach(file=>{
            let newFile=`${file.name}`
            if(prefix!=""){
                newFile = `${prefix}/`+newFile;
            }
            if(file.download_url==null){
                getFile(`${newFile}`,url)
            }
            else{
                let format=file.name.split(".").at(-1)
                if(isAsset(format)){
                    reject++;
                    updateCounter();
                    return
                }
                fetch(file.download_url)
                .then(res=>{
                    return res.text()
                })
                .then(data=>{
                    let lineCount=lineCounter(data)
                    files[newFile]=lineCount
                    loaded++;
                    totalLine+=lineCount.total
                    totalNonBlank+=lineCount.nonBlank
                    updateCounter();
                    addFiletoDOM(
                        newFile +
                            " --> " +
                            lineCount.total +
                            " --> " +
                            lineCount.nonBlank
                    );
                    checkCompletion();
                })
                .catch(err=>{
                    addFiletoDOM(`Failed to load ${newFile}`,"error");
                    errorCount++;
                    updateStatus();
                    console.log("Raw Error",err)
                })
            }
        })
    })
    .catch(err=>{
        console.log("API Error",err)
    })
}

updateHeader()
processToken()
getFile("",url)
// console.log(files)

function lineCounter(fileContent){
    let lineArray = fileContent.split("\n")
    let nonBlank=0;
    lineArray.forEach(line=>{
        if(line.trim()!==""){
            nonBlank++;
        }
    })
    return {
        total:lineArray.length,
        nonBlank
    }
}

function isAsset(format){
    let assetFormats=["mp3","ogg","svg","m4a","mp4","mkv","pdf","png","jpg","jpeg","json","gif","ico"]
    return assetFormats.some(elt=>elt==format)
}

function checkCompletion(){
    if((loaded+reject)==total){
        $counter.innerHTML += `<div class="file-box" style="background-color:#edf7ed">Completed loading all files...</div>`;
        console.log(files)
    }
    
}

function addFiletoDOM(fileName,type){
    let $nameDiv=document.createElement("div");
    $nameDiv.classList.add("file-box")
    $nameDiv.innerText=fileName;
    if(type==="error") $nameDiv.style.backgroundColor = "#fdeded";
    $fileNames.append($nameDiv)
}

function updateCounter(){
    let counterString = `
    <div class="space">Loaded <span class="bold">${loaded}</span> of <span class="bold">${total}</span> files...</div>
    <div class="space">
        <div class="space">Total Lines: <span class="bold">${totalLine}</span></div>
        <div class="space">Total Code Lines: <span class="bold">${totalNonBlank}</span></div>
    </div>
    `;
    if(reject>0){
        counterString += `<div class="space">Skipped <span class="bold">${reject}</span> Asset files</div>`;
    }

    $counter.innerHTML =counterString
}

function updateStatus(){
    if(errorCount>0){
        $status.innerHTML = `<div class="space">Failed to load <span class="bold">${errorCount}</span> Files</div>
        <div class="space">Please make sure that your Firewall/ISP is not blocking <code>raw.githubusercontent.com</code></div>`;
    }
    $status.style.display="block"
}

const addToken=()=>{
    let userInput=prompt("Please enter a valid github token.\nThis key will be stored in you device itself and won't be visible to the developer.\n\nYou can replace the value with - to delete the token",localStorage.getItem("gh-token"))
    if(userInput){
        if(userInput.length>5){
            localStorage.setItem("gh-token", userInput || "");
        }
        else{
            localStorage.setItem("gh-token", "");
        }
        window.location.reload();
    }
    
    
}

$tokenInit.onclick=addToken