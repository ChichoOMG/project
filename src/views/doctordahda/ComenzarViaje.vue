<template>
<div id="comenzarViaje">
    <NavTopD />
    <Titulo texto="Detalles de cita" />
    <br>

    <div id="mapa_contenedor">
         <div id="mapa_tiempo_real">
            //Aqui irá el mapa en tiempo real
         </div>
         <p>{{ UbicacionPaciente }}</p>
    </div>

    <br>
    <button><a href="#">Comenzar viaje</a></button>
    <p>{{ TiempoEstimadoParaLlegar }}
        //Aqui irá el mapa en tiempo real
    </p>
</div>
</template>

<script setup>
import NavTopD from '../../components/comp_doctor/NavTopD.vue';
import Titulo from '../../components/Titulo.vue';

</script>