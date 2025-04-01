<template>
  <div>
    <NavTop />
    <div class="container mx-auto py-16 px-6"> <!-- Ajuste de padding top -->
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">Planes Disponibles</h1>

      <div class="grid gap-8 md:grid-cols-2">
        <!-- Plan Básico -->
        <div class="border p-8 rounded-lg shadow-lg bg-white transition-transform transform hover:scale-105">
          <h2 class="text-2xl font-semibold text-gray-700">Plan Básico</h2>
          <p class="text-gray-500 mt-2">Acceso a consultas médicas básicas.</p>
          <p class="text-xl font-bold mt-4 text-blue-600">$20,000 MXN / 6 meses</p>
          <!-- Botón para iniciar el pago del plan básico -->
          <button @click="pagar(20000)" class="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
            Pagar con PayPal
          </button>
        </div>

        <!-- Plan Premium -->
        <div class="border p-8 rounded-lg shadow-lg bg-white transition-transform transform hover:scale-105">
          <h2 class="text-2xl font-semibold text-gray-700">Plan Premium</h2>
          <p class="text-gray-500 mt-2">Acceso completo a consultas con especialistas.</p>
          <p class="text-xl font-bold mt-4 text-blue-600">$60,000 MXN / 6 meses</p>
          <!-- Botón para iniciar el pago del plan premium -->
          <button @click="pagar(60000)" class="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
            Pagar con PayPal
          </button>
        </div>
      </div>

      <!-- Aquí es donde se carga el componente de PayPal -->
      <div v-if="monto" class="mt-8">
        <div id="paypal-button-container"></div>
      </div>
    </div>
    <NavBottom />
  </div>
</template>

<script>
import NavTop from '@/components/comp_paciente/NavTop.vue';
import NavBottom from '@/components/comp_paciente/NavBottom.vue';

export default {
  components: {
    NavTop,
    NavBottom
  },
  data() {
    return {
      monto: null,
    };
  },
  methods: {
    pagar(monto) {
      this.monto = monto;
      this.renderPaypalButton(); // Llamamos a la función que renderiza el botón de PayPal
    },
    renderPaypalButton() {
      // Verificamos si el script de PayPal está cargado antes de renderizar el botón
      if (window.paypal) {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: this.monto,
                  },
                },
              ],
            });
          },
          onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
              console.log("Pago exitoso", details);
              // Aquí puedes hacer algo más con la respuesta del pago, como redirigir o mostrar un mensaje
            });
          },
          onError: (error) => {
            console.log("Error de pago", error);
            // Aquí puedes manejar errores de la transacción
          },
        }).render("#paypal-button-container"); // Renderizamos el botón de PayPal dentro del contenedor
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>