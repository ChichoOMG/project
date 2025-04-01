<template>
  <NavTop />
  <div id="Schedule_appointment" class="p-4 max-w-2xl mx-auto pb-32">
    <button 
      @click="router.push('/dashboard-paciente')"
      class="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
    >
      ← Volver
    </button>
    <Titulo texto="Agendar cita con Especialista" />

    <!-- Selector de especialista -->
    <div class="mb-8">
      <label class="block text-lg font-medium mb-2">Seleccione el especialista</label>
      <select 
        v-model="selectedSpecialist"
        class="w-full p-2 border border-gray-300 rounded-lg"
        required
        @change="cargarEspecialista"
      >
        <option value="" disabled selected>Seleccione un especialista</option>
        <option 
          v-for="doctor in listaEspecialistas" 
          :key="doctor.id"
          :value="doctor.id"
        >
          {{ doctor.especialidad }} - {{ doctor.nombre_completo }}
        </option>
      </select>
    </div>

    <!-- Información del especialista -->
    <div v-if="doctorInfo" class="mb-6 p-4 bg-blue-50 rounded-lg">
      <h2 class="font-bold text-lg text-blue-800">{{ doctorInfo.nombre }}</h2>
      <p class="text-blue-600">Especialidad: {{ doctorInfo.especialidad }}</p>
      <p class="text-blue-600">Horario: {{ doctorInfo.horario }}</p>
    </div>

    <!-- Selector de fecha -->
    <div class="mb-8">
      <label class="block text-lg font-medium mb-2">Fecha de la cita</label>
      <Calendar 
        :selected-date="selectedDate"
        @date-selected="handleDateSelect"
      />
      <p class="mt-2 text-gray-600">
        Fecha seleccionada: {{ formattedSelectedDate || 'Selecciona una fecha' }}
      </p>
    </div>

    <!-- Selector de hora -->
    <div class="mb-8">
      <label class="block text-lg font-medium mb-2">Hora de la cita</label>
      <TimeSelector 
        :selected-time="selectedTime"
        @time-selected="handleTimeSelect"
        :disabled-hours="disabledHours"
      />
      <p class="mt-2 text-gray-600">
        Hora seleccionada: {{ selectedTime || 'Selecciona una hora' }}
      </p>
    </div>

    <!-- Botón de confirmación -->
    <button 
      @click="irAConfirmarCita"
      :disabled="!formularioValido"
      class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
    >
      Continuar
    </button>
  </div>
  <NavBottom />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Calendar from '@/components/Calendar.vue';
import TimeSelector from '@/components/TimeSelector.vue';
import NavTop from '../../components/comp_paciente/NavTop.vue';
import NavBottom from '../../components/comp_paciente/NavBottom.vue';
import Titulo from '../../components/Titulo.vue';
import { supabase } from '@/config/supabase';

const router = useRouter();
const selectedDate = ref(new Date());
const selectedTime = ref('');
const selectedSpecialist = ref('');
const doctorInfo = ref(null);
const listaEspecialistas = ref([]);
const loading = ref(false);

// Horas deshabilitadas (comida)
const disabledHours = ref([12, 13]);

// Formatear la fecha seleccionada
const formattedSelectedDate = computed(() => {
  return format(selectedDate.value, "d 'de' MMMM 'de' yyyy", { locale: es });
});

// Validación del formulario
const formularioValido = computed(() => {
  return selectedDate.value && selectedTime.value && selectedSpecialist.value;
});

// Manejar selección de fecha
const handleDateSelect = (date) => {
  selectedDate.value = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
};

// Manejar selección de hora
const handleTimeSelect = (time) => {
  selectedTime.value = time;
};

// Cargar lista de especialistas disponibles
const cargarEspecialistas = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('doctors')
      .select('id, nombre_completo, especialidad')
      .or('especialidad.ilike.%Cardióloga%,especialidad.ilike.%Neumóloga%')
      .order('nombre_completo', { ascending: true });

    if (error) throw error;
    
    listaEspecialistas.value = data || [];
  } catch (error) {
    console.error('Error al cargar especialistas:', error);
    alert('Error al cargar la lista de especialistas');
  } finally {
    loading.value = false;
  }
};

// Cargar información del especialista seleccionado
const cargarEspecialista = async () => {
  if (!selectedSpecialist.value) {
    doctorInfo.value = null;
    return;
  }

  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('doctors')
      .select('id, nombre_completo, especialidad')
      .eq('id', selectedSpecialist.value)
      .single();

    if (error || !data) throw new Error('Especialista no encontrado');

    // Asignar información del doctor
    doctorInfo.value = {
      id: data.id,
      nombre: data.nombre_completo,
      especialidad: data.especialidad,
      horario: data.especialidad.includes('Cardióloga') 
        ? 'Lunes a Viernes, 8:00 - 13:00 y 15:00 - 18:00' 
        : 'Martes a Sábado, 8:00 - 13:00 y 14:00 - 17:00'
    };

  } catch (error) {
    console.error('Error al cargar especialista:', error);
    alert('Error al cargar información del especialista');
    doctorInfo.value = null;
  } finally {
    loading.value = false;
  }
};

// Redirigir a confirmar cita
const irAConfirmarCita = async () => {
  if (!formularioValido.value) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  router.push({
    path: '/confirmar-cita',
    query: {
      modalidad: 'especialista',
      especialidad: doctorInfo.value.especialidad,
      fecha: format(selectedDate.value, 'yyyy-MM-dd'),
      hora: selectedTime.value,
      doctorId: doctorInfo.value.id,
      doctorNombre: doctorInfo.value.nombre
    },
  });
};

// Cargar datos al montar el componente
onMounted(() => {
  cargarEspecialistas();
});
</script>

<style scoped>
#Schedule_appointment {
  min-height: calc(100vh - 128px);
}

.bg-blue-50 {
  background-color: #f0f9ff;
}

.text-blue-800 {
  color: #1e40af;
}

.text-blue-600 {
  color: #2563eb;
}
</style>