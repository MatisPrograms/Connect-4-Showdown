const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
var pseudo = document.getElementById("pseudo").querySelector("span");
pseudo.innerText = " "+username;
console.log(username);


var newpassword = document.getElementById("newmdp");
var pwd=newpassword.innerText;

var trueelo;
var truemail;
var elo = 1261 //hard codé pour l'instant
var docelo = document.getElementById("elo");
var htmlusername = document.getElementById("username");
var htmlvues = document.getElementById("vues");
var htmlmail = document.getElementById("mail");
var htmlavatar = document.getElementById("main-image");
var htmlpreciserank = document.getElementById("preciserank");
var rankinginternal;
var listepartieassocie;
var htmlnumbergame=document.getElementById("partiejoue");
var htmlnumberwin=document.getElementById("partiegagne")
var htmlpercentwin=document.getElementById("percentwin")
let htmlaccdate=document.getElementById("accdate");

htmlusername.value=username+"";
docelo.innerText = elo + " Elo";
var htmlstreak=document.getElementById("streak");


window.addEventListener('load',() =>{
console.log("onload");
    onloadfunction();

})
function onloadfunction(){
try {
        fetch(window.location.protocol + '//' + window.location.host + "/api/profile?username=" + username,{method:'GET'})
        .then(response =>{
        if(!response.ok) throw new Error(response.statusText);
        return response.json();
        })
        .then(data=>{
            console.log(data);





            htmlvues.innerText=data.Vues;
            htmlusername.value=" "+data.Username;
            docelo.innerText = " "+data.MMR + " Elo";
            htmlavatar.src=data.Avatar;
            htmlmail.value = data.Email ;
            rank(data.MMR);
            trueelo=data.MMR;

            const date=new Date(data.Timestamp);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const monthinletter=monthIntToLetter(month);
            const formattedDate = `${day} ${monthinletter} ${year}`;
            htmlaccdate.innerText=formattedDate
            getpreciserank(data.MMR);})



    } catch (error) {
        console.error('Erreur:', error);
    }
    try {
            fetch(window.location.protocol + '//' + window.location.host + "/api/statgame?username=" + username,{method:'GET'})
            .then(response =>{
            if(!response.ok) throw new Error(response.statusText);
            return response.json();
            })
            .then(data=>{
                console.log(data);

                //var datatrie=trie(data);
                arrayreal=arrayizerfor(data,username);

                setstat(data,username);
                console.log(arrayreal);
                drawCanvas(arrayreal);

                })


        } catch (error) {
            console.error('Erreur:', error);
        }
}
function arrayizerfor(data,username){
    if(data.length<10){
    var arraydeouf=new Array(data.length+1).fill(0);}

    var streak=0;
    var onstreak=true;
    var compteur=trueelo;
    arraydeouf[(arraydeouf.length)-1]=trueelo;

    console.log(data.length);
    for(var i=1;i<data.length+1 && i<10;i++){

        var currentvalue=5;

        console.log("hello"+currentvalue);
        if (data[data.length-i].Winner==username){
                   currentvalue=-currentvalue;
                   if(onstreak){
                    streak=streak+1;}}
        else{
        onstreak=false;}
        compteur+=currentvalue;
        console.log(compteur);
        arraydeouf[arraydeouf.length-i-1]=compteur;

    }
    htmlstreak.innerText=streak;
    return arraydeouf;
}
function setstat(array,username){
    htmlnumbergame.innerText=array.length;
    var win=0;
    for(var i=0;i<array.length;i++){
    console.log(i);
    console.log(array[i].Winner);
    console.log(username);

        if (array[i].Winner==username){
        win+=1;

        }
    }

    htmlnumberwin.innerText=win;
    var prct=(win*100)/array.length;
    htmlpercentwin.innerText=prct+" %";
}
function monthIntToLetter(month){
    if(month==1){
    return "janvier";}
    if(month==2){
        return "fevrier";}
    if(month==3){
    return "mars";}
    if(month==4){
        return "avril";}
        if(month==5){
            return "mai";}
        if(month==6){
        return "juin";}
        if(month==7){
            return "juillet";}
            if(month==8){
                return "aout";}
            if(month==9){
            return "septembre";}
            if(month==10){
                return "octobre";}
                if(month==11){
                    return "novembre";}
                if(month==12){
                return "decembre";}
}
function updateinfo() {
    var newusername=document.getElementById("username").value;
    var newavatar=document.getElementById("previewicon").value;
    var newmail=document.getElementById("mail").value;
    var newmdp=document.getElementById("newmdp").src;
    let bodyToSend = {
         Username: username,
         Newusername: newusername,
         Email: newmail,
         Avatar:newavatar,
         Password:newmdp

     }
    console.log("############");
    console.log(bodyToSend);
    fetch(window.location.protocol + '//' + window.location.host + "/api/updateinfo", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')
        },
        body: JSON.stringify(bodyToSend)
    }).then(response => {
        if (!response.ok) throw new Error(response.statusText);

    }).then(() => {
        console.log("je suis dans le then");
        onloadfunction();

    }).catch(e => console.log(e));
}

