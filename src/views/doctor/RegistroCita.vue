<template>
  <div class="min-h-screen bg-fondo p-4 pt-20 pb-32">
    <NavTopD />
    <div class="max-w-4xl mx-auto">
      <!-- Título centrado -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-medblue text-center">Consulta en Progreso</h1>
      </div>

      <!-- Datos del Paciente con botón Ver perfil -->
      <div class="bg-[#F0F9FE] rounded-xl shadow-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[#5B5EA7]">Datos del Paciente</h2>
          <router-link 
            :to="'/perfil/' + paciente.id" 
            class="px-4 py-2 bg-[#76C7D0] text-white rounded-full hover:bg-[#5aa7bd]">
            Ver perfil
          </router-link>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
          <div>
            <p><span class="font-medium">Nombre:</span> {{ paciente.nombre }}</p>
            <p><span class="font-medium">Apellidos:</span> {{ paciente.apellido_paterno }} {{ paciente.apellido_materno }}</p>
            <p><span class="font-medium">Teléfono:</span> {{ paciente.telefono }}</p>
          </div>
          <div>
            <p><span class="font-medium">Edad:</span> {{ calcularEdad(paciente.fecha_nacimiento) }} años</p>
            <p><span class="font-medium">Sexo:</span> {{ paciente.sexo }}</p>
            <p><span class="font-medium">Correo:</span> {{ paciente.correo }}</p>
          </div>
        </div>
      </div>

      <!-- Botón para ver historial clínico -->
      <div class="mb-6 flex justify-center">
        <router-link 
          :to="'/historial-clinico/' + paciente.id" 
          class="px-4 py-2 bg-[#5B5EA7] text-white rounded-full hover:bg-[#4e4b8b]">
          Ver historial clínico
        </router-link>
      </div>

      <!-- Formulario Médico -->
      <div class="bg-[#F0F9FE] rounded-xl shadow-lg p-6 space-y-6 mb-6">
        <div>
          <label class="block text-sm font-medium mb-2">Diagnóstico *</label>
          <textarea 
            v-model="diagnostico"
            class="w-full p-2 border rounded-lg h-32"
            placeholder="Ingrese el diagnóstico principal..."
            required></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Notas Médicas</label>
          <textarea
            v-model="notasMedicas"
            class="w-full p-2 border rounded-lg h-32"
            placeholder="Observaciones, evolución, etc..."></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Receta Médica</label>
          <textarea
            v-model="receta"
            class="w-full p-2 border rounded-lg h-48"
            placeholder="Indique medicamentos, dosis y frecuencia..."></textarea>
        </div>
      </div>

      <!-- Mensaje de carga -->
      <div v-if="isLoading" class="mt-4 text-center">
        <p class="text-blue-600">Guardando datos...</p>
      </div>

      <!-- Botones al final de la vista -->
      <div class="flex justify-center gap-2 mt-8 mb-8">
        <button 
          @click="guardarDatos"
          :disabled="isLoading"
          class="px-4 py-2 bg-[#5B5EA7] text-white rounded-full hover:bg-[#4e4b8b] disabled:opacity-50">
          Guardar Borrador
        </button>
        <button 
          @click="finalizarConsulta"
          :disabled="isLoading || !diagnostico"
          class="px-4 py-2 bg-[#5B5EA7] text-white rounded-full hover:bg-[#4e4b8b] disabled:opacity-50">
          Finalizar Consulta
        </button>
      </div>
    </div>
    <NavBottomD />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '@/config/supabase';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import NavTopD from '@/components/comp_doctor/NavTopD.vue';
import NavBottomD from '@/components/comp_doctor/NavBottomD.vue';

const route = useRoute();
const router = useRouter();
const citaId = route.params.id;

const paciente = ref({});
const diagnostico = ref('');
const notasMedicas = ref('');
const receta = ref('');
const isLoading = ref(false);
const inicioConsulta = ref(null);

const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

const cargarDatos = async () => {
  try {
    isLoading.value = true;
    inicioConsulta.value = new Date();
    
    // Obtener datos de la cita y paciente
    const { data: cita, error: citaError } = await supabase
      .from('appointments')
      .select(`
        *,
        paciente:user_id(*)
      `)
      .eq('id', citaId)
      .single();

    if (citaError) throw citaError;
    if (!cita) throw new Error('Cita no encontrada');

    paciente.value = cita.paciente;
    diagnostico.value = cita.diagnostico || '';
    notasMedicas.value = cita.notas_medicas || '';
    receta.value = cita.receta || '';

    // Si ya hay una fecha de inicio, usarla
    if (cita.inicio_consulta) {
      inicioConsulta.value = new Date(cita.inicio_consulta);
    }

  } catch (error) {
    console.error('Error cargando datos:', error);
    alert('Error al cargar la consulta: ' + error.message);
    router.push('/doctor/inicio');
  } finally {
    isLoading.value = false;
  }
};

