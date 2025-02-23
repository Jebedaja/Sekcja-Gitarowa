<template>
  <div class="w-full my-10">
    <h1 class="mb-6 text-4xl font-bold text-center">Todo List</h1>

    <!-- Formularz dodawania zadania -->
    <form @submit.prevent="addTask" class="flex gap-2 mb-6">
      <input
        v-model="newTask"
        type="text"
        placeholder="Dodaj nowe zadanie..."
        class="flex-1 p-2 border rounded"
      />
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">
        Dodaj
      </button>
    </form>

    <!-- Lista zadań -->
    <ul>
      <li
        v-for="task in tasks"
        :key="task.id"
        class="flex items-center justify-between p-2 border-b"
      >
        <div class="flex items-center gap-3">
          <input
            type="checkbox"
            v-model="task.completed"
            @change="completeTask(task)"
          />
          <span :class="{ 'line-through text-gray-500': task.completed }">
            {{ task.title }}
          </span>
        </div>
        <button
          @click="removeTask(task)"
          class="text-red-600 hover:underline"
        >
          Usuń
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAsyncData } from '#app'
import { useNuxtApp } from '#app'

// Stan dla zadań
const tasks = ref([])
// Nowe zadanie do dodania
const newTask = ref('')

// 1. Pobierz instancję klienta Supabase z pluginu
const nuxtApp = useNuxtApp()
const supabase = nuxtApp.$supabase

// 2. Pobierz ID zalogowanego użytkownika
//    (np. z sesji)
let userId = null
const { data: sessionData } = await supabase.auth.getSession()
if (sessionData.session?.user?.id) {
  userId = sessionData.session.user.id
} else {
  // Nie ma zalogowanego użytkownika
  console.log('Użytkownik niezalogowany lub brak ID w sesji')
}

// 3. Pobieranie zadań (tylko jeśli userId istnieje)
const { data, error } = await useAsyncData('tasks', async () => {
  if (!userId) return []
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, completed')
    .eq('user_id', userId)
    .order('created_at')
  if (error) throw error
  return data
})

if (data.value) {
  tasks.value = data.value
} else if (error.value) {
  console.error('Błąd pobierania zadań:', error.value)
}

// Funkcja dodająca zadanie
async function addTask() {
  if (!userId) {
    alert('Musisz być zalogowany, aby dodawać zadania.')
    return
  }
  if (!newTask.value.trim()) return

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: newTask.value,
      completed: false,
    })
    .select('id, title, completed')
    .single()

  if (error) {
    alert('Błąd dodawania zadania: ' + error.message)
    return
  }

  tasks.value.push(data)
  newTask.value = ''
}

// Funkcja aktualizująca stan zadania (completed)
async function completeTask(task) {
  await supabase
    .from('tasks')
    .update({ completed: task.completed })
    .match({ id: task.id })
}

// Funkcja usuwająca zadanie
async function removeTask(task) {
  tasks.value = tasks.value.filter(t => t.id !== task.id)
  await supabase
    .from('tasks')
    .delete()
    .match({ id: task.id })
}
</script>



