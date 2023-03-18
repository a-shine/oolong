function addTaskRemote(task: Task) {
  var response = fetch("http://localhost:8000/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });
}

function addTask(task: Task) {
  addTaskRemote(task);
  addTaskLocal(task);
}

function getPersistentLastSynced() {
  return localStorage.getItem("lastSynced");
}

function setPersistentLastSynced() {
  localStorage.setItem("lastSynced", new Date().toISOString());
}

function getRemoteTasks(): Promise<Task[]> {
  return fetch("http://localhost:8000/tasks")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data;
    });
}

function getRemoteLastUpdated(lastSynced): Promise<Task[]> {
  return fetch("http://localhost:8000/tasks/updatedSince", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lastSynced: lastSynced }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}

// Eventually the database will clear out old tasks so have a period full sync of the database in case (or keep a record of replicas)
function getRemoteDeletedSince(lastSynced): Promise<Task[]> {
  return fetch("http://localhost:8000/tasks/deletedSince", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lastSynced: lastSynced }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}

function syncWithRemote() {
  // let remoteTasks: Task[] = [];
  let lastSynced = getPersistentLastSynced();
  if (lastSynced) {
    Promise.all([
      getRemoteLastUpdated(lastSynced),
      getRemoteDeletedSince(lastSynced),
    ]).then((tasks) => {
      createOrUppdateTasks(tasks[0]);
      deleteTasks(tasks[1]);
      setPersistentLastSynced();
      getTasksToDisplay();
    });
  } else {
    getRemoteTasks().then((tasks) => {
      createOrUppdateTasks(tasks);
      setPersistentLastSynced();
      getTasksToDisplay();
    });
  }
}

// Show a notification offline (by scheduling it) is not supported yet
// https://chromestatus.com/feature/5133150283890688
// function showNotification() {
//   if ("showTrigger" in Notification.prototype) {
//     /* Notification Triggers supported */
//     console.log("Notification Triggers supported");
//   }
//   Notification.requestPermission((result) => {
//     if (result === "granted") {
//       navigator.serviceWorker.ready.then((registration) => {
//         registration.showNotification("Vibration Sample", {
//           body: "Buzz! Buzz!",
//           icon: "../images/touch/chrome-touch-icon-192x192.png",
//           vibrate: [200, 100, 200, 100, 200, 100, 200],
//           tag: "vibration-sample",
//           showTrigger: new TimestampTrigger(10),
//         });
//       });
//     }
//   });
// }