function getpreciserank(elo){
    try{

            fetch(window.location.protocol + '//' + window.location.host + '/api/rank', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    mmr: elo,

                })}).then(response =>{
                            if(!response.ok) throw new Error(response.statusText);
                            return response.json();
                            })
                            .then(data=>{
                                htmlpreciserank.innerText=data.Rank+" "+data.Division;

                                })
                }
                catch (error) {
                        console.error('Erreur:', error);
                    }
                }

function rank(elo) {
    var chosenelo;
    if (elo < 250) {
        chosenelo = document.getElementById("rank_bronze");
    } else if (elo < 750) {
        chosenelo = document.getElementById("rank_silver");
    } else if (elo < 1500) {
        chosenelo = document.getElementById("rank_gold");
    } else if (elo < 2500) {
        chosenelo = document.getElementById("rank_platinum");
    } else if (elo < 3750) {
        chosenelo = document.getElementById("rank_diamond");
    } else if (elo < 5250) {
        chosenelo = document.getElementById("rank_master");
    } else if (elo < 7250) {
        chosenelo = document.getElementById("rank_grandmaster");
    } else if (elo < 10000) {
        chosenelo = document.getElementById("rank_master");
    } else {
        chosenelo = document.getElementById("rank_legend");
    }
    chosenelo.style.border = "solid orange 5px";
    chosenelo.style.marginBottom = "20px";
    chosenelo.style.marginTop = "0px";
}

function show(i) {
    var infos = document.getElementById("infosmodif");
    var ranks = document.getElementById("ranks");
    var canvas = document.getElementById("myCanvas");
    var icons1 = document.getElementById("avatars");

    var username = document.getElementById("username");
    var mail = document.getElementById("mail");
    var password = document.getElementById("mdp");
    var newpassword = document.getElementById("newmdp");
    var confirmbutton = document.getElementById("confirmbutton");
    var penbutton = document.getElementById("penbutton");
    var profilebutton = document.getElementById("profilebutton");
    var statsbutton = document.getElementById("statsbutton");
    var datas = document.getElementById("data");
    var infosnonmodif = document.getElementById("infosnonmodif");
    var jetons = document.getElementById("displayedskin");
    var skinsjetons = document.getElementById("possibleskin");
    var seleccol = document.getElementById("seleccol");
    var colselc = document.getElementById("color-select");
    var iconprev = document.getElementById("previewicon");

    if (i === 2) { //edit profile
        iconprev.style.display = "flex";
        seleccol.style.display = "inline";
        colselc.style.display = "inline-block";
        jetons.style.display = "table";
        skinsjetons.style.display = "table";
        infos.style.display = "table";
        canvas.style.display = "none";
        icons1.style.display = "flex";

        newpassword.style.display = "flex";
        username.readOnly = false;
        mail.readOnly = false;

        confirmbutton.style.display = "flex";
        penbutton.style.display = "none";
        profilebutton.style.backgroundColor = "#46bb9c"
        statsbutton.style.backgroundColor = "#46bb9c"
        profilebutton.style.border = "none";
        statsbutton.style.border = "none";
        ranks.style.display = "none";
        datas.style.display = "none";
        infosnonmodif.style.display = "none";
    }
    if (i === 3) { //show stats
        iconprev.style.display = "none";
        seleccol.style.display = "none";
        colselc.style.display = "none";
        jetons.style.display = "none";
        skinsjetons.style.display = "none";
        infos.style.display = "none";
        canvas.style.display = "table";
        icons1.style.display = "none";

        penbutton.style.display = "flex";
        profilebutton.style.backgroundColor = "#46bb9c"
        statsbutton.style.backgroundColor = "#288264"
        profilebutton.style.border = "none";
        statsbutton.style.border = "solid white 2px";
        ranks.style.display = "none";
        datas.style.display = "table";
        infosnonmodif.style.display = "none";
        drawCanvas();
    }
    if (i === 1) { //show profile
        iconprev.style.display = "none";
        seleccol.style.display = "none";
        colselc.style.display = "none";
        jetons.style.display = "none";
        skinsjetons.style.display = "none";
        infos.style.display = "flex";
        canvas.style.display = "none";
        icons1.style.display = "none";

        username.readOnly = true;
        mail.readOnly = true;

        newpassword.style.display = "none";
        confirmbutton.style.display = "none";
        penbutton.style.display = "flex";
        profilebutton.style.backgroundColor = "#288264"
        statsbutton.style.backgroundColor = "#46bb9c"
        profilebutton.style.border = "solid white 2px";
        statsbutton.style.border = "none";
        ranks.style.display = "flex";
        datas.style.display = "none";
        infosnonmodif.style.display = "table";
    }
}