const guardarDatos = async () => {
  try {
    isLoading.value = true;
    
    const { error } = await supabase
      .from('appointments')
      .update({
        diagnostico: diagnostico.value,
        notas_medicas: notasMedicas.value,
        receta: receta.value,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', citaId);

    if (error) throw error;

    alert('Datos guardados correctamente');
  } catch (error) {
    console.error('Error guardando datos:', error);
    alert('Error al guardar: ' + error.message);
  } finally {
    isLoading.value = false;
  }
};

const generarPDF = async () => {
  try {
    // Crear elemento HTML para el PDF
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial';
    element.style.width = '794px'; // A4 width in pixels (96dpi)
    element.style.background = 'white';
    
    element.innerHTML = `
      <h1 style="text-align: center; color: #2c3e50; margin-bottom: 20px;">Reporte de Consulta Médica</h1>
      <hr style="margin-bottom: 20px;">
      
      <div style="margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-bottom: 10px;">Datos del Paciente</h2>
        <p><strong>Nombre:</strong> ${paciente.value.nombre} ${paciente.value.apellido_paterno} ${paciente.value.apellido_materno}</p>
        <p><strong>Edad:</strong> ${calcularEdad(paciente.value.fecha_nacimiento)} años</p>
        <p><strong>Sexo:</strong> ${paciente.value.sexo}</p>
        <p><strong>Teléfono:</strong> ${paciente.value.telefono}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-bottom: 10px;">Detalles de la Consulta</h2>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Hora inicio:</strong> ${inicioConsulta.value.toLocaleTimeString('es-MX')}</p>
        <p><strong>Hora fin:</strong> ${new Date().toLocaleTimeString('es-MX')}</p>
        <p><strong>Duración:</strong> ${Math.round((new Date() - inicioConsulta.value) / 60000)} minutos</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-bottom: 10px;">Diagnóstico</h2>
        <p style="white-space: pre-wrap; background: #f8f9fa; padding: 10px; border-radius: 5px;">${diagnostico.value}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-bottom: 10px;">Tratamiento</h2>
        <p style="white-space: pre-wrap; background: #f8f9fa; padding: 10px; border-radius: 5px;">${receta.value || 'No se prescribió tratamiento'}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-bottom: 10px;">Notas Médicas</h2>
        <p style="white-space: pre-wrap; background: #f8f9fa; padding: 10px; border-radius: 5px;">${notasMedicas.value || 'No hay notas adicionales'}</p>
      </div>
      
      <div style="margin-top: 50px; text-align: right;">
        <p>_________________________</p>
        <p><strong>${localStorage.getItem('doctorNombre') || 'Médico'}</strong></p>
        <p>${localStorage.getItem('doctorEspecialidad') || 'Especialidad'}</p>
        <p>Alura Medical Services</p>
      </div>
    `;
    
    document.body.appendChild(element);
    
    // Generar PDF
    const canvas = await html2canvas(element, {
      scale: 2, // Mayor calidad
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210; // A4 width en mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Guardar el PDF
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Subir a Supabase Storage (opcional)
    const nombreArchivo = `consulta_${citaId}_${new Date().toISOString().split('T')[0]}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('consultas')
      .upload(nombreArchivo, pdfBlob, {
        contentType: 'application/pdf'
      });
    
    if (uploadError) {
      console.error('Error subiendo PDF:', uploadError);
    } else {
      console.log('PDF subido correctamente');
    }
    
    // Limpiar
    document.body.removeChild(element);
    
    return {
      pdfData: pdf.output('datauristring'),
      pdfUrl: await supabase.storage.from('consultas').getPublicUrl(nombreArchivo).data.publicUrl
    };
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    return null;
  }
};

const finalizarConsulta = async () => {
  if (!confirm('¿Está seguro de finalizar esta consulta? No podrá realizar más cambios después.')) {
    return;
  }

  try {
    isLoading.value = true;
    
    // Calcular duración de la consulta
    const finConsulta = new Date();
    const duracion = Math.round((finConsulta - inicioConsulta.value) / 60000); // en minutos
    
    // Generar PDF antes de actualizar la base de datos
    const pdfResult = await generarPDF();
    
    if (!pdfResult) {
      throw new Error('Error al generar el PDF');
    }
    
    // Actualizar la cita
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'completada',
        fin_consulta: finConsulta.toISOString(),
        diagnostico: diagnostico.value,
        notas_medicas: notasMedicas.value,
        receta: receta.value,
        duracion_consulta: duracion,
        pdf_url: pdfResult.pdfUrl
      })
      .eq('id', citaId);

    if (error) throw error;

    // Crear registro en historial clínico
    const { error: histError } = await supabase
      .from('historial_clinico')
      .insert({
        paciente_id: paciente.value.id,
        doctor_id: localStorage.getItem('doctorId'),
        cita_id: citaId,
        diagnostico: diagnostico.value,
        tratamiento: receta.value,
        notas: notasMedicas.value,
        fecha: new Date().toISOString(),
        duracion: duracion,
        pdf_url: pdfResult.pdfUrl
      });

    if (histError) throw histError;

    // Descargar PDF automáticamente
    const link = document.createElement('a');
    link.href = pdfResult.pdfData;
    link.download = `consulta_${citaId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Consulta finalizada correctamente. Se ha generado el PDF.');
    router.push('/dashboard-doctor');
    
  } catch (error) {
    console.error('Error finalizando consulta:', error);
    alert('Error al finalizar: ' + error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(cargarDatos);
</script>
