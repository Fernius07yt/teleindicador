// Cargar datos GTFS y preparar la estructura
const stationSelect = document.getElementById('stationSelect');
const trainTimesDiv = document.getElementById('trainTimes');

let stops = [];
let stopTimes = [];
let trips = [];
let routes = [];

function cargarGTFS() {
    Papa.parse('stops.txt', {
        download: true,
        header: true,
        complete: function(results) {
            stops = results.data;
            llenarEstaciones();
        }
    });

    Papa.parse('stop_times.txt', {
        download: true,
        header: true,
        complete: function(results) {
            stopTimes = results.data;
        }
    });

    Papa.parse('trips.txt', {
        download: true,
        header: true,
        complete: function(results) {
            trips = results.data;
        }
    });

    Papa.parse('routes.txt', {
        download: true,
        header: true,
        complete: function(results) {
            routes = results.data;
        }
    });
}

// Llenar el selector con las estaciones
function llenarEstaciones() {
    stops.forEach(stop => {
        const option = document.createElement('option');
        option.value = stop.stop_id;
        option.text = stop.stop_name;
        stationSelect.appendChild(option);
    });
}

// Actualizar el teleindicador con los próximos trenes
function actualizarTeleindicador() {
    const estacionSeleccionada = stationSelect.value;
    const trenesProximos = stopTimes.filter(st => st.stop_id === estacionSeleccionada);

    let html = '';
    trenesProximos.forEach(train => {
        const trip = trips.find(t => t.trip_id === train.trip_id);
        const route = routes.find(r => r.route_id === trip.route_id);
        const horaLlegada = train.arrival_time;

        html += `Línea: ${route.route_short_name}, Destino: ${trip.trip_headsign}, Hora de llegada: ${horaLlegada}\n`;
    });

    trainTimesDiv.innerHTML = html;
}

// Escuchar cambios en el selector de estaciones
stationSelect.addEventListener('change', actualizarTeleindicador);

// Cargar los datos al iniciar
cargarGTFS();
