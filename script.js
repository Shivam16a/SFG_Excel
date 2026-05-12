const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwKZxC2Nc_yQ_iv0dysL3KYXUwgSjnMgvuJINFul761au9-D4xseJQeWbZBHG75RRJV/exec";

let genderChart;
let studentChart;
let lineChart;

// FORM
const form = document.getElementById("studentForm");

// INPUTS
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const genderInput = document.getElementById("gender");

// TABLE
const tableBody = document.getElementById("tableBody");

// SEARCH
const search = document.getElementById("search");

// LOADER & TOAST
const loader = document.getElementById("loader");
const toast = document.getElementById("toast");

// DATA
let students = [];

// PAGINATION
let currentPage = 1;
const rowsPerPage = 5;

// EDIT
let editRow = null;

// ===========================
// SHOW LOADER
// ===========================

function showLoader() {
    loader.style.display = "block";
}

function hideLoader() {
    loader.style.display = "none";
}

// ===========================
// TOAST
// ===========================

function showToast(message) {

    toast.innerHTML = message;

    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);

}

// ===========================
// FETCH STUDENTS
// ===========================

async function fetchStudents() {

    showLoader();

    const response = await fetch(WEB_APP_URL);

    students = await response.json();

    renderTable();

    updateDashboard();

    renderCharts();

    hideLoader();

}

fetchStudents();

// ===========================
// FORM SUBMIT
// ===========================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    showLoader();

    const student = {

        action: editRow ? "edit" : "add",

        row: editRow,

        studentId: editRow
            ? students.find(s => s.row === editRow).studentId
            : "STU" + Date.now(),

        username: usernameInput.value,

        email: emailInput.value,

        phone: phoneInput.value,

        gender: genderInput.value,

        role: "user"

    };
    // 💾 SAVE USER EMAIL + ROLE IN LOCAL STORAGE
    localStorage.setItem("userRole", "user");
    localStorage.setItem("userEmail", emailInput.value);

    await fetch(WEB_APP_URL, {

        method: "POST",

        body: JSON.stringify(student)

    });

    showToast("Student Saved Successfully");

    form.reset();

    editRow = null;

    fetchStudents();

});

// ===========================
// RENDER TABLE
// ===========================

function renderTable() {

    const role = localStorage.getItem("userRole") || "user";
    const userEmail = localStorage.getItem("userEmail");

    tableBody.innerHTML = "";

    let filteredStudents = students.filter(student =>
        (student.username || "")
            .toLowerCase()
            .includes(search.value.toLowerCase())
    );

    const start = (currentPage - 1) * rowsPerPage;

    const end = start + rowsPerPage;

    const paginatedStudents =
        filteredStudents.slice(start, end);

    paginatedStudents.forEach(student => {

        let isAdmin = role === "admin";

        tableBody.innerHTML += `

      <tr>

        <td>${student.studentId}</td>

        <td>${student.username}</td>

        <td>${student.email}</td>

        <td>${student.phone}</td>

        <td>${student.gender}</td>

        <td>

                ${isAdmin ? `
                    <button onclick='editStudent(${JSON.stringify(student)})'>Edit</button>
                    <button onclick='deleteStudent(${student.row})'>Delete</button>
                ` : `
                    <span style="color:gray;">View Only</span>
                `}

            </td>
      </tr>

    `;

    });

    document.getElementById("pageInfo").innerHTML =
        currentPage;

}

// ===========================
// SEARCH
// ===========================

search.addEventListener("input", () => {

    currentPage = 1;

    renderTable();

});

// ===========================
// DASHBOARD
// ===========================

function updateDashboard() {

    document.getElementById("totalStudents").innerHTML =
        students.length;

    document.getElementById("maleCount").innerHTML =
        students.filter(student =>
            student.gender === "Male"
        ).length;

    document.getElementById("femaleCount").innerHTML =
        students.filter(student =>
            student.gender === "Female"
        ).length;

}

// ===========================
// EDIT STUDENT
// ===========================

function editStudent(student) {

    editRow = student.row;

    usernameInput.value = student.username;

    emailInput.value = student.email;

    phoneInput.value = student.phone;

    genderInput.value = student.gender;

    document.getElementById("submitBtn").innerHTML =
        "Update Student";

}

// ===========================
// DELETE STUDENT
// ===========================

