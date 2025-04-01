<template>
  <div id="vista_citas_agendadas" class="flex flex-col justify-between min-h-screen font-nunito text-noxgrey">
    <NavTopD />
    <div id="next_appointments" class="bg-fondo text-noxgrey w-4/5 max-w-[1200px] mx-auto py-20">
      <Titulo texto="Próximas citas"/>
      <!-- Citas agendadas -->
      <div id="citas_agendadas" class="space-y-3">
        <div id="appointments-container" class="border border-gray-200 rounded-xl shadow-2xs p-2 space-y-2 w-full">
          <div class="border border-vitalblue rounded-xl shadow-2xs py-4 px-3 bg-vitalblue w-full text-center space-y-4">
            <TituloH3 :texto="hola" />
            <ul>
              <li><span class="font-bold">Modalidad: </span>{{ modalidad }}holap</li>
              <li><span class="font-bold">Fecha: </span>{{ fechaDeLaCita}}holap</li>
              <li><span class="font-bold">Hora: </span>{{ horaDeLaCita }}holap</li>
              <li><span class="font-bold">Paciente: </span>{{ nombreDelPaciente }}holap</li>
            </ul>
            <!-- Estado de la cita -->
            <div id="a-d-state" class="bg-white border text-noxgrey border-gray-100 rounded-xl relative p-4 space-y-4 drop-shadow-xs">
              <h3 class="font-montserrat font-bold text-center">Estado</h3>
              <Info class="absolute top-4 right-4 text-gray-400 w-5" />
              <hr class="w-full h-[1px] bg-gray-300 border-0">
              <div class="flex space-x-4 justify-center">
                <i>Imagen sobre el estado</i>
                <p>{{ estatus }}</p>
              </div>
            </div>
            <button @click="verDetallesCita(cita.id)" class="text-medblue underline">Ver detalles de la cita</button>
          </div>
        </div>
      </div>
    </div>
    <NavBottomD />
  </div>
</template>

<script setup>

import NavTopD from '../../components/comp_doctor/NavTopD.vue';
import NavBottomD from '../../components/comp_doctor/NavBottomD.vue';
import Titulo from '../../components/Titulo.vue';
import TituloH3 from '../../components/TituloH3.vue';

import { Info } from 'lucide-vue-next';



</script>

<style scoped>
/* Estilos específicos de esta vista */
</style>