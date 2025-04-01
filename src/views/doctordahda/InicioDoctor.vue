<template>
  <div id="vista_inicio_doctores" class="flex flex-col justify-between min-h-screen font-nunito text-noxgrey">
    <NavTopD />
    <!-- Se aumenta el padding inferior para que no quede tapado por NavBottom -->
    <div id="contenedor_inicio" class="bg-fondo text-noxgrey w-4/5 max-w-[1200px] mx-auto pt-20 pb-32">
      <!-- Bienvenida y nombre del doctor -->
      <div id="s-welcome-card" class="flex justify-center font-nunito gap-4">
        <div>
          <img :src="avatar" alt="perfil_usuario" class="w-16 h-16 rounded-full" />
        </div>
        <div>
          <p id="plan-label" class="text-healingblue bg-healingbluelight rounded-b-full inline-block px-3 py-1 text-center">
            {{ especialidadDoctor }}
          </p>
          <p class="text-noxgrey mb-1">Bienvenido/a de nuevo,</p>
          <p class="text-medblue mb-1 text-xl font-semibold">{{ nombreDoctor }}</p>
        </div>
      </div>

      <!-- Próximas citas -->
      <hr class="w-full h-[1px] my-6 bg-gray-300 border-0">

      <div id="s-upcoming-appointments" class="font-nunito flex flex-col items-center space-y-3" v-if="citasPendientes.length > 0">
        <div class="text-center">
          <TituloH2 texto="Agenda" />
          <p>Hoy es {{ fechaActual }}</p>
        </div>

        <!-- Citas agendadas (se muestran máximo 3) -->
        <div id="appointments-container" class="border border-gray-200 rounded-xl shadow-2xs p-2 space-y-2 w-full">
          <div v-for="cita in citasPendientes.slice(0, 3)" :key="cita.id" class="border border-vitalblue rounded-xl shadow-2xs py-2 px-3 bg-white w-full">
            <!-- Encabezado: Tipo de consulta y, si corresponde, botón "En curso" -->
            <div class="flex items-center space-x-2">
              <h2 class="font-bold text-medblue">{{ obtenerTipoCita(cita.appointment_type) }}</h2>
              <button 
                v-if="cita.status === 'en_proceso'" 
                @click="continuarConsulta(cita.id)"
                class="bg-[#76C7D0] text-white rounded-full px-2 py-1 text-xs">
                En curso
              </button>
            </div>
            <div class="flex items-center space-x-2">
              <Calendar class="w-5 h-5 text-gray-600" />
              <p>{{ formatearFecha(cita.appointment_date) }}</p>
              <span v-if="esHoy(cita.appointment_date)" class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Hoy</span>
            </div>
            <div class="flex items-center space-x-2">
              <Clock class="w-5 h-5 text-gray-600" />
              <p>{{ formatearHora(cita.appointment_time) }}</p>
              <span v-if="cita.estaPorComenzar" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Próxima</span>
            </div>
            <p>Paciente: {{ cita.paciente_nombre || 'No asignado' }}</p>
            <!-- Estado solo se muestra para estados distintos a 'en_proceso' -->
            <p v-if="cita.status !== 'en_proceso'">Estado: <span :class="claseEstado(cita.status)">{{ formatearEstado(cita.status) }}</span></p>
            
            <!-- Mostrar link de Google Meet para citas online cuando falten 10 min -->
            <div v-if="cita.mostrarMeetLink" class="mt-2 p-2 bg-blue-50 rounded-lg">
              <p class="text-blue-800">La consulta comenzará pronto</p>
              <p class="text-sm">
                <a :href="cita.google_meet_link" target="_blank" class="text-blue-600 underline">Unirse a Google Meet</a>
              </p>
            </div>

            <div class="flex justify-end space-x-2 mt-2">
              <!-- Botón Iniciar Consulta (sólo si la cita está agendada y no hay otra consulta en curso) -->
              <button 
                v-if="cita.status === 'agendada' && cita.appointment_type === 'online'"
                @click="iniciarConsulta(cita.id)" 
                :disabled="hayConsultaEnProceso"
                class="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                Iniciar consulta
              </button>
              
              <!-- Botón Iniciar Viaje (sólo si la cita está agendada y no hay otra consulta en curso) -->
              <button 
                v-if="cita.status === 'agendada' && cita.appointment_type !== 'online'"
                @click="iniciarViaje(cita.id)" 
                :disabled="hayConsultaEnProceso"
                class="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                Iniciar viaje
              </button>
            </div>
          </div>
        </div>

        <!-- Botón para ver todas las citas -->
        <div class="w-full flex justify-center mt-4">
          <button 
            @click="verTodasLasCitas"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Ver todas las citas
          </button>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-gray-500">No tienes citas agendadas pendientes</p>
      </div>
    </div>
    <NavBottomD />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/config/supabase';
