let stops = [];
let stopTimes = [];
let trips = [];
let routes = [];
const stationSelect = document.getElementById('stationSelect');
const trainTimesDiv = document.getElementById('trainTimes');

// Cargar datos GTFS y preparar la estructura
function cargarGTFS() {
    Papa.parse('gtfs/stops.txt', {
        download: true,
        header: true,
        complete: function(results) {
            stops = results.data;
            llenarEstaciones();
        }
    });

    Papa.parse('gtfs/stop_times.txt', {
        download: true,
        header: true,
        complete: function(results) {
            stopTimes = results.data;
        }
    });

    Papa.parse('gtfs/trips.txt', {
        download: true,
        header: true,
        complete: function(results) {
            trips = results.data;
        }
    });

    Papa.parse('gtfs/routes.txt', {
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

// Calcular minutos restantes hasta la llegada del tren
function calcularMinutosRestantes(horaLlegada) {
    const [hours, minutes, seconds] = horaLlegada.split(':').map(Number);
    const llegada = new Date();
    llegada.setHours(hours, minutes, seconds);

    const ahora = new Date();
    const diferenciaMilisegundos = llegada - ahora;

    const minutosRestantes = Math.floor(diferenciaMilisegundos / (1000 * 60));
    return minutosRestantes;
}

// Actualizar el teleindicador con los próximos trenes
function actualizarTeleindicador() {
    const estacionSeleccionada = stationSelect.value;
    if (!estacionSeleccionada) return;

    const trenesProximos = stopTimes.filter(st => st.stop_id === estacionSeleccionada);

    // Filtrar trenes que ya han pasado
    const trenesFuturos = trenesProximos.filter(train => calcularMinutosRestantes(train.arrival_time) > 0);

    // Ordenar trenes por hora de llegada
    trenesFuturos.sort((a, b) => new Date(`1970-01-01T${a.arrival_time}Z`) - new Date(`1970-01-01T${b.arrival_time}Z`));

    // Limitar a los próximos 10 trenes
    const proximosDiezTrenes = trenesFuturos.slice(0, 10);

    // Construir HTML
    let html = '';
    proximosDiezTrenes.forEach(train => {
        const trip = trips.find(t => t.trip_id === train.trip_id);
        const route = routes.find(r => r.route_id === trip.route_id);
        const minutosRestantes = calcularMinutosRestantes(train.arrival_time);

        html += `
            <div class="train-info">
                <span class="destino">Destino: ${trip.trip_headsign}</span>
                <span class="minutos">${minutosRestantes} min</span>
            </div>
        `;
    });

    // Actualizar el HTML del teleindicador
    trainTimesDiv.innerHTML = html;
}

// Escuchar cambios en el selector de estaciones
stationSelect.addEventListener('change', actualizarTeleindicador);

// Cargar los datos al iniciar
cargarGTFS();

// Actualizar automáticamente cada 30 segundos
setInterval(actualizarTeleindicador, 30000);  // 30000 ms = 30 segundos
