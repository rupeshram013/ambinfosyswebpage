


var navbar = document.getElementById("navbar");


var usercookie = document.cookie;
var usertoken = usercookie.split(';')[0];
var username = usercookie.split(';')[1];
var admin = usercookie.split(';')[2];


navbar.innerHTML = 
`
    <div id="top">
        <div id="left">
            <a href="/">
            <img src="/images/logo/logowhitev.png" alt="error" srcset="">
            </a>
        </div>

        <div id="mid">       
  
            <div id="search">
                <form action="/search" method="get">
                    <input type="text" placeholder="Search Us" name="name" id="name" required>
                    <button type="submit">
                        <img src="/images/icons/searchwhite.png" alt="" srcset="">
                    </button>
                </form>
            </div>
            <button id="categorybutton" onclick="showcategorybox()">
                <img src="/images/icons/category.png">
            </button>   
        </div>

        <div id="rightbox" class="navright">

        </div>

    </div>

    <div id="searchbox" style="display:none;">
        <div id="search">
            <form action="/search" method="get">
                <input type="text" placeholder="Search Us" name="name" id="name" required>
                <button type="submit">
                    <img src="/images/icons/search.png" alt="" srcset="">
                </button>
            </form>
        </div>
    </div>
    <div id="categorybox" style="display:none;">
        <div id="categories">

        <div>
            <a href="/category?name=camera">
                <img src="/images/icons/camera.png" alt="" srcset="">
                <p>Camera</p>
            </a>
        </div>
        <div>
            <a href="/category?name=monitor">
                <img src="/images/icons/monitors.png" alt="" srcset="">
                <p>Monitors</p>
            </a>
        </div>
        <div>
            <a href="/category?name=desktop">
                <img src="/images/icons/desktops.png" alt="" srcset="">
                <p>Desktops</p>
            </a>
        </div>
        <div>
            <a href="/category?name=laptop">
                <img src="/images/icons/laptops.png" alt="" srcset="">
                <p>Laptops</p>
            </a>
        </div>
        <div>
            <a href="/category?name=speaker">
                <img src="/images/icons/speakers.png" alt="" srcset="">
                <p>Speakers</p>
            </a>
        </div>
        <div>
            <a href="/category?name=ssd">
                <img src="/images/icons/ssd.png" alt="" srcset="">
                <p>Storage</p>
            </a>
        </div>
        <div>
            <a href="/category?name=headphone">
                <img src="/images/icons/headphones.png" alt="" srcset="">
                <p>Headsets</p>
            </a>
        </div>
        <div>
            <a href="/category?name=keyboard">
                <img src="/images/icons/keyboards.png" alt="" srcset="">
                <p>Keyboards</p>
            </a>
        </div>
        <div>
            <a href="/category?name=mouse">
                <img src="/images/icons/mouse.png" alt="" srcset="">
                <p>Mouse</p>
            </a>
        </div>
        <div>
            <a href="/category?name=printer">
                <img src="/images/icons/printers.png" alt="" srcset="">
                <p>Printers</p>
            </a>
        </div>
        <div>
            <a href="/category?name=switch">
                <img src="/images/icons/switch.png" alt="" srcset="">
                <p>Switch</p>
            </a>
        </div>
        <div>
            <a href="/category?name=ups">
                <img src="/images/icons/ups.png" alt="" srcset="">
                <p>UPS</p>
            </a>
        </div>
        <div>
            <a href="/category?name=router">
                <img src="/images/icons/router.png" alt="" srcset="">
                <p>Router</p>
            </a>
        </div>
        <div>
            <a href="/category?name=cables">
                <img src="/images/icons/cables.png" alt="" srcset="">
                <p>Cables</p>
            </a>
        </div>
        <div>
            <a href="/category?name=telephone">
                <img src="/images/icons/telephone.png" alt="" srcset="">
                <p>Telephone</p>
            </a>
        </div>


    </div>

    </div>

    <div id="bottom">
        <div id="left">
            <h1>Acer Nitro</h1>
            <h2>V16</h2>
            <div id="border1"></div>
            <h6>The new Acer Nitro V16 includes AMD R7-8845HS with RTX 4050 6GB . A single stick 16GB RAM is supported with 512GB SSD storage . </h6>
            <a href="/"><p>Learn More</p></a>
        </div>
        <div id="right">
            <img src="/images/background/nitro.png" id="nitro1" loading="lazy">
            <img src="/images/background/nitro2.png" id="nitro2" loading="lazy">
        </div>
    </div>

`
var rightbox = document.getElementById("rightbox")

if (usercookie === null || usercookie === "") {
    rightbox.innerHTML = 
    `
        <button id="searchbutton" onclick="showsearchbox()">
            <img src="/images/icons/searchwhite.png">
        </button>

        <a href="/register">
            <p>Register</p>
        </a>
        <a href="/login">    
            <p>Login</p>
        </a>



    `
    
}else {
    if(username != null){
        if(admin === undefined){
            rightbox.innerHTML = 
                `
                <button id="categorybutton" onclick="showcategorybox()">
                    <img src="/images/icons/category.png">
                </button> 
                <a href="/profile">
                    <img src="/images/icons/profile.png">
                </a>
                <button id="searchbutton" onclick="showsearchbox()">
                    <img src="/images/icons/category.png">
                </button>
                
                `

        }else{

            if(admin.split("=")[1] === '1'){
                rightbox.innerHTML = 
                    `
                <button id="categorybutton" onclick="showcategorybox()">
                    <img src="/images/icons/category.png">
                </button>                     
                <a href="/dashboard">
                    <img src="/images/icons/userwhite.png">
                    </a>
                <button id="searchbutton" onclick="showsearchbox()">
                    <img src="/images/icons/category.png">
                </button>
                    `
                    
            }else{
    
                rightbox.innerHTML = 
                    `
                <button id="categorybutton" onclick="showcategorybox()">
                    <img src="/images/icons/category.png">
                </button> 
                <a href="/profile">
                    <img src="/images/icons/userwhite.png">
                </a>
                <button id="searchbutton" onclick="showsearchbox()">
                    <img src="/images/icons/category.png">
                </button>
                    `
                    
            }
        }


    }
}


function showsearchbox(){

    let searchbox = document.getElementById("searchbox")

    if(searchbox.style.display == 'none'){
        searchbox.style.display = "block"
    }else{
        searchbox.style.display = "none"
    }
}
function showcategorybox(){

    let categorybox = document.getElementById("categorybox")
    console.log("category")
    if(categorybox.style.display == 'none'){
        categorybox.style.display = "block"
    }else{
        categorybox.style.display = "none"
    }
}



var footer = document.getElementById("footer");
footer.innerHTML = 
`

`
