let addresses =
JSON.parse(localStorage.getItem("zustellerData")) || [];
let collapsed =
JSON.parse(
    localStorage.getItem("collapsedCities")
) || {};
let map = null;
let markers = [];
let markerObjects = [];

const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const greenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
function showMap(){

    const mapDiv =
    document.getElementById("map");

    mapDiv.style.display = "block";

    if(map){
        return;
    }

    map = L.map("map")
    .setView([53.647,7.612],11);

    L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
        "&copy; OpenStreetMap"
    }).addTo(map);
    updateMapMarkers();
}
function toggleMap(){

    const mapDiv =
    document.getElementById("map");

    if(mapDiv.style.display === "none" ||
       mapDiv.style.display === ""){

        showMap();

    }else{

        mapDiv.style.display = "none";
    }
}
async function geocodeAddress(address){

    const url =
    "https://nominatim.openstreetmap.org/search?format=json&q="
    + encodeURIComponent(address);

    const response = await fetch(url);

    const data = await response.json();

    if(data.length > 0){

        return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
        };
    }

    return null;
}

function updateMapMarkers(){

    if(!map) return;

    markers.forEach(marker => {
        map.removeLayer(marker);
    });

    markers = [];
markerObjects = [];
    addresses.forEach(a => {

        if(a.lat && a.lon){

            const marker =
L.marker(
    [a.lat,a.lon],
    {
        icon: a.done ? greenIcon : redIcon
    }
)
            .addTo(map)
            .bindPopup(
`
<b>${a.street} ${a.number}</b><br>
${a.city}<br><br>

<button onclick="navigateTo(${addresses.indexOf(a)})">
🧭 Navigation
</button>

<button onclick="toggleDone(${addresses.indexOf(a)})">
${a.done ? "↩️ Offen" : "✅ Erledigt"}
</button>
`
);

            markers.push(marker);markerObjects.push({
    marker: marker,
    address: a
});
        }
    });

    if(markers.length > 0){

        const group =
        L.featureGroup(markers);

        map.fitBounds(
            group.getBounds(),
            { padding:[20,20] }
        );
    }
}
function save(){
    localStorage.setItem(
        "zustellerData",
        JSON.stringify(addresses)
    );
}
function saveCollapsed(){

    localStorage.setItem(
        "collapsedCities",
        JSON.stringify(collapsed)
    );
}
async function addAddress(){

    const city =
    document.getElementById("cityInput").value.trim();

    const street =
    document.getElementById("streetInput").value.trim();

    const number =
    document.getElementById("numberInput").value.trim();

    const note =
    document.getElementById("noteInput").value.trim();

    if(!city || !street){
        alert("Bitte Ort und Straße eingeben");
        return;
    }

    addresses.push({
    city,
    street,
    number,
    note,
    done:false,
    lat:null,
    lon:null
});
const newAddress =
addresses[addresses.length - 1];

const result =
await geocodeAddress(

    newAddress.street + " " +
    newAddress.number + ", " +
    newAddress.city +
    ", Niedersachsen, Deutschland"

);
console.log(result);
if(result){

    newAddress.lat = result.lat;
    newAddress.lon = result.lon;
}
console.log(newAddress);
    save();
    render();
updateMapMarkers();
    document.getElementById("cityInput").value="";
    document.getElementById("streetInput").value="";
    document.getElementById("numberInput").value="";
    document.getElementById("noteInput").value="";
}

function toggleDone(index){

    addresses[index].done =
    !addresses[index].done;

    save();
    render();
    updateMapMarkers();
}

function deleteAddress(index){

    if(confirm("Adresse löschen?")){

        addresses.splice(index,1);

        save();
        render();
        updateMapMarkers();
    }
}

function toggleGroup(city){

    collapsed[city] =
    !collapsed[city];

    saveCollapsed();

    render();
}

function editAddress(index){

    const a = addresses[index];

    const city =
    prompt("Ort:", a.city);

    if(city === null) return;

    const street =
    prompt("Straße:", a.street);

    if(street === null) return;

    const number =
    prompt("Hausnummer:", a.number);

    if(number === null) return;

    const note =
    prompt("Notiz:", a.note);

    if(note === null) return;

    a.city = city;
    a.street = street;
    a.number = number;
    a.note = note;

    save();
    render();
}

function moveUp(index){

    if(index === 0) return;

    [addresses[index], addresses[index - 1]] =
    [addresses[index - 1], addresses[index]];

    save();
    render();
}

function moveDown(index){

    if(index === addresses.length - 1) return;

    [addresses[index], addresses[index + 1]] =
    [addresses[index + 1], addresses[index]];

    save();
    render();
}
function navigateTo(index){

    const a = addresses[index];

    const ziel =
        a.street + " " +
        a.number + ", " +
        a.city;

    window.open(
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(ziel),
        "_blank"
    );
}

function nextOpenAddress(){

    const next =
    addresses.find(a => !a.done);

    if(!next){
        alert("🎉 Alle Adressen wurden erledigt!");
        return;
    }

    const ziel =
        next.street + " " +
        next.number + ", " +
        next.city;

    window.open(
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(ziel),
        "_blank"
    );
}

