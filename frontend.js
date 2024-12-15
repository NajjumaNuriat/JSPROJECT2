// Add employee via API
async function addEmployee(item) {
  try {
    const response = await fetch("/api/employee", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });
    const result = await response.json();

    // Check for error or success
    if (result.error) {
      displayMessage({ error: result.error });
    } else {
      displayMessage({
        success: `Employee added: ID ${result.id}, Name: ${result.name}, Age: ${result.age}`,
      });
    }
  } catch (error) {
    displayMessage({ error: "Error adding employee: " + error.message });
  }
}

// Get employee by ID via API
async function getEmployeeById(id) {
  try {
    const response = await fetch(`/api/employee/${id}`);
    const result = await response.json();

    if (result.error) {
      displayMessage({ error: result.error });
    } else {
      displayMessage({
        success: `Employee found: ID ${result.id}, Name: ${result.name}, Age: ${result.age}`,
      });
    }
  } catch (error) {
    displayMessage({ error: "Error fetching employee: " + error.message });
  }
}

// Update employee via API
async function updateEmployee(id, updatedFields) {
  try {
    const response = await fetch(`/api/employee/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFields),
    });
    const result = await response.json();

    if (result.error) {
      displayMessage({ error: result.error });
    } else {
      displayMessage({
        success: `Employee updated: ID ${result.id}, Name: ${result.name}, Age: ${result.age}`,
      });
    }
  } catch (error) {
    displayMessage({ error: "Error updating employee: " + error.message });
  }
}

// Delete employee by ID via API
async function deleteEmployeeById(id) {
  try {
    const response = await fetch(`/api/employee/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (result.error) {
      displayMessage({ error: result.error });
    } else {
      displayMessage({ success: `Employee with ID ${id} deleted.` });
    }
  } catch (error) {
    displayMessage({ error: "Error deleting employee: " + error.message });
  }
}

// Show all employees
async function displayAllEmployees() {
  try {
    const response = await fetch("/api/employees");
    const employees = await response.json();
    let output = "<h3>All Employees</h3><ul>";
    employees.forEach((employee) => {
      output += `<li>ID: ${employee.id}, Name: ${employee.name}, Age: ${employee.age}</li>`;
    });
    output += "</ul>";
    document.getElementById("output").innerHTML = output;
  } catch (error) {
    displayMessage({ error: "Error fetching employees: " + error.message });
  }
}

// Clear all employees
async function clearAllEmployees() {
  try {
    const response = await fetch("/api/employees", {
      method: "DELETE",
    });
    const result = await response.json();

    if (result.error) {
      displayMessage({ error: result.error });
    } else {
      displayMessage({ success: "All employees have been removed." });
    }
  } catch (error) {
    displayMessage({ error: "Error clearing employees: " + error.message });
  }
}

// Display messages
function displayMessage(message) {
  const output = document.getElementById("output");
  if (message.error) {
    output.innerHTML = `<p class="error">${message.error}</p>`;
  } else if (message.success) {
    output.innerHTML = `<p class="success">${message.success}</p>`;
  } else {
    output.innerHTML = `<p class="success">${JSON.stringify(message)}</p>`;
  }
}

// Event listeners
document.getElementById("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const age = parseInt(document.getElementById("age").value);
  addEmployee({ name, age });
});

document.getElementById("getForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById("getId").value);
  getEmployeeById(id);
});

document.getElementById("updateForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById("updateId").value);
  const name = document.getElementById("updateName").value;
  const age = document.getElementById("updateAge").value;
  const updatedFields = {};
  if (name) updatedFields.name = name;
  if (age) updatedFields.age = parseInt(age);
  updateEmployee(id, updatedFields);
});

document.getElementById("deleteForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById("deleteId").value);
  deleteEmployeeById(id);
});
