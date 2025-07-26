document.addEventListener('DOMContentLoaded', () => {
  const placeholder = document.getElementById('sidebar');
  if (placeholder) {
    fetch('sidebar.html')
      .then(resp => resp.text())
      .then(html => {
        placeholder.outerHTML = html;
      });
  }
});