function showStats() {
    infos.style.display = "none";
    canvas.style.display = "table";
    icons1.style.display = "none";

    drawCanvas();
}

function showProfile() {
    infos.style.display = "table";
    canvas.style.display = "none";
    icons1.style.display = "none";

    username.readOnly = true;
    mail.readOnly = true;
    password.readOnly = true;
    newpassword.style.display = "none";
    confirmbutton.style.display = "none";
}


function updateMainImage(image) {
    document.getElementById("main-image").src = image;
}



function randomColour() {
    return Math.floor(Math.random() * 16777215).toString(16);
}

function generatesAvatars() {
    let avatars = "";
    for (let i = 0; i < 20; i++) {
        avatars += `
    <div class="avatar-preview">
        <img alt="Avatar" class="pickable-avatar" src="https://source.boringavatars.com/beam/50/avatar-${i}?colors=${randomColour()},${randomColour()},${randomColour()},${randomColour()},${randomColour()}" onclick=changeavatar(this)>
    </div>
    `;
    }
    return avatars;
}

function changeavatar(img) {

    var iconprev = document.getElementById("previewicon");
    const imgSrc = img.getAttribute('src');
    console.log('La valeur de "src" est : ' + imgSrc);
    iconprev.src = imgSrc;
}

function drawCanvas(array) {
    // 1. Retrieve or generate the data to be plotted
    //const array = [100, 200, 300, 250, 400, 500, 350, 300, 450, 550, 600];

    // 2. Create a canvas element on your HTML document
    var c = document.getElementById("myCanvas");

    // 3. Obtain the canvas context and set any necessary properties
    var ctx = c.getContext("2d");
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";

    // 4. Generate midpoints and scale all points
    var max = Math.max.apply(null, array);
    const data_points = Array(array.length);
    for (let i = 0; i < array.length; i++) {
        data_points[i] = {x: i * c.width / (array.length - 1), y: array[i]/2};
    }
    const data_raw = Array((data_points.length * 2) - 1);

    for (let i = 0; i < data_points.length - 1; i++) {
        data_raw[2 * i] = data_points[i];
        data_raw[2 * i + 1] = {
            x: (data_points[i].x + data_points[i + 1].x) / 2,
            y: (data_points[i].y + data_points[i + 1].y) / 2
        };
    }
    data_raw[(data_points.length - 1) * 2] = data_points[data_points.length - 1];

    const data_scaled = Array(data_raw.length);

    for (let i = 0; i < data_raw.length; i++) {
        data_scaled[i] = {x: data_raw[i].x, y: (c.height) - (c.height / max * data_raw[i].y)};
    }

    drawGraph(data_scaled, data_raw);

    // 5. Draw the graph using the canvas API
    function drawGraph(data, dataraw) {
        ctx.beginPath();
        ctx.moveTo(data[0].x, data[0].y);
        for (let i = 1; i < data.length - 2; i++) {
            const x1 = data[i].x;
            const y1 = data[i].y;
            const x2 = data[i + 1].x;
            const y2 = data[i + 1].y;
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2;
            ctx.quadraticCurveTo(x1, y1, cx, cy);
        }
        ctx.quadraticCurveTo(
            data[data.length - 2].x,
            data[data.length - 2].y,
            data[data.length - 1].x,
            data[data.length - 1].y
        );
        ctx.stroke();
        for (let i = 0; i < data.length; i++) {
            if (i % 2 === 0) {
                ctx.fillText(`${dataraw[i], 2*dataraw[i].y}`, data[i].x - 10, data[i].y - 10);
                ctx.beginPath();
                ctx.arc(data[i].x, data[i].y, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
}


window.addEventListener('load', () => {
    const avatars = document.createElement('div')
    avatars.id = 'tableau3';
    avatars.classList.add('avatar-container')
    avatars.innerHTML = generatesAvatars()

    document.getElementById('avatars').appendChild(avatars)


});

async function getUserData() {
    try {
        fetch(window.location.protocol + '//' + window.location.host + "/api/profile?username=" + username,{method:'GET'})
        .then(response =>{
        if(!response.ok) throw new Error(response.statusText);
        return response.json();
        })
        .then(data=>{
        console.log(data);

        console.log('Username:', data.Username);
        console.log('Email:', data.Email);

        console.log('MMR:', data.MMR);})
    } catch (error) {
        console.error('Erreur:', error);
    }
}


function changeCircleStylecarre() {
    var circle = document.getElementById("circle");

    const element = document.getElementById('circle'); // Remplacez 'mon-element' par l'ID de votre élément HTML
    while (element.classList.length > 0) {
        element.classList.remove(element.classList.item(0));
    }
    circle.style.cssText = 'initial';
    circle.classList.add("coin4");

    var circle2 = document.getElementById("circle2");

    const element2 = document.getElementById('circle2'); // Remplacez 'mon-element' par l'ID de votre élément HTML
    while (element2.classList.length > 0) {
        element2.classList.remove(element2.classList.item(0));
    }
    circle2.style.cssText = 'initial';
    circle2.classList.add("coin4R");


}

function changeCircleStyle3Dcarre() {
    var circle = document.getElementById("circle");

    const element = document.getElementById('circle'); // Remplacez 'mon-element' par l'ID de votre élément HTML
    while (element.classList.length > 0) {
        element.classList.remove(element.classList.item(0));
    }
    circle.style.cssText = 'initial';
    circle.classList.add("coin5");

    var circle2 = document.getElementById("circle2");

    const element2 = document.getElementById('circle2'); // Remplacez 'mon-element' par l'ID de votre élément HTML
    while (element2.classList.length > 0) {
        element2.classList.remove(element2.classList.item(0));
    }
    circle2.style.cssText = 'initial';
    circle2.classList.add("coin5R");
}

function changeCircleStylelosange() {
    var circle = document.getElementById("circle");

    const element = document.getElementById('circle'); // Remplacez 'mon-element' par l'ID de votre élément HTML
    while (element.classList.length > 0) {
        element.classList.remove(element.classList.item(0));
    }
    circle.style.cssText = 'initial';
    circle.classList.add("coin3");


    var circle2 = document.getElementById("circle2");

    const element2 = document.getElementById('circle2'); // Remplacez 'mon-element' par l'ID de votre élément HTML
    while (element2.classList.length > 0) {
        element2.classList.remove(element2.classList.item(0));
    }
    circle2.style.cssText = 'initial';
    circle2.classList.add("coin3R");

}

function changeCircleStylecercle() {
    var circle = document.getElementById("circle");

    const element = document.getElementById('circle'); // Remplacez 'mon-element' par l'ID de votre élément HTML
    while (element.classList.length > 0) {
        element.classList.remove(element.classList.item(0));
    }
    circle.style.cssText = 'initial';
    circle.classList.add("coin2");

    var circle2 = document.getElementById("circle2");

    const element2 = document.getElementById('circle2'); // Remplacez 'mon-element' par l'ID de votre élément HTML
    while (element2.classList.length > 0) {
        element2.classList.remove(element2.classList.item(0));
    }
    circle2.style.cssText = 'initial';
    circle2.classList.add("coin2R");
}

function changeCircleStylebasic() {
    var circle = document.getElementById("circle");

    const element = document.getElementById('circle'); // Remplacez 'mon-element' par l'ID de votre élément HTML
    while (element.classList.length > 0) {
        element.classList.remove(element.classList.item(0));
    }
    circle.style.cssText = 'initial';
    circle.classList.add("circle");

    var circle2 = document.getElementById("circle2");

    const element2 = document.getElementById('circle2'); // Remplacez 'mon-element' par l'ID de votre élément HTML
    while (element2.classList.length > 0) {
        element2.classList.remove(element2.classList.item(0));
    }
    circle2.style.cssText = 'initial';
    circle2.classList.add("circle2");
}


var circle = document.getElementById('circle');
var circle2 = document.getElementById('circle2');
var colorSelect = document.getElementById('color-select');

colorSelect.addEventListener('change', function () {
    if (this.value !== '') {
        if (circle.classList.contains("coin3")) {
            circle.style.backgroundImage = "linear-gradient(135deg, " + this.value + " 25%, transparent 25%), linear-gradient(225deg, " + this.value + " 25%, transparent 25%), linear-gradient(45deg, " + this.value + " 25%, transparent 25%), linear-gradient(315deg, " + this.value + " 25%, #46BB9C  25%)";
            circle.setAttribute('data-color', '+this.value+')
            circle2.style.backgroundImage = "linear-gradient(135deg, " + this.value + " 25%, transparent 25%), linear-gradient(225deg, " + this.value + " 25%, transparent 25%), linear-gradient(45deg, " + this.value + " 25%, transparent 25%), linear-gradient(315deg, " + this.value + " 25%, #e46874  25%)";
            circle2.setAttribute('data-color', '+this.value+')
        }
        if (circle.classList.contains("coin4")) {
            circle.style.backgroundImage = "linear-gradient(135deg, " + this.value + " 25%, transparent 25%), linear-gradient(225deg, " + this.value + " 25%, transparent 25%), linear-gradient(45deg, " + this.value + " 25%, transparent 25%), linear-gradient(315deg, " + this.value + " 25%, #46BB9C 25%)";
            circle.setAttribute('data-color', '+this.value+')
            circle2.style.backgroundImage = "linear-gradient(135deg, " + this.value + " 25%, transparent 25%), linear-gradient(225deg, " + this.value + " 25%, transparent 25%), linear-gradient(45deg, " + this.value + " 25%, transparent 25%), linear-gradient(315deg, " + this.value + " 25%, #e46874 25%)";
            circle2.setAttribute('data-color', '+this.value+')
        }
        if (circle.classList.contains("coin5")) {
            circle.style.backgroundImage = "radial-gradient( ellipse farthest-corner at 10px 10px , " + this.value + ", " + this.value + " 50%, #46BB9C 50%)";
            circle.setAttribute('data-color', '+this.value+')
            circle2.style.backgroundImage = "radial-gradient( ellipse farthest-corner at 10px 10px , " + this.value + ", " + this.value + " 50%, #e46874 50%)";
            circle2.setAttribute('data-color', '+this.value+')
        }
        if (circle.classList.contains("coin2")) {
            circle.style.backgroundImage = "repeating-linear-gradient( 45deg, " + this.value + ", " + this.value + " 5px, #46bb9c 5px, #46bb9c 25px )";
            circle.setAttribute('data-color', '+this.value+')
            circle2.style.backgroundImage = "repeating-linear-gradient( 45deg, " + this.value + ", " + this.value + " 5px, #e46874 5px, #e46874 25px )";
            circle2.setAttribute('data-color', '+this.value+')
        }
    }
});

