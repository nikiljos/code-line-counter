let files={}

let $fileNames=document.getElementById("file-names")
let $open=document.getElementById("open")
let $rewrite = document.getElementById("rewrite");
let $counter=document.getElementById("counter")
let $status = document.getElementById("status");

let urlParamPart = window.location.href.split("?")[1];
let paramPlainText=urlParamPart.split("&");
let params={}
paramPlainText.forEach(elt=>{
    let parts=elt.split("=")
    params[parts[0]]=parts[1]
})

// if(params.repo==""||params.repo==undefined){
//     throw("err")
// }

let {repo,type}=params
let url = `https://api.github.com/repos/${repo}/contents/`;
let total=0,loaded=0,reject=0;
let errorCount=0;

let totalLine=0,totalNonBlank=0;

function getFile(prefix,url){
    fetch(url+prefix)
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

getFile("",url)
// console.log(files)

function lineCounter(fileContent){
    let lineArray = fileContent.split("\n")
    let nonBlank=0;
    lineArray.forEach(line=>{
        if(line!==""){
            nonBlank++;
        }
    })
    return {
        total:lineArray.length,
        nonBlank
    }
}

function isAsset(format){
    let assetFormats=["mp3","ogg","svg","m4a","png","jpg","jpeg","json"]
    return assetFormats.some(elt=>elt==format)
}

function checkCompletion(){
    if((loaded+reject)==total){
        $counter.innerHTML += `<div class="space">Completed loading all files...</div>`;
        console.log(files)
    }
    
}

function addFiletoDOM(fileName,type){
    let $nameDiv=document.createElement("div");
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