import { format, parseISO, isToday, toDate, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

// Components
import NavTopD from '@/components/comp_doctor/NavTopD.vue';
import NavBottomD from '@/components/comp_doctor/NavBottomD.vue';
import TituloH2 from '@/components/TituloH2.vue';

// Icons
import { Calendar, Clock } from 'lucide-vue-next';
import avatar from '@/assets/imagenes/avatar.png';

const nombreDoctor = ref(localStorage.getItem('doctorNombre') || 'Doctor');
const especialidadDoctor = ref(localStorage.getItem('doctorEspecialidad') || 'Especialidad');
const fechaActual = ref('');
const citasPendientes = ref([]);
const router = useRouter();

// Computado para saber si hay alguna consulta en proceso
const hayConsultaEnProceso = computed(() => {
  return citasPendientes.value.some(cita => cita.status === 'en_proceso');
});

// Formateadores
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
    const horaFormateada = hora.includes(':') ? hora : `${hora}:00`;
    const [horas, minutos] = horaFormateada.split(':');
    const horaTijuana = toDate(`1970-01-01T${horas.padStart(2, '0')}:${minutos}:00`, { timeZone: 'America/Tijuana' });
    return format(horaTijuana, 'HH:mm');
  } catch {
    return 'Hora inválida';
  }
};

const esHoy = (fecha) => {
  return isToday(parseISO(fecha));
};

const obtenerTipoCita = (tipo) => {
  const tipos = {
    'online': 'Consulta Online',
    'domicilio': 'Visita a Domicilio',
    'especialista': 'Consulta Especializada'
  };
  return tipos[tipo] || tipo;
};

const formatearEstado = (estado) => {
  const estados = {
    'agendada': 'Agendada',
    'aceptada': 'Aceptada',
    'rechazada': 'Rechazada',
    'en_proceso': 'En curso',
    'completada': 'Completada',
    'cancelada': 'Cancelada'
  };
  return estados[estado] || estado;
};

const claseEstado = (estado) => {
  const clases = {
    'agendada': 'text-yellow-600',
    'aceptada': 'text-green-600',
    'rechazada': 'text-red-600',
    'en_proceso': 'text-blue-600',
    'completada': 'text-gray-600',
    'cancelada': 'text-red-400'
  };
  return clases[estado] || 'text-gray-600';
};

// Cargar citas del doctor con verificación de tiempo
const cargarCitasDoctor = async () => {
  try {
    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) {
      router.push('/dashboard-doctor');
      return;
    }

    const hoy = format(new Date(), 'yyyy-MM-dd');
    const ahora = new Date();
    
    const { data: citas, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_type,
        appointment_date,
        appointment_time,
        status,
        user_id,
        patients:user_id(nombre, apellido_paterno, apellido_materno),
        especialidad,
        google_meet_link,
        ubicacion
      `)
      .eq('doctor_id', doctorId)
      .in('status', ['agendada', 'en_proceso'])
      .gte('appointment_date', hoy)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) throw error;

    citasPendientes.value = citas.map(cita => {
      const fechaCita = new Date(`${cita.appointment_date}T${cita.appointment_time}`);
      const minutosRestantes = differenceInMinutes(fechaCita, ahora);
      const mostrarMeetLink = cita.appointment_type === 'online' && minutosRestantes <= 10 && minutosRestantes > 0;
      const estaPorComenzar = minutosRestantes <= 30 && minutosRestantes > 0;
      
      return {
        ...cita,
        paciente_nombre: cita.patients 
          ? `${cita.patients.nombre} ${cita.patients.apellido_paterno || ''} ${cita.patients.apellido_materno || ''}`.trim()
          : 'No asignado',
        mostrarMeetLink,
        estaPorComenzar
      };
    });

    fechaActual.value = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

  } catch (error) {
    console.error('Error al cargar citas:', error);
    alert('Error al cargar las citas. Inténtalo nuevamente.');
  }
};

const iniciarConsulta = async (citaId) => {
  try {
    // Solo se permite iniciar la consulta si no hay otra en proceso
    if (hayConsultaEnProceso.value) return;

    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: 'en_proceso',
        inicio_consulta: new Date().toISOString()
      })
      .eq('id', citaId);

    if (error) throw error;

    router.push({
      name: 'RegistroCita',
      params: { id: citaId }
    });

  } catch (error) {
    console.error('Error al iniciar consulta:', error);
    alert('Error al iniciar la consulta. Verifica la consola para más detalles.');
  }
};

const continuarConsulta = async (citaId) => {
  try {
    router.push({
      name: 'RegistroCita',
      params: { id: citaId }
    });
  } catch (error) {
    console.error('Error al continuar consulta:', error);
  }
};

const iniciarViaje = async (citaId) => {
  try {
    // Solo se permite iniciar el viaje si no hay otra consulta en proceso
    if (hayConsultaEnProceso.value) return;

    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: 'en_proceso',
        inicio_consulta: new Date().toISOString()
      })
      .eq('id', citaId);

    if (error) throw error;

    router.push({
      name: 'Viaje',
      params: { id: citaId }
    });

  } catch (error) {
    console.error('Error al iniciar viaje:', error);
  }
};

// Navegar a la vista de "Próximas citas" donde se muestran todas las citas completas
const verTodasLasCitas = () => {
  router.push({ name: 'CitasAgendadas' });
};

// Suscripción a cambios en tiempo real y verificación periódica
onMounted(() => {
  cargarCitasDoctor();
  
  // Verificar cada minuto para mostrar notificaciones
  const intervalo = setInterval(cargarCitasDoctor, 60000);
  
  const channel = supabase
    .channel('appointments_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'appointments',
      filter: `doctor_id=eq.${localStorage.getItem('doctorId')}`
    }, () => cargarCitasDoctor())
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
    clearInterval(intervalo);
  };
});
</script>
