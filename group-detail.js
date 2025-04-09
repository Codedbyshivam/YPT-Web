if (window.location.pathname.includes("group-detail.html")) {
    document.addEventListener("DOMContentLoaded", () => {
      const group = JSON.parse(localStorage.getItem("selectedGroup"));
      const groupNameEl = document.getElementById("groupName");
      const deleteBtn = document.getElementById("deleteGroupBtn");
      const settingsModal = document.getElementById("settingsModal");
      const deleteModal = document.getElementById("deleteConfirmModal");
  
      if (group && group.name) {
        groupNameEl.textContent = group.name;
  
        if (group.owner && deleteBtn) {
          deleteBtn.style.display = "inline-block";
          deleteBtn.addEventListener("click", () => {
            deleteModal.style.display = "flex";
          });
        } else if (deleteBtn) {
          deleteBtn.style.display = "none";
        }
      }
  
      // ✅ Modal logic for Settings
      window.openSettings = () => {
        settingsModal.style.display = "flex";
      };
      window.closeSettings = () => {
        settingsModal.style.display = "none";
      };
  
      // ✅ Modal logic for Delete
      window.closeDeleteModal = () => {
        deleteModal.style.display = "none";
      };
  
      window.confirmGroupDelete = () => {
        let userGroups = JSON.parse(localStorage.getItem("userGroups")) || [];
        const updatedGroups = userGroups.filter(g => g.name !== group.name);
        localStorage.setItem("userGroups", JSON.stringify(updatedGroups));
        localStorage.removeItem("selectedGroup");
        window.location.href = "main.html";
      };
  
      // ✅ Close modals when clicking outside
      window.addEventListener("click", (event) => {
        if (event.target === settingsModal) closeSettings();
        if (event.target === deleteModal) closeDeleteModal();
      });
    });
  }
  