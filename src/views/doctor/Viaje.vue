<template>
  <div class="min-h-screen bg-fondo p-6 flex flex-col items-center">
    <NavTopD />
    <div class="max-w-4xl w-full bg-white p-6 rounded-xl shadow-xl mt-4">
      <!-- Si ya se tienen ambas coordenadas, se muestra el mapa -->
      <Mapview 
        v-if="doctorLocation && patientLocation" 
        :doctorLocation="doctorLocation" 
        :patientLocation="patientLocation" 
        class="rounded-xl overflow-hidden"
      />

      <!-- Información de la consulta -->
      <div class="mt-6 space-y-4 text-center">
        <h2 class="text-xl font-bold text-gray-800">En camino a la consulta</h2>
        <p class="text-gray-600"><strong>Paciente:</strong> {{ pacienteNombre }}</p>
        <p class="text-gray-600"><strong>Dirección:</strong> {{ cita.ubicacion || direccionPorDefecto }}</p>
        <p class="text-gray-600"><strong>Tiempo estimado:</strong> {{ tiempoEstimado }}</p>
        
        <!-- Botón para comenzar el viaje -->
        <button 
          @click="registrarConsulta" 
          class="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all">
          Comenzar el viaje
        </button>
      </div>
    </div>
    <NavBottomD />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/config/supabase'
import MapView from '@/components/MapView.vue' // Verifica que la ruta sea correcta
import NavTopD from '@/components/comp_doctor/NavTopD.vue'
import NavBottomD from '@/components/comp_doctor/NavBottomD.vue'
import { Loader } from '@googlemaps/js-api-loader'

const route = useRoute()
const router = useRouter()
const citaId = route.params.id

const cita = ref({})
const pacienteNombre = ref('')
const tiempoEstimado = ref('Calculando...')
const doctorLocation = ref(null)
const patientLocation = ref(null)
const direccionPorDefecto = "P.º del Centenario 9580-9, Zona Urbana Rio Tijuana, 22010 Tijuana, B.C."

const cargarDatos = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients:user_id(nombre, apellido_paterno)')
    .eq('id', citaId)
    .single()

  if (error) {
    console.error("Error al cargar datos de la cita:", error)
    return
  }
  cita.value = data
  pacienteNombre.value = `${data.patients.nombre} ${data.patients.apellido_paterno}`
  if (!cita.value.ubicacion) {
    cita.value.ubicacion = direccionPorDefecto
  }
}

const geocodeAddress = async (google, address) => {
  const geocoder = new google.maps.Geocoder()
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location
        resolve({ lat: location.lat(), lng: location.lng() })
      } else {
        reject("No se pudo geocodificar la dirección: " + status)
      }
    })
  })
}

const computeRouteAndTime = async (google, origin, destination) => {
  const directionsService = new google.maps.DirectionsService()
  return new Promise((resolve, reject) => {
    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          const durationText = result.routes[0].legs[0].duration.text
          resolve(durationText)
        } else {
          reject("Error al calcular la ruta: " + status)
        }
      }
    )
  })
}

const loadMapData = async () => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: "weekly",
  })
  const google = await loader.load()

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        doctorLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        try {
          const patientLoc = await geocodeAddress(google, cita.value.ubicacion)
          patientLocation.value = patientLoc
          const duration = await computeRouteAndTime(google, doctorLocation.value, patientLocation.value)
          tiempoEstimado.value = duration
        } catch (err) {
          console.error(err)
          tiempoEstimado.value = "No disponible"
        }
      },
      (error) => {
        console.error("Error obteniendo geolocalización del doctor:", error)
      },
      { enableHighAccuracy: true }
    )
  } else {
    console.error("Geolocalización no soportada")
  }
}

const registrarConsulta = async () => {
  const { error } = await supabase
    .from('appointments')
    .update({
      status: 'completada',
      fin_consulta: new Date().toISOString()
    })
    .eq('id', citaId)
  if (error) {
    console.error("Error al registrar la consulta:", error)
    return
  }
  router.push(`/registro-cita/${citaId}`)
}

onMounted(async () => {
  await cargarDatos()
  await loadMapData()
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
