<template>
    <div v-if="deferredPrompt" class="install-button">
      <button @click="installPWA">Instalar PWA</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        deferredPrompt: null, // Este será el evento de instalación del PWA
      };
    },
    mounted() {
      // Detectar si el navegador soporta PWA
      window.addEventListener("beforeinstallprompt", (event) => {
        // Prevenir que el navegador muestre su propio prompt
        event.preventDefault();
        // Guardar el evento para usarlo después
        this.deferredPrompt = event;
      });
    },
    methods: {
      installPWA() {
        // Llamar al evento que se había guardado
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          // Esperar que el usuario elija una opción
          this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
              console.log("Usuario instaló la PWA");
            } else {
              console.log("Usuario no instaló la PWA");
            }
            // Limpiar la variable
            this.deferredPrompt = null;
          });
        }
      },
    },
  };
  </script>
  
  <style>
  .install-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #000;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
  }
  .install-button button {
    background-color: #0088cc;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
  }
  </style>
  