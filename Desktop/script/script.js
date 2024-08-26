document.addEventListener("DOMContentLoaded", () => {
  const terminalIcon = document.getElementById("terminal-icon");
  const container = document.querySelector(".container");

  // Create the terminal window
  const terminalWindow = document.createElement("div");
  terminalWindow.className = "terminal-window";

  const terminalHeader = document.createElement("div");
  terminalHeader.className = "terminal-header";
  terminalHeader.innerHTML = `
      <span>Terminal</span>
      <button class="terminal-close"></button>
    `;

  const terminalContent = document.createElement("div");
  terminalContent.className = "terminal-content";
  terminalContent.innerHTML = `
      <p>Last login: <time datetime="2024-08-26T22:13:00">Tue Aug 26 22:13:00</time></p>
      <p>~$</p>
    `;

  terminalWindow.appendChild(terminalHeader);
  terminalWindow.appendChild(terminalContent);
  container.appendChild(terminalWindow);

  // Open terminal window on icon click
  terminalIcon.addEventListener("click", () => {
    terminalWindow.style.display = "block";
  });

  // Close terminal window
  terminalHeader
    .querySelector(".terminal-close")
    .addEventListener("click", () => {
      terminalWindow.style.display = "none";
    });

  // Make the terminal window draggable
  let isDragging = false;
  let offsetX, offsetY;

  terminalHeader.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - terminalWindow.offsetLeft;
    offsetY = e.clientY - terminalWindow.offsetTop;
    terminalWindow.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      terminalWindow.style.left = `${e.clientX - offsetX}px`;
      terminalWindow.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    terminalWindow.style.cursor = "default";
  });
});
