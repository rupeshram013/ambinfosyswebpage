


var navbar = document.getElementById("navbar");


var usercookie = document.cookie;
var usertoken = usercookie.split(';')[0];
var username = usercookie.split(';')[1];
var admin = usercookie.split(';')[2];

console.log(username,usertoken);

if (usercookie === null || usercookie === "") {
    
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
            </div>

            <div id="right">

            <a href="/register">
            
            <img src="/images/icons/registerwhite.png" alt="error" srcset="">
            </a>
            <a href="/login">
            <img src="/images/icons/userwhite.png" alt="error" srcset="">
            </a>

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
                <img src="/images/background/nitro.png">
            </div>
        </div>

    `
}else {
    if(username != null){
        console.log(admin)

        if(admin === undefined){
                navbar.innerHTML = 
                    `
            
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
                    </div>
            
                    <div id="right">
                    
                    <a href="/profile">
                    <p>${username.split('=')[1]}</p>
                    </a>
                    
            
                    </div>
                    `
        }else{

            if(admin.split("=")[1] === '1'){
                navbar.innerHTML = 
                    `
            
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
                    </div>
            
                    <div id="right">
                    
                    <a href="/dashboard">
                    <p>${username.split('=')[1]}</p>
                    </a>

                    
            
                    </div>
                    `
    
            }else{
    
                navbar.innerHTML = 
                    `
            
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
                    </div>
            
                    <div id="right">
                    
                    <a href="/profile">
                    <p>${username.split('=')[1]}</p>
                    </a>
                    
            
                    </div>
                    `
            }
        }


    }
}



var footer = document.getElementById("footer");
footer.innerHTML = 
`

`