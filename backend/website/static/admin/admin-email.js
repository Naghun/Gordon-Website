document.addEventListener('DOMContentLoaded', () => {
  const field = document.querySelector('.email-reply-input');
  if (!field) return;
  const tools = document.createElement('div');
  tools.className = 'email-reply-tools';
  tools.innerHTML = '<span>ODGOVOR</span><button type="button">Pošalji</button>';
  field.parentElement.insertBefore(tools, field);
  tools.querySelector('button').addEventListener('click', () => {
    if (!field.value.trim()) { field.focus(); return; }
    const saveButton = document.querySelector('.submit-row input[name="_save"]');
    if (saveButton) saveButton.click();
  });
});
