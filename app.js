// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHrmGbmstEkWaWoqadebBlHaydoZYd6yE",
  authDomain: "checklistv1-bf4b0.firebaseapp.com",
  projectId: "checklistv1-bf4b0",
  storageBucket: "checklistv1-bf4b0.firebasestorage.app",
  messagingSenderId: "410939793571",
  appId: "1:410939793571:web:5dc962c983b046795b9f16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

// Add Task
addTaskBtn.addEventListener('click', () => {
    const task = taskInput.value.trim();
    if (task) {
        const li = document.createElement('li');
        li.textContent = task;
        taskList.appendChild(li);
        taskInput.value = '';
    }
});

// Remove Task on Click
taskList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        e.target.remove();
    }
});

window.addEventListener('error', function (event) {
    console.error('Error ocurred', event.message);
});
//not much of a security issue, but since it's not going anywhere so it's good to let the user know where it is.
