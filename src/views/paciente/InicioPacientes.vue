<template>
  <div id="vista_agendar_cita" class="flex flex-col justify-between min-h-screen font-nunito text-noxgrey">
    <NavTop />
    <div id="p-patients-home" class="bg-fondo text-noxgrey w-4/5 max-w-[1200px] mx-auto py-20">
      
      <!-- Bienvenida y nombre del paciente -->
      <div id="s-welcome-card" class="flex justify-center font-nunito gap-4">
        <div>
          <img :src="avatar" alt="perfil_usuario" class="w-16 h-16 rounded-full" />
        </div>
        <div>
          <p id="plan-label" class="text-healingblue bg-healingbluelight rounded-b-full inline-block px-3 py-1 text-center">
            Premium
          </p>
          <p class="text-noxgrey mb-1">Bienvenido/a de nuevo,</p>
          <p class="text-medblue mb-1 text-xl font-semibold">{{ nombrePaciente }}</p>
        </div>
      </div>

      <!-- Solicitar citas (se mueve encima de Próximas citas) -->
      <hr class="w-full h-[1px] my-6 bg-gray-300 border-0" />
      <div id="s-request-appointment" class="space-y-3">
        <TituloH2 texto="Solicitar cita" class="text-center" />
        <div class="flex space-x-2 justify-center">
          <!-- Agendar cita con Especialista -->
          <div @click="irAAgendarCitaEspecialista" class="bg-medbluelight rounded-lg flex flex-col justify-center items-center w-28 p-3 cursor-pointer hover:bg-blue-50 transition-colors">
            <img :src="nurse" alt="cita_especialista" class="w-12 h-12 object-contain mx-auto" />
            <span>Especialista</span>
          </div>
          <!-- Agendar cita Online -->
          <div @click="irAAgendarCitaOnline" class="bg-medbluelight rounded-lg flex flex-col justify-center items-center w-28 p-3 cursor-pointer hover:bg-blue-50 transition-colors">
            <img :src="screen" alt="cita_online" class="w-12 h-12 object-contain mx-auto" />
            <span>Online</span>
          </div>
          <!-- Agendar cita con Enfermería (Domicilio) -->
          <div @click="irAAgendarCitaEnfermeria" class="bg-medbluelight rounded-lg flex flex-col justify-center items-center w-28 p-3 cursor-pointer hover:bg-blue-50 transition-colors">
            <img :src="nurse" alt="cita_enfermeria" class="w-12 h-12 object-contain mx-auto" />
            <span>Domicilio</span>
          </div>
        </div>
      </div>

      <!-- Próximas citas (solo si hay citas agendadas) -->
      <hr class="w-full h-[1px] my-6 bg-gray-300 border-0" />
      <div id="s-upcoming-appointments" class="font-nunito flex flex-col items-center space-y-3" v-if="citasLimitadas.length > 0">
        <!-- El título es clickable y redirige a "Ver todas las citas" -->
        <div class="text-center cursor-pointer" @click="irAProximasCitas">
          <TituloH2 texto="Próximas citas >" />
          <p>Hoy es {{ fechaActual }}</p>
        </div>

        <!-- Citas agendadas (contenedor clickable con fondo #F0F9FE) -->
        <div id="appointments-container" class="border border-gray-200 rounded-xl shadow-2xs p-2 space-y-2 w-full">
          <div
            v-for="cita in citasLimitadas"
            :key="cita.id"
            @click="verDetallesCita(cita.id)"
            class="cursor-pointer border border-vitalblue rounded-xl shadow-2xs py-2 px-3 bg-[#F0F9FE] w-full"
          >
            <h2 class="font-bold text-medblue">{{ obtenerTipoCita(cita.appointment_type) }}</h2>
            <div class="flex items-center space-x-2">
              <Calendar class="w-5 h-5 text-gray-600" />
              <p>{{ formatearFecha(cita.appointment_date) }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <Clock class="w-5 h-5 text-gray-600" />
              <p>{{ formatearHora(cita.appointment_time) }}</p>
            </div>
            <p v-if="cita.doctor_id">Doctor: {{ cita.doctor_nombre }}</p>
            <!-- El botón de ver ubicación se mantiene y detiene la propagación del click -->
            <button
              v-if="cita.status === 'accepted'"
              @click.stop="verUbicacionDoctor(cita.id)"
              class="text-blue-500 underline"
            >
              Ver ubicación del doctor
            </button>
          </div>
        </div>
      </div>

      <div class="text-center mt-8">
        <button @click="cerrarSesion" class="text-red-500 hover:text-red-600 underline">
          Cerrar sesión
        </button>
      </div>
    </div>
    <NavBottom />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/config/supabase';
import { format, toDate } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// Components
import NavTop from '@/components/comp_paciente/NavTop.vue';
import NavBottom from '@/components/comp_paciente/NavBottom.vue';
import TituloH2 from '@/components/TituloH2.vue';

// Icons
import { Calendar, Clock } from 'lucide-vue-next';
import nurse from '@/assets/imagenes/nurse.png';
import screen from '@/assets/imagenes/screen.png';
import avatar from '@/assets/imagenes/avatar.png';

const nombrePaciente = ref('');
const fechaActual = ref('');
const citas = ref([]);
const citasLimitadas = ref([]); // Se tomarán las 3 más próximas
const router = useRouter();

// Formateadores con zona horaria de Tijuana
const formatearFecha = (fecha) => {
  try {
    const fechaTijuana = toDate(`${fecha}T00:00:00`, { timeZone: 'America/Tijuana' });
    return format(fechaTijuana, "d 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return 'Fecha inválida';
  }
};

const formatearHora = (hora) => {
  try {
    const [horas, minutos] = hora.split(':');
    const horaTijuana = toDate(`1970-01-01T${horas.padStart(2, '0')}:${minutos}:00`, { timeZone: 'America/Tijuana' });
    return format(horaTijuana, 'HH:mm');
  } catch {
    return 'Hora inválida';
  }
};

const obtenerTipoCita = (tipo) => {
  return tipo === 'online'
    ? 'Cita Online'
    : tipo === 'domicilio'
    ? 'Cita a Domicilio'
    : 'Cita con Especialista';
};

onMounted(async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      router.push('/login');
      return;
    }

    // Obtener nombre del paciente
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('nombre')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      alert('Error al cargar datos del usuario');
      return;
    }

    nombrePaciente.value = userData.nombre || 'Usuario';

    // Obtener citas FUTURAS con datos de doctores
    const hoy = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
    const { data: citasData, error: citasError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_type,
        appointment_date,
        appointment_time,
        status,
        doctor_id,
        doctors!fk_doctor_id (nombre_completo)
      `)
      .eq('user_id', user.id)
      .gte('appointment_date', hoy) // Solo citas futuras
      .order('appointment_date', { ascending: true });

    if (citasError) throw citasError;

    // Se filtran las citas completadas
    citas.value =
      citasData
        ?.filter((cita) => cita.status !== 'completada')
        .map((cita) => ({
          ...cita,
          doctor_nombre: cita.doctors?.nombre_completo || 'No asignado',
          appointment_time: cita.appointment_time?.slice(0, 5) || '--:--'
        })) || [];

    // Limitar a las 3 citas más próximas
    citasLimitadas.value = citas.value.slice(0, 3);

    // Fecha actual en Tijuana
    fechaActual.value = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });
  } catch (error) {
    console.error('Error al cargar datos:', error);
    alert('Error al cargar citas. Inténtalo de nuevo.');
  }
});

const cerrarSesion = async () => {
  await supabase.auth.signOut();
  router.push('/login');
};

// Navegación
const irAAgendarCitaEspecialista = () => router.push('/agendar-cita-especialista');
const irAAgendarCitaOnline = () => router.push('/agendar-cita-online');
const irAAgendarCitaEnfermeria = () => router.push('/agendar-cita-enfermeria');
const irAProximasCitas = () => router.push('/proximas-citas');
const verUbicacionDoctor = (citaId) => {
  alert(`Ver ubicación del doctor para la cita con ID: ${citaId}`);
};
const verDetallesCita = (citaId) => {
  router.push(`/detalles-de-cita/${citaId}`);
};
</script>

<style scoped>
.bg-medbluelight {
  background-color: #e8f2fc;
}
.hover\:bg-blue-50:hover {
  background-color: #f0f8ff;
}
</style>
