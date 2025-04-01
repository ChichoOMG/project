<template>
  <div id="next_appointments" class="flex flex-col justify-between min-h-screen font-nunito text-noxgrey">
    <NavTop />
    <div id="detalles_citas_agendadas" class="bg-fondo text-noxgrey w-4/5 max-w-[1200px] mx-auto py-20 pb-32">
      <Titulo texto="Detalles de cita" />
      <!-- Detalles de la cita -->
      <div id="appointment-container-info" class="space-y-3">
        <div id="appointment-info" class="border border-vitalblue rounded-xl shadow-2xs py-4 px-6 bg-vitalblue w-full text-center space-y-4">
          <!-- Titulo e info general -->
          <TituloH3 :texto="tituloCita" />
          <ul>
            <li>Modalidad: {{ modalidad }}</li>
            <li>Fecha: {{ formatearFecha(cita.appointment_date) }}</li>
            <li>Hora: {{ horaEscogida }}</li>
            <li>Ubicación: {{ ubicacionPaciente }}</li>
          </ul>

          <!-- Personal asignado -->
          <div id="a-d-personal" class="bg-white border text-noxgrey border-vitalblue rounded-xl relative p-4 space-y-4">
            <h3 class="font-montserrat font-bold text-center">Personal asignado</h3>
            <Info class="absolute top-4 right-4" />
            <hr>
            <div id="a-d-p-card" class="flex space-x-4 justify-center">
              <img :src="avatar" alt="perfil_usuario" class="w-16 h-auto" />
              <div id="a-d-p-card-info" class="text-left">
                <h4 class="font-bold">{{ NombrePersonalQueAtiende }}</h4>
                <p>{{ TituloPersonal }}</p>
              </div>
            </div>
          </div>

          <!-- Instrucciones -->
          <div id="a-d-instructions" class="bg-white border text-noxgrey border-vitalblue rounded-xl relative p-4 space-y-4">
            <h3 class="font-montserrat font-bold text-center">Instrucciones</h3>
            <Info class="absolute top-4 right-4" />
            <hr>
            <p>{{ mensajeInstrucciones }}</p>
          </div>

          <!-- Estado de la cita -->
          <div id="a-d-state" class="bg-white border text-noxgrey border-vitalblue rounded-xl relative p-4 space-y-4">
            <h3 class="font-montserrat font-bold text-center">Estado</h3>
            <Info class="absolute top-4 right-4" />
            <hr>
            <i>Imagen sobre el estado</i>
            <p>{{ mensajeEstado }}</p>
          </div>
        </div>
      </div>
    </div>
    <NavBottom />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/config/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import NavTop from '../../components/comp_paciente/NavTop.vue';
import NavBottom from '../../components/comp_paciente/NavBottom.vue';
import Titulo from '../../components/Titulo.vue';
import TituloH3 from '../../components/TituloH3.vue';
import { Info } from 'lucide-vue-next';
import avatar from '../../assets/imagenes/avatar.png';

const route = useRoute();
const citaId = route.params.id;

const cita = ref({});
const tituloCita = ref('');
const modalidad = ref('');
const horaEscogida = ref('');
const ubicacionPaciente = ref('Clínica Central');
const mensajeEstado = ref('');
const NombrePersonalQueAtiende = ref('');
const TituloPersonal = ref('');
const mensajeInstrucciones = ref('Por favor, confirme su asistencia a la cita 1 hora antes.');

// Función corregida para formatear la fecha
const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible'; // Manejo de valores nulos o indefinidos

  try {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      throw new Error('Fecha inválida');
    }
    return format(fechaObj, "d 'de' MMMM 'de' yyyy", { locale: es });
  } catch (error) {
    console.error('Error al formatear la fecha:', error);
    return 'Fecha inválida';
  }
};

// Función para formatear la hora
const formatearHora = (hora) => {
  return hora ? hora.slice(0, 5) : '--:--'; // Manejo de valores nulos o indefinidos
};

onMounted(async () => {
  try {
    // Obtener los detalles de la cita
    const { data, error } = await supabase
      .from('appointments')
      .select('*, doctors:doctor_id(nombre_completo, especialidad)')
      .eq('id', citaId)
      .single();

    if (error) throw error;

    cita.value = data;

    // Asignar valores a las variables reactivas
    modalidad.value = data.appointment_type === 'online' ? 'Cita Online' : 'Cita a Domicilio';
    horaEscogida.value = formatearHora(data.appointment_time);
    mensajeEstado.value = data.status === 'agendada' ? 'Cita agendada' : 'Cita confirmada';

    if (data.doctors) {
      NombrePersonalQueAtiende.value = data.doctors.nombre_completo;
      TituloPersonal.value = data.doctors.especialidad;
    }

  } catch (error) {
    console.error('Error al cargar los detalles de la cita:', error);
    alert('Error al cargar los detalles de la cita. Inténtalo de nuevo.');
  }
});
</script>