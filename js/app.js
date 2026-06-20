let addresses =
JSON.parse(localStorage.getItem("zustellerData")) || [];
let collapsed = {};

function save(){
    localStorage.setItem(
        "zustellerData",
        JSON.stringify(addresses)
    );
}

function addAddress(){

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
        done:false
    });

    save();
    render();

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
}

function deleteAddress(index){

    if(confirm("Adresse löschen?")){

        addresses.splice(index,1);

        save();
        render();
    }
}

function toggleGroup(city){

    collapsed[city] =
    !collapsed[city];

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