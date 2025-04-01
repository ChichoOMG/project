<template>
  <div class="bg-fondo min-h-screen pb-20 pt-16">
    <NavTop />
    
    <div class="max-w-4xl mx-auto px-4 py-6">
      <!-- Botón de regreso -->
      <button 
        @click="router.go(-1)"
        class="flex items-center gap-2 text-[#5B5EA7] mb-6 hover:text-[#76C7D0] transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Regresar</span>
      </button>
      
      <!-- Estado de carga -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#76C7D0] mx-auto"></div>
        <p class="text-[#5B5EA7] mt-2">Cargando detalles de la consulta...</p>
      </div>
      
      <!-- Mensaje de error -->
      <div v-else-if="error" class="text-center py-12">
        <div class="mx-auto w-16 h-16 text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button 
          @click="cargarDetallesCita"
          class="px-4 py-2 bg-[#76C7D0] text-white rounded-full hover:bg-[#5B5EA7] transition-colors">
          Reintentar
        </button>
      </div>
      
      <!-- Contenido principal -->
      <div v-else class="space-y-6">
        <!-- Contenedor principal con fondo #F0F9FE -->
        <div class="bg-[#F0F9FE] rounded-xl shadow-md p-6 border border-[#76C7D0]/20">
          <!-- Título H1 "Detalles" -->
          <h1 class="text-3xl font-bold text-[#5B5EA7] mb-6">Detalles</h1>
          
          <!-- Tipo de cita -->
          <h2 class="text-xl font-semibold text-[#5B5EA7] mb-2">{{ formatoTipoCita(cita.appointment_type) }}</h2>
          
          <!-- Información básica -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="space-y-4">
              <div>
                <p class="text-sm text-[#5B5EA7]/80">Fecha de la cita</p>
                <p class="font-medium text-[#5B5EA7]">{{ formatoFecha(cita.appointment_date) }}</p>
              </div>
              
              <div>
                <p class="text-sm text-[#5B5EA7]/80">Horario</p>
                <p class="font-medium text-[#5B5EA7]">
                  {{ formatoHora(cita.appointment_time) }}
                  <template v-if="cita.fin_consulta">
                    - {{ formatoHora(cita.fin_consulta.split(' ')[1]) }}
                  </template>
                  <span v-if="cita.duracion_consulta" class="text-[#5B5EA7]/80 text-sm ml-2">
                    ({{ cita.duracion_consulta }} minutos)
                  </span>
                </p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <p class="text-sm text-[#5B5EA7]/80">Modalidad</p>
                <p class="font-medium text-[#5B5EA7]">
                  {{ cita.appointment_type === 'online' ? 'Virtual' : 'Presencial' }}
                </p>
              </div>
              
              <div>
                <p class="text-sm text-[#5B5EA7]/80">Ubicación</p>
                <p class="font-medium text-[#5B5EA7]">{{ cita.ubicacion || 'No especificada' }}</p>
              </div>
            </div>
          </div>
          
          <!-- Enlace Meet si es online -->
          <div v-if="cita.appointment_type === 'online' && cita.google_meet_link" class="mt-4 mb-6">
            <p class="text-sm text-[#5B5EA7]/80">Enlace de la consulta</p>
            <a 
              :href="cita.google_meet_link" 
              target="_blank"
              class="text-[#76C7D0] hover:underline break-all">
              {{ cita.google_meet_link }}
            </a>
          </div>
          
          <!-- Diagnóstico - Contenedor blanco -->
          <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 class="text-xl font-semibold text-[#5B5EA7] mb-4">Diagnóstico</h2>
            <div class="whitespace-pre-wrap text-gray-800">
              {{ cita.diagnostico || 'No se registró diagnóstico en esta consulta' }}
            </div>
          </div>
          
          <!-- Receta - Contenedor blanco -->
          <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 class="text-xl font-semibold text-[#5B5EA7] mb-4">Receta Médica</h2>
            <div class="whitespace-pre-wrap text-gray-800">
              {{ cita.receta || 'No se prescribió receta en esta consulta' }}
            </div>
          </div>
          
          <!-- Notas adicionales - Contenedor blanco -->
          <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 class="text-xl font-semibold text-[#5B5EA7] mb-4">Notas Médicas</h2>
            <div class="whitespace-pre-wrap text-gray-800">
              {{ cita.notas_medicas || 'No hay notas adicionales para esta consulta' }}
            </div>
          </div>
          
          <!-- Botón de descarga -->
          <div class="text-center mt-8">
            <button 
              v-if="cita.pdf_url"
              @click="descargarPDF"
              class="px-6 py-3 bg-[#76C7D0] text-white rounded-full hover:bg-[#5B5EA7] transition-colors font-medium text-lg">
              Descargar PDF
            </button>
            <p v-else class="text-[#5B5EA7]/80">No hay PDF disponible para esta consulta</p>
          </div>
        </div>
      </div>
    </div>
    
    <NavBottom />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/config/supabase';
