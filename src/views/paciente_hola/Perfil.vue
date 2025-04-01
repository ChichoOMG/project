<template>
  <div class="min-h-screen bg-fondo p-4 pt-20 pb-32">
    <!-- Nav Top (ajusta la ruta si es necesario) -->
    <NavTop />

    <div class="max-w-md mx-auto">
      <div class="bg-[#F0F9FE] shadow-lg rounded-xl p-8">
        <h1 class="text-3xl font-bold text-medblue text-center mb-6">Perfil del Usuario</h1>

        <form @submit.prevent="actualizarPerfil" class="space-y-4">
          <!-- Foto de Perfil -->
          <div class="flex items-center justify-center">
            <label for="profile-pic" class="relative cursor-pointer">
              <img
                :src="user.foto_url || '/default-avatar.png'"
                alt="Foto de Perfil"
                class="w-24 h-24 rounded-full border-4 border-blue-400 object-cover mb-4"
              />
              <input type="file" id="profile-pic" class="hidden" @change="subirFotoPerfil" />
              <div class="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full p-1">
                <i class="fas fa-camera"></i>
              </div>
            </label>
          </div>

          <!-- Campos del formulario -->
          <div>
            <label class="block text-gray-600 font-medium">Nombre</label>
            <input v-model="user.nombre" type="text" class="input-field" />
          </div>

          <div>
            <label class="block text-gray-600 font-medium">Apellido Paterno</label>
            <input v-model="user.apellido_paterno" type="text" class="input-field" />
          </div>

          <div>
            <label class="block text-gray-600 font-medium">Apellido Materno</label>
            <input v-model="user.apellido_materno" type="text" class="input-field" />
          </div>

          <div>
            <label class="block text-gray-600 font-medium">Correo</label>
            <input
              v-model="user.correo"
              type="email"
              readonly
              class="input-field bg-gray-200 cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-gray-600 font-medium">Teléfono</label>
            <input v-model="user.telefono" type="text" class="input-field" />
          </div>

          <div>
            <label class="block text-gray-600 font-medium">Sexo</label>
            <select v-model="user.sexo" class="input-field">
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label class="block text-gray-600 font-medium">Fecha de Nacimiento</label>
            <input v-model="user.fecha_nacimiento" type="date" class="input-field" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-600 font-medium">Calle</label>
              <input v-model="user.calle" type="text" class="input-field" />
            </div>
            <div>
              <label class="block text-gray-600 font-medium">Número Exterior</label>
              <input v-model="user.numero_exterior" type="text" class="input-field" />
            </div>
          </div>

          <div>
            <label class="block text-gray-600 font-medium">Colonia</label>
            <input v-model="user.colonia" type="text" class="input-field" />
          </div>

          <div>
            <label class="block text-gray-600 font-medium">Ciudad</label>
            <input v-model="user.ciudad" type="text" class="input-field" />
          </div>

          <div>
            <label class="block text-gray-600 font-medium">Código Postal (CP)</label>
            <input v-model="user.cp" type="text" class="input-field" />
          </div>

          <!-- Botón de actualizar perfil --> 
          <button
            type="submit"
            class="w-full bg-[#5B5EA7] text-white font-medium py-2 rounded-full hover:bg-[#4e4b8b] transition">
            Actualizar Perfil
          </button>
        </form>
      </div>
    </div>

    <!-- Nav Bottom (ajusta la ruta si es necesario) -->
    <NavBottom />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { supabase } from '@/config/supabase';
import NavBottom from '../../components/comp_paciente/NavBottom.vue';
import NavTop from '../../components/comp_paciente/NavTop.vue'; // Asegúrate de ajustar la ruta según tu proyecto

export default {
  components: {
    NavBottom,
    NavTop,
  },
  setup() {
    const user = ref({});

    const obtenerUsuario = async () => {
      // Obtener el usuario autenticado
      const { data } = await supabase.auth.getUser();
      // Obtener la información completa del usuario desde la tabla 'users'
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      user.value = userData;
    };

    const subirFotoPerfil = async (event) => {
      const file = event.target.files[0];
      const currentUser = supabase.auth.user();
      if (!currentUser) {
        console.error("Usuario no autenticado");
        return;
      }
      if (file) {
        const fileName = `${currentUser.id}_${Date.now()}`;
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });
        if (error) {
          console.error("Error subiendo la imagen: ", error);
        } else {
          const { publicURL, error: urlError } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          if (urlError) {
            console.error("Error obteniendo la URL pública: ", urlError);
          } else {
            user.value.foto_url = publicURL;
          }
        }
      }
    };

    const actualizarPerfil = async () => {
      await supabase.from('users').update(user.value).eq('id', user.value.id);
      alert('Perfil actualizado con éxito');
    };

    onMounted(obtenerUsuario);

    return { user, subirFotoPerfil, actualizarPerfil };
  },
};
</script>

<style scoped>
.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #f9fafb;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #3b82f6;
  background-color: white;
}
</style>
