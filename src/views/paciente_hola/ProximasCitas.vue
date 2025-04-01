<template>
  <div id="vista_citas_agendadas" class="flex flex-col justify-between min-h-screen font-nunito text-noxgrey">
    <NavTop />
    <div id="next_appointments" class="bg-fondo text-noxgrey w-4/5 max-w-[1200px] mx-auto py-20">
      <Titulo texto="Próximas citas"/>
      <!-- Citas agendadas -->
      <div id="citas_agendadas" class="space-y-3">
        <div id="appointments-container" class="border border-gray-200 rounded-xl shadow-2xs p-2 space-y-2 w-full">
          <div v-for="cita in citas" :key="cita.id" class="border border-vitalblue rounded-xl shadow-2xs py-4 px-3 bg-vitalblue w-full text-center space-y-4">
            <TituloH3 :texto="obtenerTipoCita(cita.appointment_type)" />
            <ul>
              <li>Fecha: {{ formatearFecha(cita.appointment_date) }}</li>
              <li>Hora: {{ formatearHora(cita.appointment_time) }}</li>
              <li>Doctor: {{ cita.doctor_nombre }}</li>
              <li>Estado: {{ cita.status }}</li>
            </ul>
            <button @click="verDetallesCita(cita.id)" class="text-blue-500 underline">Ver detalles</button>
          </div>
        </div>
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
import NavTop from '../../components/comp_paciente/NavTop.vue';
import NavBottom from '../../components/comp_paciente/NavBottom.vue';
import Titulo from '../../components/Titulo.vue';
import TituloH3 from '../../components/TituloH3.vue';

const citas = ref([]);
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
  return tipo === 'online' ? 'Cita Online' : tipo === 'domicilio' ? 'Cita a Domicilio' : 'Cita con Especialista';
};

// Función para ver detalles de la cita
const verDetallesCita = (citaId) => {
  router.push(`/detalles-de-cita/${citaId}`);
};

onMounted(async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      router.push('/login');
      return;
    }

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
        doctors!fk_doctor_id (nombre_completo)
      `)
      .eq('user_id', user.id)
      .gte('appointment_date', hoy) // Solo citas futuras
      .order('appointment_date', { ascending: true });

    if (citasError) throw citasError;

    citas.value = citasData?.map(cita => ({
      ...cita,
      doctor_nombre: cita.doctors?.nombre_completo || 'No asignado',
      appointment_time: cita.appointment_time?.slice(0, 5) || '--:--'
    })) || []; // Si no hay citas, asignar un array vacío

  } catch (error) {
    console.error('Error al cargar datos:', error);
    alert('Error al cargar citas. Inténtalo de nuevo.');
  }
});
</script>

<style scoped>
/* Estilos específicos de esta vista */
</style>