import NavTop from '@/components/comp_paciente/NavTop.vue';
import NavBottom from '@/components/comp_paciente/NavBottom.vue';

const route = useRoute();
const router = useRouter();
const citaId = route.params.id;

const cita = ref({});
const loading = ref(true);
const error = ref(null);

// Formateadores
const formatoFecha = (fecha) => {
  if (!fecha) return 'No especificada';
  try {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Fecha inválida';
  }
};

const formatoHora = (hora) => {
  if (!hora) return '--:--';
  // Si ya está en formato HH:MM
  if (hora.includes(':')) {
    const [hours, minutes] = hora.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }
  // Si es solo la hora (ej. "14")
  return `${hora.padStart(2, '0')}:00`;
};

const formatoTipoCita = (tipo) => {
  const tipos = {
    'online': 'Consulta Online',
    'domicilio': 'Visita a Domicilio',
    'especialista': 'Consulta Especializada'
  };
  return tipos[tipo] || 'Consulta';
};

// Función para cargar los detalles de la cita
const cargarDetallesCita = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Consulta a Supabase para obtener los detalles completos
    const { data, error: queryError } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctor_id(nombre_completo, especialidad),
        paciente:user_id(nombre, apellido_paterno, apellido_materno)
      `)
      .eq('id', citaId)
      .single();

    if (queryError) throw queryError;
    if (!data) throw new Error('No se encontró la cita solicitada');
    
    cita.value = {
      ...data,
      doctor_nombre: data.doctor?.nombre_completo || 'Doctor no especificado',
      especialidad: data.doctor?.especialidad || 'No especificada',
      paciente_nombre: `${data.paciente?.nombre || ''} ${data.paciente?.apellido_paterno || ''} ${data.paciente?.apellido_materno || ''}`.trim() || 'Paciente no especificado'
    };
    
  } catch (err) {
    console.error('Error cargando detalles de la cita:', err);
    error.value = err.message || 'Error al cargar los detalles de la consulta';
  } finally {
    loading.value = false;
  }
};

// Función para descargar PDF
const descargarPDF = async () => {
  if (!cita.value.pdf_url) {
    alert('No hay PDF disponible para esta consulta');
    return;
  }
  
  try {
    // Extraer el path del archivo (eliminando el dominio si existe)
    const pdfPath = cita.value.pdf_url.replace(/^.*\/storage\/v1\/object\/public\//, '');
    const bucket = pdfPath.split('/')[0];
    const filePath = pdfPath.split('/').slice(1).join('/');
    
    // Descargar desde Supabase Storage
    const { data, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(filePath);
    
    if (downloadError) throw downloadError;
    
    // Crear enlace de descarga
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consulta_${citaId}_${cita.value.appointment_date}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar memoria después de 1 minuto
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
    
  } catch (error) {
    console.error('Error descargando PDF:', error);
    alert('Error al descargar el PDF. Inténtalo nuevamente.');
  }
};

// Cargar datos al montar el componente
onMounted(cargarDetallesCita);
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Transiciones suaves */
button, a {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>