<template>
  <div id="vista_agenda" class="flex flex-col justify-between min-h-screen font-nunito text-noxgrey">
    <NavTopD />
    <div id="contenedor_agenda" class="bg-fondo text-noxgrey py-20">
      <TituloPrincipal texto="Agenda"/>
      <div id="agenda_vuecal" class="px-4">
        <vue-cal class="font-nunito" :view="view" :events="events" :views="['day', 'month']" locale="es"
          :time-from="12 * 60" :time-to="21 * 60" :time-step="60" watch-real-time />
      </div>
    </div>
    <NavBottomD />
  </div>
</template>

<script>
import { VueCal } from 'vue-cal'
import 'vue-cal/style';
import NavTopD from '../../components/comp_doctor/NavTopD.vue';
import NavBottomD from '../../components/comp_doctor/NavBottomD.vue';
import TituloPrincipal from '../../components/TituloPrincipal.vue';

export default {
  components: {
    VueCal,
    NavTopD,
    NavBottomD,
    TituloPrincipal
  },

  data() {
    return {
      view: 'day',  // 'day', 'week', 'month'
      events: [
        {
          start: "2025-03-31 10:00",
          end: "2025-03-31 11:00",
          title: "Consulta con el Dr. Pérez"
        },
        {
          start: "2025-03-31 13:00",
          end: "2025-03-31 14:00",
          title: "Revisión con la Dra. López"
        }
      ]
    };
  },
  watch: {
    view(newView) {
      console.log('Vista cambiada:', newView);
    }
  },
  methods: {
    handleCellClick(date) {
      console.log('Celda clickeada:', date);
      // Aquí puedes mostrar un formulario para agregar una cita
    },
    customCellClass(date) {
      const isWeekend = [0, 6].includes(date.date.getDay()); // Verifica si es fin de semana (domingo o sábado)
      return isWeekend ? 'bg-gray-100 text-gray-500' : 'bg-white text-black';
    }
  }
};


</script>
<style>
.vuecal {
  --vuecal-primary-color: #47a3ff;

}
</style>