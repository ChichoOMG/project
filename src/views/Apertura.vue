<template>
    <div class="flex items-center justify-center min-h-screen text-noxgrey">
        <div id="login" class="flex flex-col w-64 text-center space-y-24">
            <AluraLogo class="w-xs" />

            <div class="flex flex-col">
                <p class="font-nunito font-normal my-2">
                    Bienvenido/a a la App de Alura; su gestor de servicios médicos a domicilio. ¿POR QUE NO FUNCIONA GITHUB PAGES????
                </p>
                <button class="bg-medblue text-white mb-2 my-1 w-full py-3 inline-flex justify-center items-center rounded-full" onclick="window.location.href='/iniciar-sesion'">Iniciar sesión</button>
                <button class="bg-medbluelight my-1 w-full py-3 inline-flex justify-center items-center rounded-full" onclick="window.location.href='/registro'">Registrarse</button>
            </div>
            <p>© Alura 2025</p>
        </div>
    </div>
</template>


<script setup>
// Aquí podrías importar componentes si los necesitas
import AluraLogo from '../components/AluraLogo.vue';
</script>

<style scoped>
/* Estilos específicos de esta vista */
</style>