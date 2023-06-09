//Appel API parkings relais - DATA NANTES METRO
async function fetchParkingRelais() {
    let response = await fetch('https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_parcs-relais-nantes-metropole-disponibilites&q=&facet=grp_nom&facet=grp_statut')
    let parkingsRelais = await response.json()
    let list = document.getElementById("parkingsRelais")

    const parkingsTab = parkingsRelais.records
    console.log(parkingsTab)
    let Tab = 1
    for (const parking of parkingsTab) {
        console.log(parking.fields.grp_nom)
        //calcul du pourcentage d'occupation pour la progress bar
        let dispo = parking.fields.disponibilite
        let total = parking.fields.grp_exploitation
        let diff = total - dispo
        let pourcentageRestant = Math.floor((diff / total) * 100)
        console.log("coucou " + pourcentageRestant + "% libre")

        list.innerHTML += '<div class = div' + Tab + '>' + " " + " " + parking.fields.grp_nom + " " + '<br>' + " " + parking.fields.disponibilite + " places restantes" + '<br>' + `<div class="progressBar" style = "background-color: rgb(67, 67, 67); border-radius: 13px; height: 5px; width: 100px; padding: 3px"><div style="width: ${pourcentageRestant}%; background-color: rgb(107, 161, 211); height: 5px; border-radius: 10px" ;></div></div>` + '</div>'


        Tab = Tab + 1

    }
}

//Appel API parkings publics - DATA NANTES METRO
async function fetchParkingPublics() {
    let response = await fetch('https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_parkings-publics-nantes-disponibilites&q=&lang=fr&rows=31&facet=grp_nom&facet=grp_statut&timezone=Europe%2FParis')
    let parkingsPublics = await response.json()
    // parkingsPublics = JSON.stringify(parkingsPublics)
    console.log('COUCOU', parkingsPublics)

    let list = document.getElementById("parkingsPublics")
    let titre1 = document.getElementById("Titre")
    titre1.style.visibility = "visible";

    let titre2 = document.getElementById("title")
    titre2.style.visibility = "visible";


    const parkingsTab = parkingsPublics.records
    console.log(parkingsTab)
    let Tab = 1
    for (const parking of parkingsTab) {
        console.log(parking.fields.grp_nom)
        //calcul du pourcentage d'occupation pour la progress bar
        let dispo = parking.fields.disponibilite
        let total = parking.fields.grp_exploitation

        if (dispo < 0) {
            dispo = 0
        }

        let diff = total - dispo
        let pourcentageRestant = Math.floor((diff / total) * 100)
        console.log("coucou " + pourcentageRestant + "% libre")

        list.innerHTML += '<div class = div' + Tab + '>' + " " + " " + parking.fields.grp_nom + " " + '<br>' + " " + dispo + " places restantes" + '<br>' + `<div class="progressBar" style = "background-color: rgb(67, 67, 67); border-radius: 13px; height: 5px; width: 100px; padding: 3px"><div style="width: ${pourcentageRestant}%; background-color: rgb(107, 161, 211); height: 5px; border-radius: 10px" ;></div></div>` + '</div>'
        Tab = Tab + 1

    }
}



// JS de la carte

const map = L.map('map').setView([47.212913, -1.553155], 12)

// Fond de carte
const jawg_sunny_tile = L.tileLayer('https://{s}.tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
    attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 0,
    maxZoom: 22,
    subdomains: 'abcd',
    accessToken: 'uesZRFXoS2UvhGObjjQrTqMnp1CcgqSfpgwNseDZQvWhPMyeNVcxhukBJSivVk9V'
}).addTo(map)

const legend = L.control({ position: "bottomleft" });

legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Fluidité des axes routiers</h4>";
    div.innerHTML += '<i style="background: #FFFFFF"></i><span>Indéterminé</span><br>';
    div.innerHTML += '<i style="background: #008000"></i><span>Fluide</span><br>';
    div.innerHTML += '<i style="background: #FFFF00"></i><span>Dense</span><br>';
    div.innerHTML += '<i style="background: #FF8C00"></i><span>Saturé</span><br>';
    div.innerHTML += '<i style="background: #FF0000"></i><span>Bloqué</span><br>';
    return div;
};

legend.addTo(map);

// Fetch API + affichage des données sur la carte
async function fetchRoads() {
    const response = await fetch("https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_fluidite-axes-routiers-nantes-metropole&q=&rows=842&facet=couleur_tp")
    const data = await response.json()

    for (const road of data.records) {
        let latlngs = []
        const roadColor = road.fields.couleur_tp
        let mapColor = "0"
        const roadName = road.fields.cha_lib
        const roadLength = road.fields.cha_long
        const avrgSpeed = road.fields.mf1_vit
        const numberOfCars = road.fields.mf1_debit

        for (const roadCoordinates of road.fields.geo_shape.coordinates) {
            latlngs.push(roadCoordinates.reverse())
        }

        if (roadColor === "3") {
            mapColor = "green"
        } else if (roadColor === "4") {
            mapColor = "yellow"
        } else if (roadColor === "5") {
            mapColor = "darkorange"
        } else if (roadColor === "6") {
            mapColor = "red"
        }

        let polyline = L.polyline(latlngs, { color: mapColor, weight: 2 }).addTo(map)

        polyline.bindPopup("<b>Nom du tronçon :</b><br/>" + roadName + "<br/><br/><b>Longueur du tronçon (en m) :</b><br/>" + roadLength
            + "<br/><br/><b>Vitesse moyenne (en km/h) :</b></br/>" + avrgSpeed + "<br/><br/><b>Débit de voitures :</b></br/>" + numberOfCars)
    }

}


//Affichage de l'heure
fetchRoads()

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    m = checkTime(m);
    document.getElementById('time').innerHTML =
        "Il est " + h + "h" + m;
    var t = setTimeout(startTime, 500);
}
function checkTime(i) {
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
    return i;
}

startTime();