async function deleteStudent(row) {

    if (confirm("Delete this student?")) {

        showLoader();

        await fetch(WEB_APP_URL, {

            method: "POST",

            body: JSON.stringify({

                action: "delete",

                row: row

            })

        });

        showToast("Student Deleted");

        fetchStudents();

    }

}

// ===========================
// PAGINATION
// ===========================

document.getElementById("nextBtn")
    .addEventListener("click", () => {

        currentPage++;

        renderTable();

    });

document.getElementById("prevBtn")
    .addEventListener("click", () => {

        if (currentPage > 1) {

            currentPage--;

            renderTable();

        }

    });

// ===========================
// DARK MODE
// ===========================

document.getElementById("darkBtn")
    .addEventListener("click", () => {

        document.body.classList.toggle("dark");

    });

function renderCharts() {

    const maleCount =
        students.filter(s => s.gender === "Male").length;

    const femaleCount =
        students.filter(s => s.gender === "Female").length;

    const otherCount =
        students.filter(s => s.gender === "Other").length;

    // DESTROY OLD CHARTS

    if (genderChart) {
        genderChart.destroy();
    }

    if (studentChart) {
        studentChart.destroy();
    }

    if (lineChart) {
        lineChart.destroy();
    }

    // =========================
    // PIE CHART
    // =========================

    const genderCtx =
        document.getElementById("genderChart");

    genderChart = new Chart(genderCtx, {

        type: "pie",

        data: {

            labels: [
                "Male",
                "Female",
                "Other"
            ],

            datasets: [{

                data: [
                    maleCount,
                    femaleCount,
                    otherCount
                ],

                backgroundColor: [
                    "#3b82f6",
                    "#ec4899",
                    "#10b981"
                ]

            }]

        }

    });

    // =========================
    // BAR CHART
    // =========================

    const studentCtx =
        document.getElementById("studentChart");

    studentChart = new Chart(studentCtx, {

        type: "bar",

        data: {

            labels: [
                "Total",
                "Male",
                "Female",
                "Other"
            ],

            datasets: [{

                label: "Students",

                data: [
                    students.length,
                    maleCount,
                    femaleCount,
                    otherCount
                ],

                backgroundColor: [
                    "#6366f1",
                    "#3b82f6",
                    "#ec4899",
                    "#10b981"
                ],

                borderRadius: 10

            }]

        },

        options: {
            responsive: true
        }

    });

    // =========================
    // LINE CHART
    // =========================

    const lineCtx =
        document.getElementById("lineChart");

    // LAST 7 STUDENTS

    const labels = students.map((s, index) =>
        "Student " + (index + 1)
    );

    const growthData = students.map((s, index) =>
        index + 1
    );

    lineChart = new Chart(lineCtx, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: "Student Growth",

                data: growthData,

                borderColor: "#4f46e5",

                backgroundColor: "rgba(79,70,229,0.2)",

                fill: true,

                tension: 0.4,

                pointBackgroundColor: "#4f46e5",

                pointRadius: 5

            }]

        },

        options: {

            responsive: true,

            plugins: {
                legend: {
                    display: true
                }
            },

            scales: {

                y: {
                    beginAtZero: true
                }

            }

        }

    });

}

function validateRole() {

    const currentEmail = localStorage.getItem("userEmail");
    const localRole = localStorage.getItem("userRole") || "user";

    const serverUser = students.find(s => s.email === currentEmail);

    if (!serverUser) return;

    // ❌ MISMATCH DETECTED
    if (serverUser.role !== localRole) {

        showWarning();

    }
}

function showWarning() {

    const warningBox = document.createElement("div");

    warningBox.innerHTML = `
        ⚠️ You are performing an unethical task on this platform.
        Role mismatch detected.
    `;

    warningBox.style.position = "fixed";
    warningBox.style.top = "20px";
    warningBox.style.left = "50%";
    warningBox.style.transform = "translateX(-50%)";
    warningBox.style.background = "red";
    warningBox.style.color = "white";
    warningBox.style.padding = "15px";
    warningBox.style.borderRadius = "10px";
    warningBox.style.zIndex = "9999";

    document.body.appendChild(warningBox);

    // optional auto remove
    setTimeout(() => warningBox.remove(), 5000);
}

fetchStudents().then(() => {
    validateRole();
});

