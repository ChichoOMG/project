<template>
  <NavTop />
  <div id="Confirm_appointment" class="p-4 max-w-2xl mx-auto">
    <Titulo :texto="tituloConfirmacion" />

    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="space-y-4 text-lg">
        <!-- Fecha -->
        <div class="flex items-center">
          <span class="mr-2">📅</span>
          <span>Fecha: <strong>{{ formattedDate }}</strong></span>
        </div>
        
        <!-- Hora -->
        <div class="flex items-center">
          <span class="mr-2">⏰</span>
          <span>Hora: <strong>{{ route.query.hora }} hrs</strong></span>
        </div>
        
        <!-- Profesional asignado -->
        <div class="flex items-center">
          <span class="mr-2">👩⚕️</span>
          <span>Profesional: <strong>{{ nombreProfesional }}</strong></span>
        </div>
        
        <!-- Tipo de cita -->
        <div class="flex items-center">
          <span class="mr-2">💻</span>
          <span>Modalidad: <strong>{{ tipoCitaFormateado }}</strong></span>
        </div>

        <!-- Enlace de Google Meet (solo para online) -->
        <div v-if="tipoCita === 'online'" class="flex items-center">
          <span class="mr-2">🌐</span>
          <span>Enlace de Google Meet: <strong><a :href="googleMeetLink" target="_blank">{{ googleMeetLink }}</a></strong></span>
        </div>

        <!-- Especialidad (solo para especialista) -->
        <div v-if="tipoCita === 'especialista'" class="flex items-center">
          <span class="mr-2">🏥</span>
          <span>Especialidad: <strong>{{ route.query.especialidad || 'No especificada' }}</strong></span>
        </div>

        <!-- Método de pago (solo para domicilio) -->
        <div v-if="tipoCita === 'domicilio' && route.query.metodoPago" class="flex items-center">
          <span class="mr-2">💳</span>
          <span>Método de pago: <strong>{{ metodoPagoFormateado }}</strong></span>
        </div>
      </div>
    </div>

    <!-- Botones -->
    <div class="flex gap-4 justify-end">
      <button @click="cancelarCita" class="btn-cancelar">Cancelar</button>
      <button @click="confirmarCita" class="btn-confirmar">Confirmar</button>
    </div>
  </div>
  <NavBottom />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/config/supabase';

const router = useRouter();
const route = useRoute();

// Datos de la cita
const nombreProfesional = ref('');
const doctorId = ref(null);
const tipoCita = computed(() => route.query.modalidad || 'online');
const googleMeetLink = ref('');

// Título dinámico
const tituloConfirmacion = computed(() => {
  return tipoCita.value === 'especialista' 
    ? 'Confirmar cita con especialista' 
    : 'Confirmar cita';
});

// Formateadores
const formattedDate = computed(() => {
  if (!route.query.fecha) return 'Fecha no seleccionada';
  const fechaLocal = parseISO(route.query.fecha + 'T00:00:00');
  return format(fechaLocal, "d 'de' MMMM 'de' yyyy", { locale: es });
});

const tipoCitaFormateado = computed(() => {
  const tipos = {
    'online': 'Consulta Online',
    'domicilio': 'Visita a Domicilio',
    'especialista': 'Consulta con Especialista'
  };
  return tipos[tipoCita.value] || tipoCita.value;
});

const metodoPagoFormateado = computed(() => {
  return route.query.metodoPago === 'efectivo' ? 'Efectivo' : 'Tarjeta';
});

// Función para generar enlace de Google Meet
const generateGoogleMeetLink = () => {
  const randomString = Math.random().toString(36).substring(2, 15);
  return `https://meet.google.com/${randomString}`;
};

// Obtener profesional según tipo de cita
const obtenerProfesional = async () => {
  try {
    if (tipoCita.value === 'especialista') {
      nombreProfesional.value = route.query.doctorNombre || 'Especialista no asignado';
      doctorId.value = route.query.doctorId || null;
      return;
    }

    const profesionales = {
      online: {
        nombre: 'María José Alvarado Escobar',
        email: 'mariajoseae19@gmail.com'
      },
      domicilio: {
        nombre: 'Juan José Moreno Argueta',
        email: 'canamash83@gmail.com'
      }
    };

    const profesional = profesionales[tipoCita.value];
    if (!profesional) return;

    const { data, error } = await supabase
      .from('doctors')
      .select('id, nombre_completo')
      .eq('correo', profesional.email)
      .single();

    if (error) throw error;
    
    nombreProfesional.value = data.nombre_completo;
    doctorId.value = data.id;
  } catch (error) {
    console.error('Error al asignar profesional:', error);
    alert('Error al cargar información del profesional');
    router.push('/dashboard-paciente');
  }
};

// Confirmar cita en Supabase
const confirmarCita = async () => {
  try {
    if (!doctorId.value || !route.query.fecha || !route.query.hora) {
      throw new Error('Datos incompletos');
    }

    const { data: citasExistentes, error: errorCitas } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId.value)
      .eq('appointment_date', route.query.fecha)
      .eq('appointment_time', route.query.hora + ':00')
      .neq('status', 'cancelada');

    if (citasExistentes?.length > 0) {
      alert('Horario no disponible');
      return;
    }

    // Generar enlace de Google Meet solo para citas online
    let meetLink = '';
    if (tipoCita.value === 'online') {
      meetLink = generateGoogleMeetLink();
    }

    const citaData = {
      user_id: (await supabase.auth.getUser()).data.user.id,
      doctor_id: doctorId.value,
      appointment_type: tipoCita.value,
      appointment_date: route.query.fecha,
      appointment_time: route.query.hora + ':00',
      status: 'agendada',
      created_at: new Date().toISOString(),
      google_meet_link: meetLink || null, // Guardar el enlace de Google Meet si es online
    };

    if (tipoCita.value === 'domicilio') {
      citaData.metodo_pago = route.query.metodoPago || null;
    }

    if (tipoCita.value === 'especialista') {
      citaData.especialidad = route.query.especialidad || null;
    }

    const { error } = await supabase.from('appointments').insert([citaData]);

    if (error) throw error;

    alert('Cita agendada correctamente');
    router.push('/dashboard-paciente');
  } catch (error) {
    console.error('Error al guardar cita:', error);
    alert(error.message || 'Error al guardar la cita');
  }
};

const cancelarCita = () => {
  router.push('/dashboard-paciente');
};

// Inicialización
onMounted(() => {
  obtenerProfesional();
  if (tipoCita.value === 'online') {
    googleMeetLink.value = generateGoogleMeetLink();
  }
});
</script>

<style scoped>
.btn-confirmar {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
}

.btn-cancelar {
  background-color: #dc3545;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
}
</style>