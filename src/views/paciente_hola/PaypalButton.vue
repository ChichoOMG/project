<template>
  <div>
    <!-- El botón de PayPal solo se muestra si el script está cargado -->
    <PayPalButtons
      :create-order="createOrder"
      :onApprove="onApprove"
      :onError="onError"
    />
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { usePayPalScriptReducer, PayPalButtons } from '@paypal/react-paypal-js';

const props = defineProps({
  monto: {
    type: Number,
    required: true,
  },
});

const { isLoaded } = usePayPalScriptReducer();
const isPaypalReady = ref(false);

// Asegurarse de que el SDK de PayPal se haya cargado
watchEffect(() => {
  if (isLoaded) {
    isPaypalReady.value = true;
  }
});

// Función para crear la orden de pago con PayPal
const createOrder = (data, actions) => {
  return actions.order.create({
    purchase_units: [
      {
        amount: {
          value: props.monto, // Usar el monto que se pasa desde el componente de planes
        },
      },
    ],
  });
};

// Función cuando se aprueba el pago
const onApprove = (data, actions) => {
  return actions.order.capture().then((details) => {
    console.log("Pago exitoso", details);
    // Aquí puedes registrar el pago o hacer alguna otra acción
  });
};

// Función cuando ocurre un error en el pago
const onError = (error) => {
  console.log("Error de pago", error);
};
</script>

<style scoped>
/* Estilos opcionales */
</style>