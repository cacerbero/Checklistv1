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

// Call in the event listener for page load
async function getApiKey() {
    const docRef = doc(db, "apikeys", "googlegenai");
    let snapshot = await getDoc(docRef);
    apiKey = snapshot.data().key;
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
    s.register(sw.href, {
        scope: '/CheckListv1/'
    })
    .then(_ => console.log('Service Worker Registered for scope:', sw.href, 'with', import.meta.url))
    .catch(err => console.error('Service Worker Error:', err));
}
console.log('Service Worker setup is working..');

const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

window.addEventListener('load', () => {
    renderTasks();
});

// Add Task
addTaskBtn.addEventListener('click', async () => {
    const task = taskInput.value.trim();
    if (task) {
        const taskText = sanitizeInput(task);
        if (taskText) {
            let taskId = await addTaskToFirestore(taskText);
            createLiTask(taskId, taskText);
            taskInput.value = "";
        } else {
            alert("Please enter task!");
        }
    }
    renderTasks();
});

// Remove Task
taskList.addEventListener('click', async (e) => {
    if (e.target.tagName === 'LI') {
        await updateDoc(doc(db, "todos", e.target.id), {
            completed: true
        });
    }
    renderTasks();
});

// Render Task
async function renderTasks() {
    var tasks = await getTasksFromFirestore();
    taskList.innerHTML = "";

    tasks.forEach((task) => {
        if(!task.data().completed){
            const taskItem = document.createElement("li");
            taskItem.id = task.id;
            taskItem.textContent = task.data().text;
            taskList.appendChild(taskItem);
        }
    });
}

async function addTaskToFirestore(taskText) {
    let docRef = await addDoc(collection(db, "todos"), {
        text: taskText,
        completed: false
    });
    return docRef.id;
}

async function getTasksFromFirestore() {
    var data = await getDocs(collection(db, "todos"));
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
    let taskItem = document.createElement("li");
    taskItem.id = id;
    taskItem.textContent = text;
    taskItem.tabIndex = 0;
    taskList.appendChild(taskItem);
}

// Allow task addition on enter key while in task input
taskInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        addTaskBtn.click();
    }
});

// Allow tasks to be completed on enter
taskList.addEventListener("keypress", async function(e) {
    if (e.target.tagName === 'LI' && e.key === "Enter") {
        await updateDoc(doc(db, "todos", e.target.id), {
            completed: true
        });
    }
    renderTasks();
});

// Global error handler
window.addEventListener('error', function (event) {
    console.error('Error occurred: ', event.message);
});

// Loglevel setup
log.setLevel("info");

// Example logs
log.info("Application started");
log.debug("Debugging information");
log.error("An error occurred");

function ruleChatBot(request) {
    if (request.startsWith("add task")) {
        let task = request.replace("add task", "").trim();
        if (task) {
            addTask(task);
            appendMessage('Task ' + task + ' added!');
        } else {
            appendMessage("Please specify a task to add.");
        }
        return true;
    } else if (request.startsWith("complete")) {
        let taskName = request.replace("complete", "").trim();
        if (taskName) {
            if(removeFromTaskName(taskName)) {
                appendMessage('Task ' + taskName + ' marked as complete.');
            } else {
                appendMessage("Task not found!");
            }
        } else {
            appendMessage("Please specify a task to complete.");
        }
        return true;
    }
    return false;
}

aiButton.addEventListener('click', async () => {
    let prompt = aiInput.value.trim().toLowerCase();
    if(prompt) {
        if(!ruleChatBot(prompt)){
            askChatBot(prompt);
        }
    } else {
        appendMessage("Please enter a prompt");
    }
});

function appendMessage(message) {
    let history = document.createElement("div");
    history.textContent = message;
    history.className = 'history';
    chatHistory.appendChild(history);
    aiInput.value = "";
}

function removeFromTaskName(task) {
    let ele = document.getElementsByName(task);
    if(ele.length == 0){
        return false;
    }
    ele.forEach(e => {
        removeTask(e.id);
        removeVisualTask(e.id);
    });
    return true;
}