function showNextOpenAddress(){

    const next =
    addresses.find(a => !a.done);

    if(!next){

        alert("🎉 Alle Adressen erledigt!");
        return;
    }

    showMap();

    const markerData =
    markerObjects.find(
        m => m.address === next
    );

    if(markerData){

        map.setView(
            [next.lat, next.lon],
            18
        );

        markerData.marker.openPopup();
    }
}
function exportData(){

    const data =
    JSON.stringify(addresses, null, 2);

    const blob =
    new Blob([data], {
        type:"application/json"
    });

    const url =
    URL.createObjectURL(blob);

    const a =
    document.createElement("a");

    a.href = url;

    a.download =
    "zusteller-backup.json";

    a.click();

    URL.revokeObjectURL(url);
}

function importData(event){

    const file =
    event.target.files[0];

    if(!file) return;

    const reader =
    new FileReader();

    reader.onload = function(e){

        try{

            const imported =
            JSON.parse(e.target.result);

            if(!Array.isArray(imported)){
                throw new Error();
            }

            if(confirm(
                "Vorhandene Daten überschreiben?"
            )){

                addresses = imported;

                save();
                render();

                alert(
                    "Import erfolgreich!"
                );
            }

        }catch{

            alert(
                "Ungültige Datei!"
            );
        }

    };

    reader.readAsText(file);
}
function sortByCity(){

    addresses.sort((a,b)=>{

        const cityCompare =
        a.city.localeCompare(b.city);

        if(cityCompare !== 0){
            return cityCompare;
        }

        return a.street.localeCompare(b.street);
    });

    save();
    render();
}
function sortByStreet(){

    addresses.sort((a,b)=>{

        const streetCompare =
        a.street.localeCompare(b.street);

        if(streetCompare !== 0){
            return streetCompare;
        }

        return a.number.localeCompare(b.number);
    });

    save();
    render();
}
async function importPdf(){

    const file =
    document.getElementById("pdfFile").files[0];

    if(!file){

        alert("Bitte zuerst eine PDF auswählen.");
        return;
    }

    const reader =
    new FileReader();

    reader.onload = async function(){

        const typedArray =
        new Uint8Array(reader.result);

        const pdf =
        await pdfjsLib.getDocument({
            data: typedArray
        }).promise;

        let fullText = "";

        for(
            let pageNum = 1;
            pageNum <= pdf.numPages;
            pageNum++
        ){

            const page =
            await pdf.getPage(pageNum);

            const textContent =
            await page.getTextContent();

            const pageText =
            textContent.items
            .map(item => item.str)
            .join(" ");

            fullText += pageText + "\n";
        }

       const matches =
fullText.match(
    /([A-Za-zÄÖÜäöüß\s\-]+),\s+([A-Za-zÄÖÜäöüß\s\-]+)\s+(\d+)/g
);
matches.forEach(entry => {

    const clean =
    entry.replace(/\s+/g, " ").trim();

    const match =
    clean.match(
        /(.*),\s(.*)\s(\d+)$/
    );

    if(match){

        addresses.push({
            city: match[2],
            street: match[1],
            number: match[3],
            note: "PDF Import",
            done: false,
            lat: null,
            lon: null
        });
    }
});

save();
render();

alert(
    matches.length +
    " Adressen importiert"
);
console.log(matches);

        alert(
            "PDF erfolgreich gelesen. Öffne F12 → Konsole."
        );
    };

    reader.readAsArrayBuffer(file);
}
function render(){

    const search =
    document.getElementById("searchInput")
    .value
    .toLowerCase();

    const app =
    document.getElementById("app");

    app.innerHTML = "";

    const total = addresses.length;

const done =
addresses.filter(a => a.done).length;

const percent =
total ? Math.round(done / total * 100) : 0;

document.getElementById("stats").innerHTML =
`Gesamt: ${total} | Erledigt: ${done} | Offen: ${total-done} | ${percent}%`;

document.getElementById("bar").style.width =
percent + "%";

    const cities =
    [...new Set(addresses.map(a => a.city))]
    .sort();

    cities.forEach(city=>{

        const cityAddresses =
        addresses.filter(a=>a.city===city);

        let html = `
<div class="card">

<h2
style="cursor:pointer"
onclick="toggleGroup('${city}')">

${collapsed[city] ? '▶' : '▼'}
${city}
(${cityAddresses.length})

</h2>
`;

        if(!collapsed[city]){

    cityAddresses.forEach(a=>{

        const index =
        addresses.indexOf(a);

        const text =
        (
            a.city + " " +
            a.street + " " +
            a.number + " " +
            a.note
        ).toLowerCase();

        if(search && !text.includes(search)){
            return;
        }

        html += `
        <div class="${a.done ? 'done' : ''}">

            <b>${a.street} ${a.number}</b><br>

            ${a.note}<br><br>

            <div class="actions">

                <button onclick="moveUp(${index})">⬆️</button>

<button onclick="moveDown(${index})">⬇️</button>

<button onclick="navigateTo(${index})">🧭</button>

<button onclick="editAddress(${index})">✏️</button>

<button onclick="toggleDone(${index})">✅</button>

<button onclick="deleteAddress(${index})">🗑️</button>

            </div>

            <hr>

        </div>
        `;
    });

}
        html += `</div>`;

        app.innerHTML += html;
    });
}
render();