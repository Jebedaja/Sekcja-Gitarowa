<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-md mx-auto">
    <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-8 text-center">Moje zadania</h1>

    <!-- Formularz dodawania zadania -->
    <form @submit.prevent="addTask" class="bg-white p-6 rounded-lg shadow-lg mb-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <input
        v-model="newTask"
        type="text"
        placeholder="Dodaj nowe zadanie..."
        class="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
      />
      <button type="submit" class="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700
                                  transition duration-300 ease-in-out shadow-md">
        Dodaj
      </button>
    </form>

    <!-- Lista zadań -->
    <ul class="space-y-3">
      <li
        v-for="task in tasks"
        :key="task.id"
        class="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between transition duration-200 ease-in-out hover:shadow-md border border-gray-100"
      >
        <div class="flex items-center gap-3 flex-grow">
          <input
            type="checkbox"
            v-model="task.completed"
            @change="completeTask(task)"
            class="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
          />
          <span
            :class="{ 'line-through text-gray-500': task.completed }"
            class="font-medium text-lg text-gray-800 break-words flex-grow"
          >
            {{ task.title }}
          </span>
        </div>
        <button
          @click="removeTask(task)"
          class="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600 transition duration-200 ease-in-out"
        >
          <!-- SVG icon for trash can -->
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </li>
    </ul>

    <p v-if="tasks.length === 0" class="text-gray-500 text-center text-lg mt-8">Brak zadań. Dodaj nowe!</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAsyncData } from '#app'
import { useNuxtApp } from '#app'

// State for tasks
const tasks = ref([])
// New task to add
const newTask = ref('')

// 1. Get Supabase client instance from the plugin
const nuxtApp = useNuxtApp()
const supabase = nuxtApp.$supabase

// 2. Get logged-in user ID
let userId = null
const { data: sessionData } = await supabase.auth.getSession()
if (sessionData.session?.user?.id) {
  userId = sessionData.session.user.id
} else {
  console.log('User not logged in or no ID in session')
  // Optionally handle anonymous login or redirect to login page
}

// 3. Fetch tasks (only if userId exists)
const { data, error } = await useAsyncData('tasks', async () => {
  if (!userId) return []
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, completed')
    .eq('user_id', userId)
    .order('created_at', { ascending: true }) // Added ascending order
  if (error) throw error
  return data
})

if (data.value) {
  tasks.value = data.value
} else if (error.value) {
  console.error('Error fetching tasks:', error.value)
  // Display a user-friendly error message if needed
}

// Function to add a task
async function addTask() {
  if (!userId) {
    // In Canvas environment, alert() is not displayed. Use a custom modal instead.
    alert('Musisz być zalogowany, aby dodawać zadania.')
    return
  }
  if (!newTask.value.trim()) return

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: newTask.value.trim(), // Trim whitespace
      completed: false,
    })
    .select('id, title, completed')
    .single()

  if (error) {
    // In Canvas environment, alert() is not displayed. Use a custom modal instead.
    alert('Błąd dodawania zadania: ' + error.message)
    return
  }

  tasks.value.push(data)
  newTask.value = ''
}

// Function to update task status (completed)
async function completeTask(task) {
  // In Canvas environment, alert() is not displayed. Use a custom modal instead.
  const { error } = await supabase
    .from('tasks')
    .update({ completed: task.completed })
    .match({ id: task.id })
  
  if (error) {
    console.error('Error updating task:', error);
    // Optionally alert user about the error
  }
}

// Function to remove a task
async function removeTask(task) {
  // In Canvas environment, alert() is not displayed. Use a custom modal instead.
  // For a real app, replace confirm() with a custom modal for better UX
  if (!confirm(`Na pewno usunąć zadanie "${task.title}"?`)) return

  // Optimistic UI update: remove task from list immediately
  tasks.value = tasks.value.filter(t => t.id !== task.id)

  const { error } = await supabase
    .from('tasks')
    .delete()
    .match({ id: task.id })
  
  if (error) {
    console.error('Error deleting task:', error);
    // If delete fails, you might want to add the task back to the list
    // In Canvas environment, alert() is not displayed. Use a custom modal instead.
    alert('Błąd usuwania zadania: ' + error.message);
    // Optionally re-fetch tasks or revert optimistic update
    getTasks(); // Re-fetch to ensure consistency if optimistic update fails
  } else {
    // In Canvas environment, alert() is not displayed. Use a custom modal instead.
    alert(`Zadanie "${task.title}" usunięte.`);
  }
}

// Function to fetch tasks, to be called after modifications for consistency
async function getTasks() {
    try {
        if (!userId) {
            tasks.value = [];
            return;
        }
        const { data, error } = await supabase
            .from('tasks')
            .select('id, title, completed')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        tasks.value = data;
    } catch (err) {
        console.error('Error re-fetching tasks:', err);
    }
}

// Fetch tasks on component mount
onMounted(() => {
  // Ensure tasks are fetched when component is mounted (e.g., on page load or navigation)
  // This is handled by useAsyncData above, but a separate call ensures consistency.
  getTasks(); 
})
</script>

<style scoped>
/* You can add custom CSS styles here if Tailwind alone is not enough */
/* For example, for very specific animations or complex layouts not easily achievable with Tailwind classes */
</style>
