// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { doc, getDocs, addDoc, updateDoc, getFirestore, collection, getDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from '@google/generative-ai';
import log from "loglevel";

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
const db = getFirestore(app);
console.log("Firebase initialized properly", app);
console.log("Firestore instance created:", db);

// Initialize Google Generative AI
let apiKey, genAI, model;

// Call in the event listener for page load
async function getApiKey() {
    const docRef = doc(db, "apikeys", "googlegenai");
    let snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
        apiKey = snapshot.data().key;
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } else {
        console.error("No such document!");
    }
}

// Ensure getApiKey is called first
getApiKey().then(() => {
    async function askChatBot(request) {
        return await model.generateContent(request);
    }
});

// Service Worker registration
const sw = new URL('service-worker.js', import.meta.url);
if ('serviceWorker' in navigator) {
    const s = navigator.serviceWorker;
    s.register(sw.href, { scope: '/CheckListv1/' })
    .then(_ => console.log('Service Worker Registered for scope:', sw.href, 'with', import.meta.url))
    .catch(err => console.error('Service Worker Error:', err));
}
console.log('Service Worker setup is working..');

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const aiButton = document.getElementById('send-btn');
const aiInput = document.getElementById('chat-input');
const chatHistory = document.getElementById('chat-history');

// Event listeners
window.addEventListener('load', () => {
    renderTasks();
});

// Task addition and input handling
function addTask(task) {
    const taskText = sanitizeInput(task);
    if (taskText) {
        addTaskToFirestore(taskText).then(taskId => {
            createLiTask(taskId, taskText);
            taskInput.value = "";
        });
    } else {
        alert("Please enter task!");
    }
}

addTaskBtn.addEventListener('click', () => {
    const task = taskInput.value.trim();
    if (task) {
        addTask(task);
    }
    renderTasks();
});

taskInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        addTask(taskInput.value.trim());
    }
});

// Remove Task
taskList.addEventListener('click', async (e) => {
    if (e.target.tagName === 'LI') {
        await updateDoc(doc(db, "todos", e.target.id), { completed: true });
    }
    renderTasks();
});

// Render tasks
async function renderTasks() {
    const tasks = await getTasksFromFirestore();
    taskList.innerHTML = "";
    tasks.forEach((task) => {
        if (!task.data().completed) {
            const taskItem = document.createElement("li");
            taskItem.id = task.id;
            taskItem.textContent = task.data().text;
            taskList.appendChild(taskItem);
        }
    });
}

async function addTaskToFirestore(taskText) {
    const docRef = await addDoc(collection(db, "todos"), {
        text: taskText,
        completed: false
    });
    return docRef.id;
}

async function getTasksFromFirestore() {
    const data = await getDocs(collection(db, "todos"));
    let userData = [];
    data.forEach((doc) => {
        userData.push(doc);
    });
    return userData;
}

function sanitizeInput(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

function createLiTask(id, text) {
    const taskItem = document.createElement("li");
    taskItem.id = id;
    taskItem.textContent = text;
    taskItem.tabIndex = 0;
    taskList.appendChild(taskItem);
}

// AI chatbot interaction
aiButton.addEventListener('click', async () => {
    const prompt = aiInput.value.trim().toLowerCase();
    if (prompt) {
        const response = await fetch('https://api.example.com/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ prompt: prompt })
        });
        const data = await response.json();
        const message = document.createElement('div');
        message.textContent = data.reply;
        chatHistory.appendChild(message);
        aiInput.value = '';
    }
});

// Logging and debugging
log.setLevel("info");
log.info("Application started");
log.debug("Debugging information");
log.error("An error occurred");


